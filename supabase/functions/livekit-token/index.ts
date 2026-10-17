import { createClient } from "npm:@supabase/supabase-js@2";
import { AccessToken } from "npm:livekit-server-sdk@2";

// CORS restricted to production domain only
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://alarabiyahlearningcenter.github.io",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. Verify the authenticated user via Supabase Auth
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Extract client request (roomName only)
    const { roomName } = await req.json();
    if (!roomName || typeof roomName !== "string") {
      return new Response(JSON.stringify({ error: "roomName required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const trimmedRoom = roomName.trim();

    // 3. Fetch user's trusted profile (role and name) from DB
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, full_name, email")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return new Response(JSON.stringify({ error: "User profile not found" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 4. Verify the class exists and is active
    const { data: classData, error: classError } = await supabase
      .from("classes")
      .select("id, student_id, teacher_id, status")
      .eq("jitsi_room", trimmedRoom)
      .single();

    if (classError || !classData) {
      return new Response(JSON.stringify({ error: "Class not found for this room" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (classData.status !== "scheduled" && classData.status !== "live") {
      return new Response(JSON.stringify({ error: "Class is not active" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 5. Authorization check based on role
    const userRole = profile.role;
    const isAdmin = userRole === "admin" || userRole === "super-admin";
    const isTeacher = userRole === "teacher";
    const isStudent = userRole === "student";

    let isAuthorized = false;

    if (isAdmin) {
      isAuthorized = true;
    } else if (isTeacher) {
          // Fetch the teacher record associated with this authenticated profile
          const { data: teacherData, error: teacherError } = await supabase
            .from("teachers")
            .select("id")
            .eq("profile_id", user.id)
            .single();

          if (!teacherError && teacherData && classData.teacher_id === teacherData.id) {
            isAuthorized = true;
          }
        } else if (isStudent && classData.student_id === user.id) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return new Response(JSON.stringify({ error: "You are not authorized to join this class" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 6. Generate LiveKit token with appropriate grants
    const API_KEY = Deno.env.get("LIVEKIT_API_KEY")!;
    const API_SECRET = Deno.env.get("LIVEKIT_API_SECRET")!;

    const isPrivileged = isAdmin || isTeacher;

    const at = new AccessToken(API_KEY, API_SECRET, {
      identity: user.id,
      name: profile.full_name || profile.email || "User",
      ttl: "2h",
    });

    at.addGrant({
      roomJoin: true,
      room: trimmedRoom,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
      roomAdmin: isPrivileged,
      roomCreate: isPrivileged,
    });

    const token = await at.toJwt();

    return new Response(
      JSON.stringify({
        token,
        roomName: trimmedRoom,
        url: Deno.env.get("LIVEKIT_URL"),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    // Safe generic error - log details server-side only
    console.error("LiveKit token error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// ============================================
// SUPABASE CONFIG — Central Connection
// ============================================
window.SUPABASE_URL = 'https://vgsgisyneymtszuslftb.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc2dpc3luZXltdHN6dXNsZnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NTg0NjQsImV4cCI6MjEwNjAzNDQ2NH0.HaYptmVnZCbGiOCg1NyYkcdHQDqjXlAHeq_i_bTC6Yk';

if (!window.supabase) {
  console.error('Supabase library not loaded. Include the CDN before this file.');
}

window.db = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

// Helper: Require authentication
window.requireAuth = async function() {
  const { data: { session } } = await window.db.auth.getSession();
  if (!session) {
    const back = encodeURIComponent(window.location.href);
    window.location.href = '/auth/login.html?redirect=' + back;
    return null;
  }
  return session;
};

// Helper: Get current profile
window.getProfile = async function() {
  const session = await window.requireAuth();
  if (!session) return null;
  const { data: profile } = await window.db.from('profiles').select('*').eq('id', session.user.id).single();
  return { session, profile };
};

// Helper: Logout
window.logoutUser = async function() {
  await window.db.auth.signOut();
  window.location.href = '/auth/login.html';
};

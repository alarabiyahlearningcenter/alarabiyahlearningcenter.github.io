(() => {
  const resultEl = document.getElementById("result");
  const input = document.getElementById("certificateId");
  const btn = document.getElementById("verifyBtn");

  const esc = (x) =>
    String(x ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
    }[c]));

  const fmtDate = (iso, lang) => {
    if (!iso) return "";
    try {
      const d = new Date(iso + "T00:00:00");
      return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-GB", {
        year: "numeric", month: "long", day: "numeric",
      });
    } catch (e) { return iso; }
  };

  const T = {
    required: { en: "Certificate ID required", bn: "Certificate ID লিখুন" },
    requiredBody: { en: "Please enter a Certificate ID to verify.", bn: "যাচাই করতে একটি Certificate ID লিখুন।" },
    notConfiguredTitle: { en: "Verification not connected", bn: "যাচাই ব্যবস্থা এখনো সংযুক্ত হয়নি" },
    notConfiguredBody: { en: "This page hasn't been connected to the certificate database yet. Please contact Al-Arabiyah Learning Center.", bn: "এই পেজটি এখনো সার্টিফিকেট ডাটাবেসের সাথে সংযুক্ত হয়নি। অনুগ্রহ করে Al-Arabiyah Learning Center-এর সাথে যোগাযোগ করুন।" },
    checkingTitle: { en: "Checking…", bn: "যাচাই করা হচ্ছে…" },
    checkingBody: { en: "Please wait a moment.", bn: "একটু অপেক্ষা করুন।" },
    unavailableTitle: { en: "Verification unavailable", bn: "যাচাই করা যাচ্ছে না" },
    unavailableBody: { en: "Something went wrong. Please try again in a moment.", bn: "কিছু একটা সমস্যা হয়েছে। একটু পর আবার চেষ্টা করুন।" },
    notFoundTitle: { en: "Certificate Not Found", bn: "সার্টিফিকেট খুঁজে পাওয়া যায়নি" },
    notFoundBody: { en: "No valid certificate was found for", bn: "এই আইডির জন্য কোনো বৈধ সার্টিফিকেট পাওয়া যায়নি:" },
    notFoundHint: { en: "Double-check the Certificate ID, or this certificate may have been revoked. If you believe this is an error, contact us on WhatsApp.", bn: "Certificate ID ঠিক আছে কিনা আবার দেখুন, অথবা সার্টিফিকেটটি revoke করা হয়ে থাকতে পারে। এটি ভুল মনে হলে WhatsApp-এ যোগাযোগ করুন।" },
    verifiedTitle: { en: "Certificate Verified", bn: "সার্টিফিকেট যাচাইকৃত" },
    verifiedBody: { en: "This certificate is authentic and on record with Al-Arabiyah Learning Center.", bn: "এই সার্টিফিকেটটি আসল এবং Al-Arabiyah Learning Center-এর রেকর্ডে আছে।" },
    lblId: { en: "Certificate ID", bn: "সার্টিফিকেট আইডি" },
    lblStatus: { en: "Status", bn: "স্ট্যাটাস" },
    lblValid: { en: "Valid", bn: "বৈধ" },
    lblStudent: { en: "Student", bn: "শিক্ষার্থী" },
    lblCert: { en: "Certificate", bn: "সার্টিফিকেট" },
    lblCourse: { en: "Course", bn: "কোর্স" },
    lblDate: { en: "Issue Date", bn: "ইস্যুর তারিখ" },
    idle: { en: "Enter a Certificate ID above, or open this page from a QR code.", bn: "উপরে একটি Certificate ID লিখুন, অথবা QR কোড থেকে এই পেজটি খুলুন।" },
  };

  let lastState = { kind: "idle" };
  let currentLang = "en";

  function t(key) { return T[key][currentLang] || T[key].en; }

  function render() {
    if (!resultEl) return;
    const s = lastState;
    if (s.kind === "idle") {
      resultEl.className = "status";
      resultEl.innerHTML = esc(t("idle"));
    } else if (s.kind === "required") {
      resultEl.className = "status invalid";
      resultEl.innerHTML = `<h2>${t("required")}</h2><p>${t("requiredBody")}</p>`;
    } else if (s.kind === "not-configured") {
      resultEl.className = "status invalid";
      resultEl.innerHTML = `<h2>${t("notConfiguredTitle")}</h2><p>${t("notConfiguredBody")}</p>`;
    } else if (s.kind === "checking") {
      resultEl.className = "status";
      resultEl.innerHTML = `<h2>${t("checkingTitle")}</h2><p>${t("checkingBody")}</p>`;
    } else if (s.kind === "error") {
      resultEl.className = "status invalid";
      resultEl.innerHTML = `<h2>${t("unavailableTitle")}</h2><p>${t("unavailableBody")}</p>`;
    } else if (s.kind === "not-found") {
      resultEl.className = "status invalid";
      resultEl.innerHTML = `<h2>✕ ${t("notFoundTitle")}</h2><p>${t("notFoundBody")} <b>${esc(s.id)}</b>.</p><p>${t("notFoundHint")}</p>`;
    } else if (s.kind === "valid") {
      const d = s.data;
      resultEl.className = "status valid";
      resultEl.innerHTML = `
        <h2>✓ ${t("verifiedTitle")}</h2>
        <p>${t("verifiedBody")}</p>
        <div class="grid">
          <div class="item"><div class="label">${t("lblId")}</div><div class="value">${esc(d.certificate_id)}</div></div>
          <div class="item"><div class="label">${t("lblStatus")}</div><div class="value">${t("lblValid")}</div></div>
          <div class="item"><div class="label">${t("lblStudent")}</div><div class="value">${esc(d.student_name)}</div></div>
          <div class="item"><div class="label">${t("lblCert")}</div><div class="value">${esc(d.certificate_type)}</div></div>
          <div class="item"><div class="label">${t("lblCourse")}</div><div class="value">${esc(d.course_name)}</div></div>
          <div class="item"><div class="label">${t("lblDate")}</div><div class="value">${esc(fmtDate(d.issue_date, currentLang))}</div></div>
        </div>`;
    }
  }

  window.ALC_onLangChange = function (lang) {
    currentLang = lang;
    render();
  };

  async function go(idRaw) {
    const id = (idRaw || "").trim().toUpperCase();
    if (input) input.value = id;

    if (!id) {
      lastState = { kind: "required" };
      return render();
    }

    if (!window.supabase || !window.ALC_SUPABASE_URL || window.ALC_SUPABASE_URL.startsWith("YOUR_")) {
      lastState = { kind: "not-configured" };
      return render();
    }

    lastState = { kind: "checking" };
    render();

    let client;
    try {
      client = supabase.createClient(window.ALC_SUPABASE_URL, window.ALC_SUPABASE_KEY);
    } catch (e) {
      lastState = { kind: "error" };
      return render();
    }

    const q = await client
      .from("certificates")
      .select("certificate_id,student_name,certificate_type,course_name,issue_date,status")
      .eq("certificate_id", id)
      .eq("status", "valid")
      .maybeSingle();

    if (q.error) {
      lastState = { kind: "error" };
      return render();
    }
    if (!q.data) {
      lastState = { kind: "not-found", id };
      return render();
    }
    lastState = { kind: "valid", data: q.data };
    render();
  }

  if (btn) btn.onclick = () => go(input.value);
  if (input) input.onkeydown = (e) => { if (e.key === "Enter") go(input.value); };

  const urlId = new URLSearchParams(location.search).get("id");
  if (urlId) {
    go(urlId);
  } else {
    render();
  }
})();

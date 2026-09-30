// ==== CERT_PDF_ADDON_V1 ====
(function () {
  'use strict';
  if (window.__certPdfAddonLoaded) return;
  window.__certPdfAddonLoaded = true;

  async function getSession() {
    for (let i = 0; i < 30; i++) {
      const db = window.db || window.supabase;
      if (db?.auth) {
        const { data } = await db.auth.getSession();
        if (data?.session) return { db, user: data.session.user };
      }
      await new Promise(r => setTimeout(r, 300));
    }
    return null;
  }

  async function getCerts(db, userId) {
    const { data, error } = await db.from('certificates')
      .select('*').eq('student_id', userId)
      .order('issued_at', { ascending: false });
    if (error) { console.warn('[CertPDF-addon]', error); return []; }
    return data || [];
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function buildFab() {
    const b = document.createElement('button');
    b.id = 'certPdfFab';
    b.innerHTML = '📄 PDF';
    b.style.cssText = `
      position:fixed;bottom:88px;right:20px;z-index:9998;
      padding:12px 18px;border-radius:999px;
      background:#0A3622;color:#D4AF37;font-weight:700;
      box-shadow:0 8px 24px rgba(10,54,34,.35);border:2px solid #D4AF37;
      font-family:Inter,sans-serif;font-size:14px;cursor:pointer;
    `;
    document.body.appendChild(b);
    return b;
  }

  function buildModal(certs) {
    const wrap = document.createElement('div');
    wrap.id = 'certPdfModal';
    wrap.style.cssText = `position:fixed;inset:0;z-index:9999;
      background:rgba(10,54,34,.7);backdrop-filter:blur(4px);
      display:flex;align-items:center;justify-content:center;padding:20px;
      font-family:Inter,sans-serif;`;
    const panel = document.createElement('div');
    panel.style.cssText = `background:#F9F7F2;border-radius:20px;padding:24px;
      max-width:480px;width:100%;max-height:80vh;overflow:auto;
      box-shadow:0 24px 64px rgba(0,0,0,.4);`;
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <h3 style="margin:0;color:#0A3622;font-family:'Playfair Display',serif;font-size:22px">My Certificates</h3>
        <button id="certPdfClose" style="background:none;border:none;font-size:24px;cursor:pointer;color:#666">&times;</button>
      </div>
      <div id="certPdfList"></div>`;
    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    const list = panel.querySelector('#certPdfList');
    if (!certs.length) {
      list.innerHTML = '<p style="color:#666;text-align:center;padding:24px">No certificates yet. Complete a course to earn one.</p>';
    } else {
      list.innerHTML = certs.map((c, i) => `
        <div style="background:#fff;border:1px solid rgba(10,54,34,.1);border-radius:14px;padding:14px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:10px">
          <div style="flex:1;min-width:0">
            <div style="font-weight:700;color:#0A3622;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.course_name || 'Course')}</div>
            <div style="font-size:11px;color:#666;margin-top:2px">${esc(c.certificate_id || c.id)}</div>
          </div>
          <button data-idx="${i}" class="certPdfDl" style="background:#0A3622;color:#D4AF37;border:none;padding:8px 14px;border-radius:999px;font-weight:600;font-size:13px;cursor:pointer;white-space:nowrap">⬇ PDF</button>
        </div>`).join('');
    }

    panel.querySelector('#certPdfClose').onclick = () => wrap.remove();
    wrap.onclick = (e) => { if (e.target === wrap) wrap.remove(); };

    panel.querySelectorAll('.certPdfDl').forEach(btn => {
      btn.onclick = async () => {
        const cert = certs[+btn.dataset.idx];
        btn.disabled = true; btn.textContent = '⏳ …';
        try {
          if (!window.CertPDF) throw new Error('CertPDF not loaded');
          await window.CertPDF.download(cert);
          btn.textContent = '✅ Done';
        } catch (e) {
          console.error(e); btn.textContent = '❌ Error';
        }
        setTimeout(() => { btn.textContent = '⬇ PDF'; btn.disabled = false; }, 1800);
      };
    });
  }

  (async function init() {
    try {
      const s = await getSession();
      if (!s) { console.warn('[CertPDF-addon] no session'); return; }
      const certs = await getCerts(s.db, s.user.id);
      console.log('[CertPDF-addon] loaded', certs.length, 'certs');
      buildFab().onclick = () => {
        if (document.getElementById('certPdfModal')) return;
        buildModal(certs);
      };
    } catch (e) { console.warn('[CertPDF-addon]', e); }
  })();
})();
// ==== END CERT_PDF_ADDON_V1 ====

// ==== RECORDING_ADDON_V1 ====
(function () {
  if (window.__recAddonLoaded) return;
  window.__recAddonLoaded = true;

  const isTeacher = /\/teacher\//.test(location.pathname);
  const isStudent = /\/student\//.test(location.pathname);
  if (!isTeacher && !isStudent) return;

  console.log('[RecAddon] mode:', isTeacher ? 'teacher' : 'student');

  // ---------- helpers ----------
  async function getCtx() {
    for (let i = 0; i < 40; i++) {
      const db = window.db || window.supabase;
      if (db?.auth) {
        const { data } = await db.auth.getSession();
        if (data?.session) return { db, user: data.session.user };
      }
      await new Promise(r => setTimeout(r, 250));
    }
    return null;
  }

  function esc(s) {
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return iso; }
  }

  function embedUrl(url) {
    if (!url) return null;
    const u = String(url).trim();
    // YouTube
    let m = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/);
    if (m) return { type: 'iframe', src: 'https://www.youtube.com/embed/' + m[1] };
    // Google Drive
    m = u.match(/drive\.google\.com\/(?:file\/d\/|open\?id=)([A-Za-z0-9_-]{10,})/);
    if (m) return { type: 'iframe', src: 'https://drive.google.com/file/d/' + m[1] + '/preview' };
    // Vimeo
    m = u.match(/vimeo\.com\/(\d+)/);
    if (m) return { type: 'iframe', src: 'https://player.vimeo.com/video/' + m[1] };
    // Direct video
    if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(u)) return { type: 'video', src: u };
    // Fallback
    return { type: 'link', src: u };
  }

  // ---------- data ----------
  async function fetchClasses(ctx) {
    const col = isTeacher ? 'teacher_id' : 'student_id';
    let q = ctx.db.from('classes')
      .select('id, title, status, scheduled_at, duration_min, recording_url, recording_added_at, jitsi_room')
      .eq(col, ctx.user.id)
      .order('scheduled_at', { ascending: false })
      .limit(100);
    const { data, error } = await q;
    if (error) { console.warn('[RecAddon] fetch:', error); return []; }
    return data || [];
  }

  // ---------- UI ----------
  function buildFab() {
    const b = document.createElement('button');
    b.id = 'recFab';
    b.innerHTML = '🎥 Recordings';
    b.style.cssText = `
      position:fixed;bottom:20px;right:20px;z-index:9997;
      padding:12px 18px;border-radius:999px;
      background:#0A3622;color:#D4AF37;font-weight:700;
      box-shadow:0 8px 24px rgba(10,54,34,.4);border:2px solid #D4AF37;
      font-family:Inter,sans-serif;font-size:14px;cursor:pointer;
    `;
    document.body.appendChild(b);
    return b;
  }

  function buildListModal(ctx, classes, onRefresh) {
    const wrap = document.createElement('div');
    wrap.id = 'recModal';
    wrap.style.cssText = `position:fixed;inset:0;z-index:9998;
      background:rgba(10,54,34,.75);backdrop-filter:blur(4px);
      display:flex;align-items:center;justify-content:center;padding:16px;
      font-family:Inter,sans-serif;`;
    const panel = document.createElement('div');
    panel.style.cssText = `background:#F9F7F2;border-radius:20px;padding:20px;
      max-width:640px;width:100%;max-height:85vh;overflow:auto;
      box-shadow:0 24px 64px rgba(0,0,0,.5);`;

    const completed = classes.filter(c => c.status === 'completed');
    const upcoming = classes.filter(c => c.status !== 'completed').slice(0, 15);

    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div>
          <h3 style="margin:0;color:#0A3622;font-family:'Playfair Display',serif;font-size:22px">
            ${isTeacher ? 'Manage Recordings' : 'Class Recordings'}
          </h3>
          <p style="margin:2px 0 0;font-size:12px;color:#666">
            ${isTeacher ? 'Add or edit recording links for completed classes' : 'Watch recordings of your completed classes'}
          </p>
        </div>
        <button id="recClose" style="background:none;border:none;font-size:26px;cursor:pointer;color:#666;line-height:1">&times;</button>
      </div>

      <div id="recList"></div>
    `;
    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    const list = panel.querySelector('#recList');

    function render() {
      if (!completed.length) {
        list.innerHTML = '<p style="text-align:center;color:#666;padding:24px 0">No completed classes yet.</p>';
      } else {
        list.innerHTML = completed.map(c => {
          const has = !!c.recording_url;
          return `
            <div style="background:#fff;border-radius:14px;padding:14px;margin-bottom:10px;border:1px solid rgba(10,54,34,.1)">
              <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:8px">
                <div style="flex:1;min-width:0">
                  <div style="font-weight:700;color:#0A3622;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                    ${esc(c.title || 'Class')}
                  </div>
                  <div style="font-size:11px;color:#666;margin-top:2px">
                    📅 ${esc(fmtDate(c.scheduled_at))} · ${c.duration_min || '?'} min
                  </div>
                </div>
                <span style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:999px;background:${has ? '#dcfce7;color:#166534' : '#fef3c7;color:#92400e'};white-space:nowrap">
                  ${has ? '🎥 Ready' : '⏳ Pending'}
                </span>
              </div>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                ${has ? `
                  <button data-act="watch" data-id="${c.id}" style="flex:1;min-width:110px;background:#0A3622;color:#D4AF37;border:none;padding:8px 12px;border-radius:999px;font-weight:600;font-size:12px;cursor:pointer">
                    ▶ Watch
                  </button>
                ` : ''}
                ${isTeacher ? `
                  <button data-act="edit" data-id="${c.id}" style="flex:1;min-width:110px;background:${has ? '#fff' : '#D4AF37'};color:#0A3622;border:${has ? '1px solid #0A3622' : 'none'};padding:8px 12px;border-radius:999px;font-weight:600;font-size:12px;cursor:pointer">
                    ${has ? '✎ Edit Link' : '+ Add Recording'}
                  </button>
                ` : ''}
                ${has && isStudent ? `
                  <a href="${esc(c.recording_url)}" target="_blank" rel="noopener" style="padding:8px 12px;border:1px solid #0A3622;color:#0A3622;border-radius:999px;font-weight:600;font-size:12px;text-decoration:none">
                    ↗ Open
                  </a>
                ` : ''}
              </div>
            </div>`;
        }).join('');
      }

      list.querySelectorAll('button[data-act]').forEach(btn => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          const cls = completed.find(x => x.id === id);
          if (!cls) return;
          if (btn.dataset.act === 'watch') {
            openPlayer(cls);
          } else if (btn.dataset.act === 'edit') {
            openEditor(ctx, cls, async () => {
              wrap.remove();
              await onRefresh();
            });
          }
        };
      });
    }

    render();

    panel.querySelector('#recClose').onclick = () => wrap.remove();
    wrap.onclick = (e) => { if (e.target === wrap) wrap.remove(); };
  }

  function openEditor(ctx, cls, onSaved) {
    const wrap = document.createElement('div');
    wrap.id = 'recEditor';
    wrap.style.cssText = `position:fixed;inset:0;z-index:9999;
      background:rgba(10,54,34,.8);backdrop-filter:blur(4px);
      display:flex;align-items:center;justify-content:center;padding:16px;
      font-family:Inter,sans-serif;`;
    const panel = document.createElement('div');
    panel.style.cssText = `background:#F9F7F2;border-radius:20px;padding:22px;
      max-width:520px;width:100%;box-shadow:0 24px 64px rgba(0,0,0,.5);`;
    panel.innerHTML = `
      <h3 style="margin:0 0 4px;color:#0A3622;font-family:'Playfair Display',serif;font-size:20px">Recording URL</h3>
      <p style="margin:0 0 14px;font-size:12px;color:#666">${esc(cls.title || 'Class')} · ${esc(fmtDate(cls.scheduled_at))}</p>
      <input id="recUrlInput" type="url" placeholder="https://youtu.be/... or Google Drive / MP4 link"
        value="${esc(cls.recording_url || '')}"
        style="width:100%;padding:12px 14px;border:1px solid rgba(10,54,34,.2);border-radius:10px;font-size:13px;font-family:inherit;margin-bottom:12px;box-sizing:border-box">
      <div id="recEditStatus" style="font-size:12px;color:#666;margin-bottom:12px;min-height:16px"></div>
      <div style="display:flex;gap:8px">
        <button id="recSave" style="flex:1;background:#0A3622;color:#D4AF37;border:none;padding:12px;border-radius:999px;font-weight:700;font-size:13px;cursor:pointer">💾 Save</button>
        <button id="recCancel" style="flex:1;background:#fff;color:#0A3622;border:1px solid #0A3622;padding:12px;border-radius:999px;font-weight:600;font-size:13px;cursor:pointer">Cancel</button>
      </div>
    `;
    wrap.appendChild(panel);
    document.body.appendChild(wrap);

    const input = panel.querySelector('#recUrlInput');
    const status = panel.querySelector('#recEditStatus');

    panel.querySelector('#recCancel').onclick = () => wrap.remove();
    wrap.onclick = (e) => { if (e.target === wrap) wrap.remove(); };

    panel.querySelector('#recSave').onclick = async () => {
      const url = input.value.trim();
      if (url && !/^https?:\/\//i.test(url)) {
        status.textContent = '⚠️ URL must start with http:// or https://';
        status.style.color = '#dc2626';
        return;
      }
      status.textContent = '⏳ Saving...';
      status.style.color = '#666';
      const payload = url
        ? { recording_url: url, recording_added_at: new Date().toISOString(), recording_added_by: ctx.user.id }
        : { recording_url: null, recording_added_at: null, recording_added_by: null };
      const { error } = await ctx.db.from('classes').update(payload).eq('id', cls.id);
      if (error) {
        status.textContent = '❌ ' + error.message;
        status.style.color = '#dc2626';
        return;
      }
      status.textContent = '✅ Saved!';
      status.style.color = '#16a34a';
      setTimeout(() => { wrap.remove(); onSaved?.(); }, 900);
    };

    setTimeout(() => input.focus(), 100);
  }

  function openPlayer(cls) {
    const embed = embedUrl(cls.recording_url);
    const wrap = document.createElement('div');
    wrap.style.cssText = `position:fixed;inset:0;z-index:10000;
      background:rgba(0,0,0,.9);display:flex;flex-direction:column;padding:16px;
      font-family:Inter,sans-serif;`;
    wrap.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;color:#fff;margin-bottom:12px">
        <div style="font-size:14px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
          🎥 ${esc(cls.title || 'Class Recording')}
        </div>
        <button id="recPlayerClose" style="background:none;border:none;color:#D4AF37;font-size:28px;cursor:pointer;line-height:1">&times;</button>
      </div>
      <div id="recPlayerBody" style="flex:1;background:#000;border-radius:12px;overflow:hidden;display:flex;align-items:center;justify-content:center"></div>
      <div style="margin-top:10px;text-align:center">
        <a href="${esc(cls.recording_url)}" target="_blank" rel="noopener" style="color:#D4AF37;font-size:12px;text-decoration:none">↗ Open in new tab</a>
      </div>
    `;
    document.body.appendChild(wrap);

    const body = wrap.querySelector('#recPlayerBody');
    if (embed.type === 'iframe') {
      body.innerHTML = `<iframe src="${embed.src}" style="width:100%;height:100%;border:0" allowfullscreen></iframe>`;
    } else if (embed.type === 'video') {
      body.innerHTML = `<video src="${embed.src}" controls autoplay style="width:100%;height:100%"></video>`;
    } else {
      body.innerHTML = `<p style="color:#fff;text-align:center;padding:20px">This link cannot be embedded. <a href="${esc(embed.src)}" target="_blank" style="color:#D4AF37">Open externally →</a></p>`;
    }

    wrap.querySelector('#recPlayerClose').onclick = () => wrap.remove();
  }

  // ---------- boot ----------
  (async function boot() {
    try {
      const ctx = await getCtx();
      if (!ctx) { console.warn('[RecAddon] no session'); return; }

      let cache = [];
      async function refresh() {
        cache = await fetchClasses(ctx);
        console.log('[RecAddon] classes:', cache.length,
          '· with recording:', cache.filter(c => c.recording_url).length);
      }
      await refresh();

      const fab = buildFab();
      fab.onclick = async () => {
        await refresh();
        buildListModal(ctx, cache, refresh);
      };
    } catch (e) {
      console.warn('[RecAddon] boot:', e);
    }
  })();
})();
// ==== END RECORDING_ADDON_V1 ====

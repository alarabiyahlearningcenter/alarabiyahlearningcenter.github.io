// ============================================
// INJECT-BELL — Auto-add notification bell to user headers
// ============================================

(function() {
  const SUPABASE_URL = 'https://vgsgisyneymtszuslftb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc2dpc3luZXltdHN6dXNsZnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NTg0NjQsImV4cCI6MjEwNjAzNDQ2NH0.HaYptmVnZCbGiOCg1NyYkcdHQDqjXlAHeq_i_bTC6Yk';

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(async () => {
    if (!window.supabase) return;

    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Make Notif API available using our client
    if (!window.Notif) {
      window.Notif = {
        async send(userId, title, message, type = 'info', link = null) {
          if (!userId) return;
          return client.from('notifications').insert({ user_id: userId, title, message, type, link });
        },
        async toAdmins(title, message, type = 'info', link = null) {
          const { data: admins } = await client.from('profiles').select('id').in('role', ['admin', 'super_admin']);
          if (!admins || !admins.length) return;
          return client.from('notifications').insert(admins.map(a => ({ user_id: a.id, title, message, type, link })));
        },
        async unreadCount(userId) {
          const { count } = await client.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('is_read', false);
          return count || 0;
        },
        async recent(userId, limit = 8) {
          const { data } = await client.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
          return data || [];
        },
        async markRead(id) { return client.from('notifications').update({ is_read: true }).eq('id', id); },
        async markAllRead(userId) { return client.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false); },
        async remove(id) { return client.from('notifications').delete().eq('id', id); }
      };
    }

    const { data: { session } } = await client.auth.getSession();
    if (!session) return;

    const userBtn = document.getElementById('userMenuBtn');
    if (!userBtn) return;
    if (document.getElementById('notifBellContainer')) return;

    // Find the .flex container (parent of .relative wrapper)
    const relativeWrapper = userBtn.parentNode; // .relative
    const flexContainer = relativeWrapper.parentNode; // .flex items-center gap-3

    if (!flexContainer) return;

    // Create bell container
    const bellContainer = document.createElement('div');
    bellContainer.id = 'notifBellContainer';
    bellContainer.className = 'flex items-center';

    // Insert BEFORE the relative wrapper (so bell sits beside profile, not inside)
    flexContainer.insertBefore(bellContainer, relativeWrapper);

    if (window.NotifBell) {
      bellContainer.innerHTML = window.NotifBell.html();
      await window.NotifBell.mount(session.user.id);
    }
  });
})();

/* BELL-BADGE-V3 - with visible debug banner */
(function() {
    var SUPABASE_URL = 'https://vgsgjsneymetzsuzl1fb.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc2dqc25leW1ldHpzdXpsMWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0NjI4OTQsImV4cCI6MjA0MTAzODg5NH0.gSnsS1xGl0ChIZB5k7oyK3HgL8G4xKv7mR2sB-XLxOk';
    
    function log(msg) {
        var banner = document.getElementById('badgeDebug');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'badgeDebug';
            banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:black;color:#0f0;font-size:11px;padding:5px;z-index:999999;font-family:monospace;line-height:1.4;max-height:80px;overflow-y:auto;';
            document.body.appendChild(banner);
        }
        banner.innerHTML += msg + '<br>';
    }
    
    function attachBadge() {
        log('[1] attachBadge started');
        var bellContainer = document.getElementById('notifBellContainer');
        if (!bellContainer) { 
            log('[2] notifBellContainer NOT found, retrying');
            setTimeout(attachBadge, 300); 
            return; 
        }
        log('[2] notifBellContainer FOUND');
        
        if (document.getElementById('notifBadge')) {
            log('[3] Badge already exists');
            return;
        }
        
        var bellLink = bellContainer.querySelector('a');
        if (!bellLink) { 
            log('[3] bellLink NOT found, retrying');
            setTimeout(attachBadge, 300); 
            return; 
        }
        log('[3] bellLink FOUND');
        
        bellLink.style.position = 'relative';
        bellLink.style.display = 'inline-flex';
        bellLink.style.alignItems = 'center';
        
        var badge = document.createElement('span');
        badge.id = 'notifBadge';
        badge.style.cssText = 'position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;background:#dc2626;color:white;font-size:11px;font-weight:bold;border-radius:9999px;display:flex;align-items:center;justify-content:center;padding:0 5px;box-shadow:0 2px 4px rgba(0,0,0,0.2);z-index:10;line-height:1;';
        badge.textContent = '?';
        bellLink.appendChild(badge);
        log('[4] Badge element added with ?');
        
        if (!window.supabase) {
            log('[5] window.supabase NOT available!');
            return;
        }
        log('[5] supabase available');
        
        var db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        async function updateBadge() {
            try {
                var sRes = await db.auth.getSession();
                var session = sRes.data && sRes.data.session;
                if (!session || !session.user) {
                    log('[6] No session');
                    badge.style.display = 'none';
                    return;
                }
                log('[6] Session: ' + session.user.email);
                var res = await db.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id).eq('is_read', false);
                log('[7] Count result: ' + JSON.stringify(res.count) + ' err: ' + (res.error ? res.error.message : 'none'));
                var count = res.count || 0;
                if (count > 0) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.style.display = 'flex';
                    log('[8] Badge shown with: ' + count);
                } else {
                    badge.style.display = 'none';
                    log('[8] Count is 0, hiding badge');
                }
            } catch(e) {
                log('[ERR] ' + e.message);
            }
        }
        
        updateBadge();
        setInterval(updateBadge, 30000);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(attachBadge, 800); });
    } else {
        setTimeout(attachBadge, 800);
    }
})();

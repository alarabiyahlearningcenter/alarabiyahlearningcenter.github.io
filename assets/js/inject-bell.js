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
window._notifClient = client;

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

/* BELL-BADGE-V5 - uses exposed window._notifClient */
(function() {
    function log(msg) {
        var b = document.getElementById('badgeDebug');
        if (!b) {
            b = document.createElement('div');
            b.id = 'badgeDebug';
            b.style.cssText = 'position:fixed;top:0;left:0;right:0;background:black;color:#0f0;font-size:11px;padding:5px;z-index:999999;font-family:monospace;line-height:1.4;max-height:80px;overflow-y:auto;';
            document.body.appendChild(b);
        }
        b.innerHTML += msg + '<br>';
    }
    
    function attachBadge() {
        log('[1] started');
        var bc = document.getElementById('notifBellContainer');
        if (!bc) { setTimeout(attachBadge, 300); return; }
        log('[2] container found');
        
        document.querySelectorAll('#notifBadge').forEach(function(el) { el.remove(); });
        log('[3] old badges removed');
        
        var bl = bc.querySelector('a');
        if (!bl) { setTimeout(attachBadge, 300); return; }
        log('[4] bellLink found');
        
        bl.style.position = 'relative';
        bl.style.display = 'inline-flex';
        bl.style.alignItems = 'center';
        
        var badge = document.createElement('span');
        badge.id = 'notifBadge';
        badge.style.cssText = 'position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;background:#dc2626;color:white;font-size:12px;font-weight:bold;border-radius:9999px;display:flex;align-items:center;justify-content:center;padding:0 6px;box-shadow:0 2px 6px rgba(0,0,0,0.3);z-index:9999;line-height:1;';
        badge.textContent = '?';
        bl.appendChild(badge);
        log('[5] badge DOM added');
        
        // Wait for client to be exposed
        var tries = 0;
        function waitClient() {
            tries++;
            if (window._notifClient) {
                log('[6] client available after ' + tries + ' tries');
                startCount();
            } else if (tries < 40) {
                setTimeout(waitClient, 250);
            } else {
                log('[ERR] client never appeared');
            }
        }
        waitClient();
        
        function startCount() {
            var db = window._notifClient;
            
            async function updateBadge() {
                try {
                    var sRes = await db.auth.getSession();
                    var session = sRes.data && sRes.data.session;
                    if (!session || !session.user) {
                        log('[7] no session');
                        return;
                    }
                    log('[8] user: ' + session.user.email);
                    var res = await db.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', session.user.id).eq('is_read', false);
                    if (res.error) {
                        log('[9 ERR] ' + res.error.message);
                        return;
                    }
                    var count = res.count || 0;
                    log('[9] count = ' + count);
                    if (count > 0) {
                        badge.textContent = count > 99 ? '99+' : count;
                        badge.style.display = 'flex';
                    } else {
                        badge.style.display = 'none';
                    }
                } catch(e) {
                    log('[ERR] ' + e.message);
                }
            }
            
            updateBadge();
            setInterval(updateBadge, 30000);
        }
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(attachBadge, 800); });
    } else {
        setTimeout(attachBadge, 800);
    }
})();

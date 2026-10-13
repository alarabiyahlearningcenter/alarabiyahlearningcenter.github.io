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

/* BELL-BADGE-V8 - uses exposed client + localStorage diagnostics */
(function() {
    function attachBadge() {
        var bc = document.getElementById('notifBellContainer');
        if (!bc) { setTimeout(attachBadge, 300); return; }
        
        document.querySelectorAll('#notifBadge').forEach(function(el) { el.remove(); });
        
        var bl = bc.querySelector('a');
        if (!bl) { setTimeout(attachBadge, 300); return; }
        
        bl.style.position = 'relative';
        bl.style.display = 'inline-flex';
        bl.style.alignItems = 'center';
        
        var badge = document.createElement('span');
        badge.id = 'notifBadge';
        badge.style.cssText = 'position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;background:#dc2626;color:white;font-size:12px;font-weight:bold;border-radius:9999px;display:flex;align-items:center;justify-content:center;padding:0 6px;box-shadow:0 2px 6px rgba(0,0,0,0.3);z-index:9999;line-height:1;';
        badge.textContent = '.';
        bl.appendChild(badge);
        
        var tries = 0;
        function init() {
            tries++;
            if (tries > 60) {
                badge.textContent = 'TIMEOUT';
                badge.style.fontSize = '8px';
                return;
            }
            
            var c = window._notifClient;
            if (!c) { setTimeout(init, 250); return; }
            
            // Client found
            badge.textContent = '~';
            
            async function updateBadge() {
                try {
                    var sRes = await c.auth.getSession();
                    var s = sRes.data && sRes.data.session;
                    if (!s || !s.user) {
                        // Session not available via client either - check localStorage
                        var keys = [];
                        for (var i = 0; i < localStorage.length; i++) {
                            var k = localStorage.key(i);
                            if (k.indexOf('sb-') === 0) keys.push(k);
                        }
                        badge.textContent = keys.length > 0 ? 'L' : 'N';
                        badge.title = 'localStorage sb keys: ' + keys.join(', ');
                        return;
                    }
                    
                    var res = await c.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', s.user.id).eq('is_read', false);
                    if (res.error) {
                        badge.textContent = 'E';
                        badge.title = 'DB error: ' + res.error.message;
                        return;
                    }
                    var count = res.count || 0;
                    if (count > 0) {
                        badge.textContent = count > 99 ? '99+' : count;
                    } else {
                        badge.style.display = 'none';
                    }
                } catch(e) {
                    badge.textContent = '!';
                    badge.title = e.message;
                }
            }
            
            updateBadge();
            setInterval(updateBadge, 30000);
        }
        
        setTimeout(init, 500);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(attachBadge, 800); });
    } else {
        setTimeout(attachBadge, 800);
    }
})();

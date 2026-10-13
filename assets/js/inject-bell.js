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

/* BELL-BADGE-V6 - Direct REST fetch, no client needed */
(function() {
    var SUPABASE_URL = 'https://vgsgjsneymetzsuzl1fb.supabase.co';
    var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc2dqc25leW1ldHpzdXpsMWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjU0NjI4OTQsImV4cCI6MjA0MTAzODg5NH0.gSnsS1xGl0ChIZB5k7oyK3HgL8G4xKv7mR2sB-XLxOk';
    var SESSION_KEY = 'sb-vgsgjsneymetzsuzl1fb-auth-token';
    
    function getToken() {
        try {
            var raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            var p = JSON.parse(raw);
            return p && p.access_token ? p.access_token : null;
        } catch(e) { return null; }
    }
    
    function getUserId() {
        try {
            var raw = localStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            var p = JSON.parse(raw);
            return p && p.user ? p.user.id : null;
        } catch(e) { return null; }
    }
    
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
        badge.style.cssText = 'position:absolute;top:-4px;right:-4px;min-width:20px;height:20px;background:#dc2626;color:white;font-size:12px;font-weight:bold;border-radius:9999px;display:none;align-items:center;justify-content:center;padding:0 6px;box-shadow:0 2px 6px rgba(0,0,0,0.3);z-index:9999;line-height:1;';
        bl.appendChild(badge);
        
        async function updateBadge() {
            try {
                var token = getToken();
                var userId = getUserId();
                if (!token || !userId) return;
                
                var url = SUPABASE_URL + '/rest/v1/notifications?select=id&user_id=eq.' + userId + '&is_read=eq.false';
                var res = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'apikey': SUPABASE_ANON_KEY,
                        'Authorization': 'Bearer ' + token,
                        'Prefer': 'count=exact',
                        'Range-Unit': 'items',
                        'Range': '0-0'
                    }
                });
                var rangeHeader = res.headers.get('content-range');
                if (!rangeHeader) return;
                var count = parseInt(rangeHeader.split('/')[1], 10);
                if (isNaN(count)) count = 0;
                
                if (count > 0) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.style.display = 'flex';
                } else {
                    badge.style.display = 'none';
                }
            } catch(e) {
                // silent
            }
        }
        
        setTimeout(updateBadge, 200);
        setInterval(updateBadge, 30000);
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(attachBadge, 800); });
    } else {
        setTimeout(attachBadge, 800);
    }
})();

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

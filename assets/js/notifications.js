// ============================================
// NOTIFICATIONS — Shared Library
// ============================================

window.Notif = {

  // Send to a specific user
  async send(userId, title, message, type = 'info', link = null) {
    if (!userId) return { error: 'No user ID' };
    return window.db.from('notifications').insert({
      user_id: userId,
      title, message, type, link
    });
  },

  // Send to all admins + super_admins
  async toAdmins(title, message, type = 'info', link = null) {
    const { data: admins } = await window.db.from('profiles')
      .select('id').in('role', ['admin', 'super_admin']);
    if (!admins || !admins.length) return;
    const rows = admins.map(a => ({
      user_id: a.id, title, message, type, link
    }));
    return window.db.from('notifications').insert(rows);
  },

  // Send to all students
  async toStudents(title, message, type = 'info', link = null) {
    const { data: students } = await window.db.from('profiles')
      .select('id').eq('role', 'student');
    if (!students || !students.length) return;
    const rows = students.map(s => ({
      user_id: s.id, title, message, type, link
    }));
    return window.db.from('notifications').insert(rows);
  },

  // Send to all teachers
  async toTeachers(title, message, type = 'info', link = null) {
    const { data: teachers } = await window.db.from('profiles')
      .select('id').eq('role', 'teacher');
    if (!teachers || !teachers.length) return;
    const rows = teachers.map(t => ({
      user_id: t.id, title, message, type, link
    }));
    return window.db.from('notifications').insert(rows);
  },

  // Get unread count
  async unreadCount(userId) {
    const { count } = await window.db.from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId).eq('is_read', false);
    return count || 0;
  },

  // Get recent notifications
  async recent(userId, limit = 8) {
    const { data } = await window.db.from('notifications')
      .select('*').eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  },

  // Mark one as read
  async markRead(id) {
    return window.db.from('notifications').update({ is_read: true }).eq('id', id);
  },

  // Mark all as read
  async markAllRead(userId) {
    return window.db.from('notifications').update({ is_read: true })
      .eq('user_id', userId).eq('is_read', false);
  },

  // Delete one
  async remove(id) {
    return window.db.from('notifications').delete().eq('id', id);
  }
};

// ============================================
// BELL UI — injectable into any header
// ============================================

window.NotifBell = {

  // Build bell HTML with unread badge
  html() {
    return `
      <div class="relative" id="notifWrapper">
        <button id="notifBell" class="relative p-2 rounded-full hover:bg-primary/5 transition">
          <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          <span id="notifBadge" class="hidden absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">0</span>
        </button>
        <div id="notifPanel" class="hidden absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-primary/10 max-h-[500px] overflow-hidden z-50">
          <div class="flex items-center justify-between px-4 py-3 border-b border-primary/10 bg-cream">
            <h3 class="font-bold text-primary text-sm">Notifications</h3>
            <div class="flex gap-2">
              <button id="notifMarkAll" class="text-xs text-secondary font-semibold hover:underline">Mark all read</button>
            </div>
          </div>
          <div id="notifList" class="overflow-y-auto max-h-[380px]"></div>
          <a href="/notifications.html" id="notifViewAll" class="block text-center py-3 text-xs font-semibold text-primary hover:bg-cream border-t border-primary/10">View All Notifications →</a>
        </div>
      </div>
    `;
  },

  // Mount bell — needs userId
  async mount(userId) {
    const bell = document.getElementById('notifBell');
    if (!bell) return;
    const badge = document.getElementById('notifBadge');
    const panel = document.getElementById('notifPanel');
    const list = document.getElementById('notifList');

    const TYPE_ICONS = {
      info:        'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      success:     'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      warning:     'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      error:       'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
      payment:     'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
      class:       'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      certificate: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
      review:      'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
      signup:      'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
    };

    const TYPE_COLORS = {
      info: '#3b82f6', success: '#16a34a', warning: '#eab308',
      error: '#dc2626', payment: '#0A3622', class: '#3b82f6',
      certificate: '#D4AF37', review: '#D4AF37', signup: '#7c3aed'
    };

    async function refreshBadge() {
      const count = await Notif.unreadCount(userId);
      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : count;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    async function refreshList() {
      const items = await Notif.recent(userId, 10);
      if (!items.length) {
        list.innerHTML = '<p class="text-center text-charcoal/60 text-sm py-8">No notifications</p>';
        return;
      }
      list.innerHTML = items.map(n => {
        const icon = TYPE_ICONS[n.type] || TYPE_ICONS.info;
        const color = TYPE_COLORS[n.type] || '#3b82f6';
        const time = new Date(n.created_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
        return `
          <a href="${n.link || '#'}" data-id="${n.id}" class="notif-item flex items-start gap-3 px-4 py-3 border-b border-primary/5 hover:bg-cream transition ${n.is_read ? 'opacity-70' : 'bg-secondary/5'}">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style="background:${color}20;color:${color}">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${icon}"/></svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-primary truncate">${n.title}</p>
              <p class="text-xs text-charcoal/70 line-clamp-2">${n.message || ''}</p>
              <p class="text-xs text-charcoal/40 mt-1">${time}</p>
            </div>
            ${!n.is_read ? '<span class="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></span>' : ''}
          </a>
        `;
      }).join('');

      // Mark read on click
      list.querySelectorAll('.notif-item').forEach(item => {
        item.addEventListener('click', async () => {
          await Notif.markRead(item.dataset.id);
          refreshBadge();
        });
      });
    }

    // Toggle panel
    bell.addEventListener('click', async (e) => {
      e.stopPropagation();
      const isHidden = panel.classList.contains('hidden');
      panel.classList.toggle('hidden');
      if (isHidden) {
        await refreshList();
        await refreshBadge();
      }
    });

    document.addEventListener('click', (e) => {
      if (!document.getElementById('notifWrapper').contains(e.target)) {
        panel.classList.add('hidden');
      }
    });

    // Mark all read
    document.getElementById('notifMarkAll').addEventListener('click', async (e) => {
      e.stopPropagation();
      await Notif.markAllRead(userId);
      await refreshList();
      await refreshBadge();
    });

    // Initial load
    await refreshBadge();

    // Poll every 30 seconds
    setInterval(refreshBadge, 30000);
  }
};

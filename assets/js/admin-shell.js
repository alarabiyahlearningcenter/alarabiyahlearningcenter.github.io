// ============================================
// ADMIN SHELL — Shared Header + Sidebar
// ============================================

const ADMIN_MENU = [
  { href: 'dashboard.html', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: 'students.html', label: 'Students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { href: 'teachers.html', label: 'Teachers', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { href: 'courses.html', label: 'Courses', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { href: 'classes.html', label: 'Classes', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: 'payments.html', label: 'Payments', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { href: 'reviews.html', label: 'Reviews', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { href: 'certificates.html', label: 'Certificates', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { href: 'resources.html', label: 'Resources', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
  { href: 'notices.html', label: 'Notices', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' }
];

function buildAdminHeader() {
  return `
    <div class="px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <button id="sidebarToggle" class="lg:hidden p-2 text-primary">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
        <a href="../index.html" class="flex items-center gap-2">
          <img src="../assets/images/logo.png" alt="Al-Arabiyah" class="w-10 h-10 rounded-full border-2 border-secondary object-cover">
          <div class="hidden sm:block">
            <div class="font-heading font-bold text-primary text-sm leading-tight">Al-Arabiyah</div>
            <div class="text-xs text-primary/70">Admin Panel</div>
          </div>
        </a>
      </div>
      <div class="flex items-center gap-3">
        <span class="hidden md:inline-block text-xs font-semibold px-3 py-1 rounded-full" style="background:#0A3622;color:#D4AF37;">ADMIN</span>
        <div id="notifBellContainer"></div>
        <div class="relative">
          <button id="userMenuBtn" class="flex items-center gap-2 p-1 rounded-full hover:bg-primary/5">
            <div id="avatar" class="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-secondary font-bold">A</div>
          </button>
          <div id="userMenu" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-primary/10 py-2">
            <div class="px-4 py-2 border-b border-primary/10">
              <p id="userName" class="text-sm font-semibold text-primary">Admin</p>
              <p id="userEmail" class="text-xs text-charcoal/60 truncate">admin@email.com</p>
            </div>
            <a href="../super-admin/dashboard.html" class="block px-4 py-2 text-sm text-charcoal/70 hover:bg-cream">Super Admin</a>
            <button id="logoutBtn" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildAdminSidebar() {
  const current = window.location.pathname.split('/').pop() || 'dashboard.html';
  const links = ADMIN_MENU.map(item => {
    const isActive = current === item.href;
    return `
      <a href="${item.href}" class="sidebar-link ${isActive ? 'active' : ''} flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'text-primary font-medium' : 'text-charcoal/70'}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"/></svg>
        ${item.label}
      </a>
    `;
  }).join('');
  return `
    <div class="p-4">
      <div class="lg:hidden flex justify-end mb-2">
        <button id="sidebarClose" class="p-1 text-charcoal/50">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>
      <nav class="space-y-1">${links}</nav>
    </div>
  `;
}

async function initAdminShell() {
  const container = document.getElementById('admin-shell');
  if (!container) return null;

  // Inject shell HTML
  container.innerHTML = `
    <header class="sticky top-0 z-40 bg-white border-b border-primary/10">
      ${buildAdminHeader()}
    </header>
    <div class="flex">
      <aside id="sidebar" class="fixed lg:sticky top-0 lg:top-[60px] left-0 z-30 w-64 h-screen lg:h-[calc(100vh-60px)] bg-white border-r border-primary/10 transform -translate-x-full lg:translate-x-0 transition-transform overflow-y-auto">
        ${buildAdminSidebar()}
      </aside>
      <div id="sidebarOverlay" class="hidden lg:hidden fixed inset-0 bg-black/50 z-20"></div>
      <main id="admin-main" class="flex-1 min-w-0 p-4 md:p-6 lg:p-8"></main>
    </div>
  `;

  // Move existing content into main (if any)
  const userContent = document.getElementById('page-content');
  if (userContent) {
    document.getElementById('admin-main').innerHTML = userContent.innerHTML;
    userContent.remove();
  }

  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.remove('hidden');
  });
  document.getElementById('sidebarClose').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.add('hidden');
  });
  document.getElementById('sidebarOverlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.add('-translate-x-full');
    document.getElementById('sidebarOverlay').classList.add('hidden');
  });

  // User menu
  document.getElementById('userMenuBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('userMenu').classList.toggle('hidden');
  });
  document.addEventListener('click', () => document.getElementById('userMenu').classList.add('hidden'));

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await window.db.auth.signOut();
    window.location.href = '../auth/login.html';
  });

  // Auth + Role check
  const session = await window.requireAuth();
  if (!session) return null;

  const { data: profile } = await window.db.from('profiles').select('*').eq('id', session.user.id).single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    alert('Access Denied: Admin account required');
    await window.db.auth.signOut();
    window.location.href = '../auth/login.html';
    return null;
  }

  // Fill user info
  const fullName = profile.full_name || session.user.email.split('@')[0];
  document.getElementById('userName').textContent = fullName;
  document.getElementById('userEmail').textContent = session.user.email;
  document.getElementById('avatar').textContent = fullName.charAt(0).toUpperCase();

  // Mount notification bell
  if (window.NotifBell && document.getElementById('notifBellContainer')) {
    document.getElementById('notifBellContainer').innerHTML = window.NotifBell.html();
    window.NotifBell.mount(session.user.id);
  }

  // Fire event for page scripts
  window.dispatchEvent(new CustomEvent('adminReady', {
    detail: { session, profile, db: window.db }
  }));

  return { session, profile, db: window.db };
}

window.initAdminShell = initAdminShell;

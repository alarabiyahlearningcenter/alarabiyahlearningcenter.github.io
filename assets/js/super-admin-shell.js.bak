// ============================================
// SUPER ADMIN SHELL — Shared Header + Sidebar
// ============================================

const SUPER_ADMIN_MENU = [
  { href: 'dashboard.html', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { type: 'header', label: 'BRANDING' },
  { href: 'branding.html', label: 'Logo & Banner', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { href: 'site-settings.html', label: 'Site Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  { href: 'contact-info.html', label: 'Contact Info', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
  { href: 'social-links.html', label: 'Social Links', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' },
  { href: 'seo.html', label: 'SEO', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { type: 'header', label: 'MANAGEMENT' },
  { href: 'users.html', label: 'All Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { href: 'admins.html', label: 'Admins', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
  { href: 'analytics.html', label: 'Analytics', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: 'activity-log.html', label: 'Activity Log', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { type: 'header', label: 'SHORTCUTS' },
  { href: '../admin/dashboard.html', label: 'Admin Panel', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' }
];

function buildSuperAdminHeader() {
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
            <div class="text-xs text-secondary font-semibold">Super Admin</div>
          </div>
        </a>
      </div>
      <div class="flex items-center gap-3">
        <span class="hidden md:inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full" style="background:#D4AF37;color:#0A3622;">👑 SUPER ADMIN</span>
        <div class="relative">
          <button id="userMenuBtn" class="flex items-center gap-2 p-1 rounded-full hover:bg-primary/5">
            <div id="avatar" class="w-9 h-9 rounded-full flex items-center justify-center font-bold" style="background:#D4AF37;color:#0A3622;">S</div>
          </button>
          <div id="userMenu" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-primary/10 py-2">
            <div class="px-4 py-2 border-b border-primary/10">
              <p id="userName" class="text-sm font-semibold text-primary">Super Admin</p>
              <p id="userEmail" class="text-xs text-charcoal/60 truncate">admin@email.com</p>
            </div>
            <button id="logoutBtn" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildSuperAdminSidebar() {
  const current = window.location.pathname.split('/').pop() || 'dashboard.html';
  const items = SUPER_ADMIN_MENU.map(item => {
    if (item.type === 'header') {
      return `<p class="px-4 pt-4 pb-2 text-xs font-bold text-charcoal/40 tracking-wider">${item.label}</p>`;
    }
    const isActive = current === item.href;
    return `
      <a href="${item.href}" class="sidebar-link ${isActive ? 'active' : ''} flex items-center gap-3 px-4 py-2.5 rounded-lg ${isActive ? 'text-primary font-medium' : 'text-charcoal/70'}">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}"/></svg>
        <span class="text-sm">${item.label}</span>
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
      <nav class="space-y-1">${items}</nav>
    </div>
  `;
}

async function initSuperAdminShell() {
  const container = document.getElementById('super-admin-shell');
  if (!container) return null;

  container.innerHTML = `
    <header class="sticky top-0 z-40 bg-white border-b border-primary/10">
      ${buildSuperAdminHeader()}
    </header>
    <div class="flex">
      <aside id="sidebar" class="fixed lg:sticky top-0 lg:top-[60px] left-0 z-30 w-64 h-screen lg:h-[calc(100vh-60px)] bg-white border-r border-primary/10 transform -translate-x-full lg:translate-x-0 transition-transform overflow-y-auto">
        ${buildSuperAdminSidebar()}
      </aside>
      <div id="sidebarOverlay" class="hidden lg:hidden fixed inset-0 bg-black/50 z-20"></div>
      <main id="super-admin-main" class="flex-1 min-w-0 p-4 md:p-6 lg:p-8"></main>
    </div>
  `;

  const userContent = document.getElementById('page-content');
  if (userContent) {
    document.getElementById('super-admin-main').innerHTML = userContent.innerHTML;
    userContent.remove();
  }

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

  document.getElementById('userMenuBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('userMenu').classList.toggle('hidden');
  });
  document.addEventListener('click', () => document.getElementById('userMenu').classList.add('hidden'));

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await window.db.auth.signOut();
    window.location.href = '../auth/login.html';
  });

  const session = await window.requireAuth();
  if (!session) return null;

  const { data: profile } = await window.db.from('profiles').select('*').eq('id', session.user.id).single();
  if (!profile || profile.role !== 'super_admin') {
    alert('Access Denied: Super Admin account required');
    await window.db.auth.signOut();
    window.location.href = '../auth/login.html';
    return null;
  }

  const fullName = profile.full_name || session.user.email.split('@')[0];
  document.getElementById('userName').textContent = fullName;
  document.getElementById('userEmail').textContent = session.user.email;
  document.getElementById('avatar').textContent = fullName.charAt(0).toUpperCase();

  window.dispatchEvent(new CustomEvent('superAdminReady', {
    detail: { session, profile, db: window.db }
  }));

  return { session, profile, db: window.db };
}

window.initSuperAdminShell = initSuperAdminShell;

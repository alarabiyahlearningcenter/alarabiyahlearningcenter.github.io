// ============================================
// INJECT-BELL — Auto-add notification bell to user headers
// ============================================

(async function() {
  // Wait for db to be available
  let tries = 0;
  while (!window.db && tries < 50) {
    await new Promise(r => setTimeout(r, 100));
    tries++;
  }
  if (!window.db) return;

  const { data: { session } } = await window.db.auth.getSession();
  if (!session) return;

  // Find user menu button (by id)
  const userBtn = document.getElementById('userMenuBtn');
  if (!userBtn) return;

  // Check if bell already exists
  if (document.getElementById('notifBellContainer')) return;

  // Create bell container
  const bellContainer = document.createElement('div');
  bellContainer.id = 'notifBellContainer';
  bellContainer.className = 'inline-flex items-center';

  // Insert before user menu button
  userBtn.parentNode.insertBefore(bellContainer, userBtn);

  // Inject bell HTML
  if (window.NotifBell) {
    bellContainer.innerHTML = window.NotifBell.html();
    await window.NotifBell.mount(session.user.id);
  }
})();

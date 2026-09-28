window.SUPABASE_URL = 'https://vgsgisyneymtszuslftb.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc2dpc3luZXltdHN6dXNsZnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NTg0NjQsImV4cCI6MjEwNjAzNDQ2NH0.HaYptmVnZCbGiOCg1NyYkcdHQDqjXlAHeq_i_bTC6Yk';
window.db = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
window.requireAuth = async function() {
  const { data: { session } } = await window.db.auth.getSession();
  if (!session) { window.location.href = '../auth/login.html'; return null; }
  return session;
};
window.logoutUser = async function() {
  await window.db.auth.signOut();
  window.location.href = '../auth/login.html';
};

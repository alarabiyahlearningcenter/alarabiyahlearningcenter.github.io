// ============================================
// KYC GATE — Block unverified teachers/admins
// ============================================

(function() {
  const SUPABASE_URL = 'https://vgsgisyneymtszuslftb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc2dpc3luZXltdHN6dXNsZnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NTg0NjQsImV4cCI6MjEwNjAzNDQ2NH0.HaYptmVnZCbGiOCg1NyYkcdHQDqjXlAHeq_i_bTC6Yk';

  function onReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  onReady(async () => {
    const path = window.location.pathname;

    // Only run on teacher/admin pages (not kyc.html itself)
    if (!path.match(/\/(teacher|admin|super-admin)\//)) return;
    if (path.includes('kyc.html') || path.includes('kyc-review')) return;

    if (!window.supabase) return;
    const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;

    const { data: profile } = await sb.from('profiles').select('role, kyc_status').eq('id', session.user.id).single();
    if (!profile) return;

    // Super admin exempt
    if (profile.role === 'super_admin') return;

    // Teacher/Admin with pending/rejected KYC → block
    if ((profile.role === 'teacher' || profile.role === 'admin') && profile.kyc_status !== 'approved') {
      const status = profile.kyc_status || 'not_submitted';
      const msg = status === 'pending' 
        ? 'Your KYC verification is under review. Please wait for approval.'
        : status === 'rejected'
        ? 'Your KYC verification was rejected. Please re-submit your documents.'
        : 'KYC verification required. Please complete your identity verification first.';

      document.body.innerHTML = `
        <div class="min-h-screen flex items-center justify-center bg-cream p-4">
          <div class="max-w-md bg-white rounded-3xl shadow-xl border-2 border-primary/10 p-8 text-center">
            <div class="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style="background:${status === 'pending' ? '#fef3c7' : '#fee2e2'}">
              <svg class="w-10 h-10" style="color:${status === 'pending' ? '#d97706' : '#dc2626'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${status === 'pending' ? 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'}"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-primary mb-2" style="font-family:'Playfair Display',serif">
              ${status === 'pending' ? 'Verification Pending' : 'KYC Required'}
            </h1>
            <p class="text-charcoal/70 text-sm mb-6">${msg}</p>
            <a href="/teacher/kyc.html" class="inline-block w-full py-3 rounded-xl font-semibold text-white" style="background:#0A3622">
              ${status === 'rejected' ? 'Re-submit Documents' : 'View KYC Status'}
            </a>
            <button onclick="window.db.auth.signOut().then(()=>location.href='/auth/login.html')" 
                    class="mt-3 text-xs text-red-600 hover:underline">Logout</button>
          </div>
        </div>
      `;
    }
  });
})();

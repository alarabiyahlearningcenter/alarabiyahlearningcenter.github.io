// ============================================
// PUSH NOTIFICATIONS — Frontend Manager
// ============================================

(function() {
  const SUPABASE_URL = 'https://vgsgisyneymtszuslftb.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnc2dpc3luZXltdHN6dXNsZnRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NTg0NjQsImV4cCI6MjEwNjAzNDQ2NH0.HaYptmVnZCbGiOCg1NyYkcdHQDqjXlAHeq_i_bTC6Yk';

  // ⚠️ Replace with your VAPID PUBLIC key from Step 2
  const VAPID_PUBLIC_KEY = 'BJfBYTurBfzXFFnFMF1zKhd03QFA6aJoTYkWzJBrHd6KAyB6diGYtfiQl3deMMJnYJTuCb7-v14fysbWF9M15Xw';

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  window.PushManager = {
    // Check if supported
    isSupported() {
      return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    },

    // Check current permission
    getPermission() {
      return Notification.permission; // 'default' | 'granted' | 'denied'
    },

    // Check if already subscribed
    async isSubscribed() {
      if (!this.isSupported()) return false;
      const reg = await navigator.serviceWorker.getRegistration('/sw-push.js');
      if (!reg) return false;
      const sub = await reg.pushManager.getSubscription();
      return !!sub;
    },

    // Register service worker + subscribe to push
    async subscribe(userId) {
      if (!this.isSupported()) {
        throw new Error('Push notifications are not supported on this device/browser');
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Register service worker
      const reg = await navigator.serviceWorker.register('/sw-push.js', { scope: '/' });
      await navigator.serviceWorker.ready;

      // Subscribe
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Save to Supabase
      const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const subJson = sub.toJSON();

      const { error } = await sb.from('push_subscriptions').upsert({
        user_id: userId,
        endpoint: subJson.endpoint,
        p256dh: subJson.keys.p256dh,
        auth: subJson.keys.auth,
        user_agent: navigator.userAgent
      }, { onConflict: 'endpoint' });

      if (error) throw error;
      return sub;
    },

    // Unsubscribe
    async unsubscribe() {
      if (!this.isSupported()) return;
      const reg = await navigator.serviceWorker.getRegistration('/sw-push.js');
      if (!reg) return;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;

      const endpoint = sub.endpoint;
      await sub.unsubscribe();

      const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      await sb.from('push_subscriptions').delete().eq('endpoint', endpoint);
    }
  };
})();

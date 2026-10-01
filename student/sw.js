// ============================================
// LIVEKIT CLASSROOM — SERVICE WORKER
// ============================================
const CACHE_NAME = 'livekit-class-v1';
const RUNTIME_CACHE = 'livekit-runtime-v1';

const PRECACHE_URLS = [
  './live-class.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/livekit-client@2/dist/livekit-client.umd.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// ============================================
// INSTALL
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS).catch(err => {
        console.warn('[SW] Precache partial fail:', err);
      }))
      .then(() => self.skipWaiting())
  );
});

// ============================================
// ACTIVATE
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== RUNTIME_CACHE)
            .map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================
// FETCH — Cache strategy
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET
  if (request.method !== 'GET') return;
  
  // Skip LiveKit WebSocket / Supabase API / realtime
  if (url.protocol === 'ws:' || url.protocol === 'wss:') return;
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/realtime')) return;
  if (url.hostname.includes('livekit')) return;
  if (url.pathname.includes('/functions/v1/')) return;
  
  // HTML — Network first, fallback to cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(request, clone)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(request).then(r => r || caches.match('./live-class.html')))
    );
    return;
  }
  
  // CDN / static assets — Cache first
  if (url.hostname.includes('cdn.jsdelivr.net') || url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|woff2?|ttf)$/)) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(res => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then(c => c.put(request, clone)).catch(() => {});
          }
          return res;
        });
      })
    );
    return;
  }
  
  // Default — stale-while-revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const fetchPromise = fetch(request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(request, clone)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// ============================================
// BACKGROUND SYNC — Attendance retry queue
// ============================================
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance') {
    console.log('[SW] Background sync: attendance');
    event.waitUntil(syncAttendanceQueue());
  }
});

async function syncAttendanceQueue() {
  try {
    const cache = await caches.open('livekit-queue');
    const req = await cache.match('attendance-queue');
    if (!req) return;
    const entries = await req.json();
    if (!entries.length) return;
    
    // Forward to client (client will retry upload)
    const clients = await self.clients.matchAll();
    clients.forEach(c => c.postMessage({
      type: 'SYNC_ATTENDANCE',
      entries
    }));
    
    await cache.delete('attendance-queue');
  } catch (e) {
    console.warn('[SW] Sync failed:', e);
  }
}

// ============================================
// PUSH NOTIFICATIONS
// ============================================
self.addEventListener('push', (event) => {
  let data = { title: 'LiveClass', body: 'New activity in your class', icon: 'icons/icon-192.png' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {}
  
  const options = {
    body: data.body,
    icon: data.icon || 'icons/icon-192.png',
    badge: 'icons/icon-96.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || './live-class.html' },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  
  const url = event.notification.data?.url || './live-class.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      for (const c of clients) {
        if (c.url.includes(url) && 'focus' in c) return c.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

// ============================================
// MESSAGE FROM CLIENT
// ============================================
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
  else if (event.data?.type === 'QUEUE_ATTENDANCE') {
    event.waitUntil(queueAttendance(event.data.entries));
  }
});

async function queueAttendance(entries) {
  try {
    const cache = await caches.open('livekit-queue');
    const res = await cache.match('attendance-queue');
    const existing = res ? await res.json() : [];
    const merged = [...existing, ...entries];
    await cache.put('attendance-queue', new Response(JSON.stringify(merged), {
      headers: { 'Content-Type': 'application/json' }
    }));
    // Register for background sync
    if (self.registration.sync) {
      await self.registration.sync.register('sync-attendance');
    }
  } catch (e) { console.warn('[SW] Queue failed:', e); }
}

console.log('[SW] Loaded');

// Service Worker with Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

const { routing, strategies, precaching, expiration, cacheableResponse } = workbox;

// Precache static assets
precaching.precacheAndRoute(self.__WB_MANIFEST);

// Cache Google Fonts
routing.registerRoute(
  ({url}) => url.origin === 'https://fonts.googleapis.com' ||
             url.origin === 'https://fonts.gstatic.com',
  new strategies.StaleWhileRevalidate({
    cacheName: 'google-fonts',
    plugins: [
      new expiration.ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Cache static assets
routing.registerRoute(
  ({request}) => request.destination === 'style' ||
                 request.destination === 'script' ||
                 request.destination === 'image',
  new strategies.CacheFirst({
    cacheName: 'static-assets',
    plugins: [
      new expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Cache API responses
routing.registerRoute(
  ({url}) => url.origin === 'https://pmssfzblmsaphdlmxmdg.supabase.co',
  new strategies.NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new expiration.ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 5, // 5 minutes
      }),
      new cacheableResponse.CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Cache Maps API responses
routing.registerRoute(
  ({url}) => url.origin === 'https://maps.googleapis.com',
  new strategies.NetworkFirst({
    cacheName: 'maps-cache',
    plugins: [
      new expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24, // 24 hours
      }),
    ],
  })
);

// Offline fallback
routing.registerRoute(
  ({request}) => request.mode === 'navigate',
  async () => {
    try {
      return await strategies.NetworkFirst({
        cacheName: 'pages',
        plugins: [
          new expiration.ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 24 hours
          }),
        ],
      }).handle({request: 'index.html'});
    } catch (error) {
      return caches.match('offline.html');
    }
  }
);

// Background sync for offline operations
const bgSyncPlugin = new workbox.backgroundSync.BackgroundSyncPlugin('offlineQueue', {
  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours (specified in minutes)
});

routing.registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new strategies.NetworkOnly({
    plugins: [bgSyncPlugin]
  }),
  'POST'
);

// Push notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      },
    ]
  };

  event.waitUntil(
    self.registration.showNotification('PointMe', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

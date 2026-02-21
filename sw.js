// Pleiades OS Service Worker
// Provides offline caching and performance optimizations

const CACHE_NAME = 'pleiades-os-v1';
const STATIC_CACHE = 'pleiades-static-v1';
const FONT_CACHE = 'pleiades-fonts-v1';

// Core static assets to cache immediately on install
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Patterns for static assets to cache on demand
const STATIC_PATTERNS = [
  /\.html$/,
  /\.css$/,
  /\.js$/,
  /\.json$/
];

// Font patterns
const FONT_PATTERNS = [
  /fonts\.googleapis\.com/,
  /fonts\.gstatic\.com/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.otf$/
];

// Image patterns
const IMAGE_PATTERNS = [
  /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i
];

// API calls to always fetch fresh
const ALWAYS_FETCH = [
  /\/api\//,
  /notion/,
  /googleapis/
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Pleiades OS Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching core assets...');
        return cache.addAll(CORE_ASSETS).catch(err => {
          console.warn('[SW] Some core assets failed to cache:', err);
        });
      })
      .then(() => {
        console.log('[SW] Core assets cached successfully');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Pleiades OS Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => {
              // Delete old versioned caches
              return name.startsWith('pleiades-') && 
                     name !== STATIC_CACHE && 
                     name !== FONT_CACHE &&
                     name !== CACHE_NAME;
            })
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients...');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests except for fonts and CDNs
  if (url.origin !== self.location.origin) {
    if (isFontRequest(request)) {
      event.respondWith(handleFontRequest(request));
      return;
    }
    return;
  }
  
  // Always fetch API calls fresh
  if (isApiRequest(request)) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle images with cache-first strategy
  if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(request));
    return;
  }
  
  // Handle static assets with stale-while-revalidate
  if (isStaticAsset(request)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // Default: network-first with cache fallback
  event.respondWith(handleDefaultRequest(request));
});

// Helper functions

function isFontRequest(request) {
  const url = request.url;
  return FONT_PATTERNS.some(pattern => pattern.test(url));
}

function isApiRequest(request) {
  const url = request.url;
  return ALWAYS_FETCH.some(pattern => pattern.test(url));
}

function isImageRequest(request) {
  const url = request.url;
  return IMAGE_PATTERNS.some(pattern => pattern.test(url));
}

function isStaticAsset(request) {
  const url = request.url;
  return STATIC_PATTERNS.some(pattern => pattern.test(url));
}

// Cache strategies

async function handleFontRequest(request) {
  const cache = await caches.open(FONT_CACHE);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('[SW] Font fetch failed:', error);
    return new Response('', { status: 404 });
  }
}

async function handleApiRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.warn('[SW] API request failed:', error);
    return new Response(
      JSON.stringify({ error: 'Network error', offline: true }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleImageRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  
  if (cached) {
    // Revalidate in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response);
      }
    }).catch(() => {});
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.warn('[SW] Image fetch failed:', error);
    // Return a placeholder or 404
    return new Response('', { status: 404 });
  }
}

async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);
  
  // Always try network first for fresh content
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Network failed, return cached version if available
    if (cached) {
      console.log('[SW] Serving cached:', request.url);
      return cached;
    }
    
    // If no cache, try to serve offline page
    if (request.mode === 'navigate') {
      const offlinePage = await cache.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

async function handleDefaultRequest(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await cache.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    throw error;
  }
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data?.type === 'CACHE_ASSETS') {
    const urls = event.data.urls;
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(urls);
    }).then(() => {
      event.ports[0].postMessage({ success: true });
    }).catch(err => {
      event.ports[0].postMessage({ success: false, error: err.message });
    });
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  console.log('[SW] Background sync triggered');
  // Notify all clients that sync is happening
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_COMPLETED' });
  });
}

// Push notifications (placeholder for future)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'Pleiades OS', {
        body: data.body || 'New notification',
        icon: '/icon-192.png',
        badge: '/icon-96.png',
        data: data.data || {}
      })
    );
  }
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

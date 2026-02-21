/**
 * Service Worker for Scales.sin PWA
 * Cache strategy: Cache First, fall back to network
 * Offline support: All HTML, CSS, JS, and icons cached on install
 */

const CACHE_NAME = 'scales-sin-v1';
const FILES_TO_CACHE = [
    './index.html',
    './scale_viz_v5.html',
    './chord_voice_leading.html',
    './manifest.json',
    '../Assets/Icons/icon-192.svg',
    '../Assets/Icons/icon-512.svg'
];

/**
 * Install event: Cache all necessary files for offline use
 */
self.addEventListener('install', (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Caching app shell');
            return cache.addAll(FILES_TO_CACHE);
        }).catch((err) => {
            console.error('Cache installation failed:', err);
        })
    );
    // Skip waiting to activate immediately
    self.skipWaiting();
});

/**
 * Activate event: Clean up old caches (if version changes)
 */
self.addEventListener('activate', (event) => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

/**
 * Fetch event: Cache first, fall back to network
 * Serves cached content when offline, updates cache when online
 */
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip external requests (Google Fonts, etc.)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            // Return cached response if available
            if (response) {
                return response;
            }

            // Fall back to network request
            return fetch(event.request)
                .then((response) => {
                    // Don't cache unsuccessful responses
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response for caching
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                    return response;
                })
                .catch(() => {
                    // Return offline fallback if needed (optional)
                    console.warn('Fetch failed for:', event.request.url);
                    return null;
                });
        })
    );
});

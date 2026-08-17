/**
 * Service Worker for Scales.sin PWA
 * Cache strategy: Cache First for the app shell, Network First for vocab data
 * Offline support: All HTML, CSS, JS, and icons cached on install
 */

const CACHE_NAME = 'scales-sin-v6';

// Vocab data changes far more often than the shell. Cache-first would pin
// installed clients to whatever vocab shipped with their cache version, so
// these go network-first and fall back to cache only when offline.
const NETWORK_FIRST = [
    './artist_vocab.json'
];
const FILES_TO_CACHE = [
    './index.html',
    './scales.sin.html',
    './chord_voice_leading.html',
    './chord_progressions.html',
    './manifest.json',
    './music_theory.js',
    './voicing_vocabulary.js',
    './artist_vocab.json',
    './fretboard_renderer.js',
    './piano_renderer.js',
    './Assets/Icons/icon-192.png',
    './Assets/Icons/icon-512.png'
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

    // Network first for vocab data: always prefer fresh, fall back to cache offline
    const isNetworkFirst = NETWORK_FIRST.some(
        (path) => event.request.url === new URL(path, self.location.href).href
    );
    if (isNetworkFirst) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    if (response && response.status === 200 && response.type === 'basic') {
                        const responseToCache = response.clone();
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
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

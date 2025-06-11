const CACHE_NAME = 'v1';
const CACHE_ASSETS = [
    'offline.html',
    'scripts/3.4.16.js',
    'scripts/OrbitControls.js',
    'scripts/loader.js',
    'scripts/model-viewer.min.js',
    'scripts/three.min.js',
    'fonts/inter/Inter-Regular.otf'
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(CACHE_ASSETS);
            })
    );
});

// Fetch event
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // If there's a cached response, return it
                if (response) {
                    return response;
                }
                // If not, fetch from the network
                return fetch(event.request).then((networkResponse) => {
                    // Check if the response is valid
                    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                        return networkResponse; // Don't cache if not valid
                    }
                    // Cache the response for future requests
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                });
            }).catch(() => {
                // Fallback to offline page if network fails
                return caches.match('offline.html');
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

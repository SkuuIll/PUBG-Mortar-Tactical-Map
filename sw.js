const APP_SHELL_CACHE = 'pubg-mortar-shell-v4';
const RUNTIME_CACHE = 'pubg-mortar-runtime-v4';


const APP_SHELL_ASSETS = [
    './',
    './index.html',
    './manifest.webmanifest',
    './vendor/leaflet/leaflet.css',
    './vendor/leaflet/leaflet.js',
    './src/styles/main.css',
    './src/styles/tokens.css',
    './src/styles/base.css',
    './src/styles/layout.css',
    './src/styles/components.css',
    './src/styles/map.css',
    './src/js/main.js',
    './src/js/core/pubg-mortar-app.js',
    './src/js/config/maps.js',
    './src/js/config/mortar.js',
    './src/js/features/export-service.js',
    './src/js/features/drawing-manager.js',
    './src/js/services/theme-service.js',
    './src/js/services/visitor-counter-service.js',
    './src/js/services/share-service.js',
    './src/js/services/pwa-service.js',
    './assets/branding/favicon-16.png',
    './assets/branding/favicon-32.png',
    './assets/branding/apple-touch-icon.png',
    './assets/branding/icon-192.png',
    './assets/branding/icon-512.png',
    './assets/branding/maskable-512.png',
    './assets/branding/social-banner.png',
    './assets/maps/active/erangel-main.png'
];


self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(APP_SHELL_CACHE)
            .then((cache) => cache.addAll(APP_SHELL_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheKeys) => Promise.all(
            cacheKeys
                .filter((cacheKey) => ![APP_SHELL_CACHE, RUNTIME_CACHE].includes(cacheKey))
                .map((cacheKey) => caches.delete(cacheKey))
        )).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(request.url);

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() => caches.match('./index.html'))
        );
        return;
    }

    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    const runtimeTarget = requestUrl.pathname.includes('/assets/maps/active/');

    event.respondWith((async () => {
        const cacheName = runtimeTarget ? RUNTIME_CACHE : APP_SHELL_CACHE;
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request, { ignoreSearch: true });

        if (cachedResponse) {
            return cachedResponse;
        }

        try {
            const networkResponse = await fetch(request);

            if (networkResponse.ok) {
                cache.put(request, networkResponse.clone());
            }

            return networkResponse;
        } catch (error) {
            if (request.destination === 'document') {
                return caches.match('./index.html');
            }

            throw error;
        }
    })());
});


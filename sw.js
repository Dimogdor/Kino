// Service worker : garde l'interface et le catalogue en cache pour ouvrir Kino hors ligne.
const CACHE = 'kino-v3';
const FILES = ['./', 'index.html', 'style.css', 'app.js', 'db.js', 'modes.js', 'i18n.js', 'config.js', 'data/catalogue.json', 'manifest.webmanifest', 'icons/icon-192.png'];

self.addEventListener('install', e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())));
// Nouvelle version : on supprime les anciens caches
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));

const keep = (request, response) => {
  if (response.ok) {
    const copy = response.clone();
    caches.open(CACHE).then(c => c.put(request, copy));
  }
  return response;
};

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  if (url.origin === location.origin) {
    // Fichiers du site : réseau d'abord (pour les mises à jour), cache si hors ligne
    e.respondWith(fetch(e.request).then(r => keep(e.request, r)).catch(() => caches.match(e.request, { ignoreSearch: true })));
  } else if (url.hostname === 'www.gstatic.com') {
    // SDK Firebase : version figée, le cache suffit
    e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => keep(e.request, r))));
  }
});

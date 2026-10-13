// Service worker : le jeu marche hors ligne après la première visite.
const CACHE = 'ptits-compagnons-jeu-v3';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './favicon.png', './apple-touch-icon.png', './creatures.js', './img/creatures/aurorine.webp', './img/creatures/bourgeo.webp', './img/creatures/braisette.webp', './img/creatures/bulleau.webp', './img/creatures/champinou.webp', './img/creatures/cometo.webp', './img/creatures/corailo.webp', './img/creatures/cristallin.webp', './img/creatures/cristalor.webp', './img/creatures/ecumou.webp', './img/creatures/etoilou.webp', './img/creatures/flambo.webp', './img/creatures/flamboreal.webp', './img/creatures/flammi.webp', './img/creatures/floconou.webp', './img/creatures/florabelle.webp', './img/creatures/foudrion.webp', './img/creatures/givrelle.webp', './img/creatures/glandou.webp', './img/creatures/goutelo.webp', './img/creatures/gouti.webp', './img/creatures/lunabelle.webp', './img/creatures/moussette.webp', './img/creatures/murisson.webp', './img/creatures/nebulon.webp', './img/creatures/nenuphy.webp', './img/creatures/nuagelle.webp', './img/creatures/ocealine.webp', './img/creatures/petalou.webp', './img/creatures/pinguelin.webp', './img/creatures/plumeau.webp', './img/creatures/pompom.webp', './img/creatures/pousi.webp', './img/creatures/rocaillon.webp', './img/creatures/sablon.webp', './img/creatures/scintilla.webp', './img/creatures/tisonnet.webp', './img/creatures/tonnerrot.webp', './img/creatures/ventilou.webp', './img/creatures/volcanou.webp', './img/creatures/voltinou.webp', './img/creatures/zigzou.webp', './img/creatures/zippi.webp'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {   // page : réseau d'abord (pour les mises à jour), sinon cache
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); }
    return r;
  }).catch(() => hit)));
});

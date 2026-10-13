self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>!k.includes('jeu')).map(k=>caches.delete(k)))).then(()=>self.registration.unregister())));

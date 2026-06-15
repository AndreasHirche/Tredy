const CACHE='tredy-v1';
const ASSETS=['./index.html','./manifest.json'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch',e=>{
  // Network-first for HTML so updates are always picked up
  if(e.request.url.endsWith('.html')||e.request.url.endsWith('/')){
    e.respondWith(
      fetch(e.request).then(r=>{
        const clone=r.clone();
        caches.open(CACHE).then(c=>c.put(e.request,clone));
        return r;
      }).catch(()=>caches.match(e.request))
    );
  } else {
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
  }
});

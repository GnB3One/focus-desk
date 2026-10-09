var CACHE='focus-desk-20261009091431';
var CORE=['./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    return Promise.all(CORE.map(function(u){
      return c.add(u).catch(function(){ /* 单个资源失败不阻塞 SW 安装 */ });
    }));
  }).then(function(){return self.skipWaiting();}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET')return;
  var u; try{u=new URL(req.url);}catch(err){return;}
  if(u.origin!==location.origin)return; /* GitHub API 等跨域请求直接放行，不缓存 */
  if(req.mode==='navigate'){
    e.respondWith(fetch(req).then(function(r){
      var copy=r.clone(); caches.open(CACHE).then(function(c){c.put('./index.html',copy);}); return r;
    }).catch(function(){return caches.match('./index.html');}));
    return;
  }
  e.respondWith(caches.match(req).then(function(hit){
    if(hit)return hit;
    return fetch(req).then(function(r){
      if(r.ok){var copy=r.clone(); caches.open(CACHE).then(function(c){c.put(req,copy);});}
      return r;
    }).catch(function(){return hit;});
  }));
});

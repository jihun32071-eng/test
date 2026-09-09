/* 아침 브리핑 — 오프라인 셸.
   아침에 열자마자 떠야 하는 화면이라 캐시를 먼저 주고(stale-while-revalidate),
   새 버전은 뒤에서 받아 다음 실행에 반영합니다. 지하철·비행기 모드에서도 켜집니다.
   내용을 바꾸면 VERSION을 올려야 오래된 캐시가 정리됩니다. */
var VERSION = "2026-09-09";
var CACHE = "morning-brief-" + VERSION;
var SHELL = [
  "./",
  "./index.html",
  "./app.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      /* 하나가 실패해도 설치 자체는 끝내고 나머지는 런타임에 채웁니다 */
      return Promise.all(SHELL.map(function(u){ return c.add(u).catch(function(){}); }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        return k !== CACHE && k.indexOf("morning-brief-") === 0 ? caches.delete(k) : null;
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function(e){
  var req = e.request;
  if(req.method !== "GET") return;

  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  var isFont = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if(!sameOrigin && !isFont) return;

  /* 주소창으로 들어온 요청은 항상 셸 문서로 돌려줍니다 */
  var key = req.mode === "navigate" ? new Request("./index.html") : req;

  e.respondWith(
    caches.open(CACHE).then(function(cache){
      return cache.match(key).then(function(hit){
        var net = fetch(req).then(function(res){
          if(res && (res.ok || res.type === "opaque")) cache.put(key, res.clone()).catch(function(){});
          return res;
        }).catch(function(){
          return hit || Response.error();
        });
        return hit || net;
      });
    })
  );
});

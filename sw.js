const CACHE_NAME="fixpin-v7";

const FILES=[
"./",
"./index.html",
"./manifest.json"
];

self.addEventListener("install",e=>{
e.waitUntil(
caches.open(CACHE_NAME).then(cache=>{
return cache.addAll(FILES);
})
);
});

self.addEventListener("fetch",e=>{
e.respondWith(
caches.match(e.request).then(r=>{
return r || fetch(e.request);
})
);
});

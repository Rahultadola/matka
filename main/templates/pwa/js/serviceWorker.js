const matka = "matka-v4"
const assets = [
  "/",
  "/style.css",
  "/app.js",
  "/d.js",
  "/pages.js",
  "/events.js",
  "/layout.js",
  "/login-register.js",
  "/str_html.js",
  "/back_001.jpeg"
]

self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(matka).then(cache => {
      cache.addAll(assets)
    })
  )
})


self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})


self.addEventListener("push", pushEvent => {
  const payload = pushEvent.data?.text() ?? "no payload";
  pushEvent.waitUntil(
    self.registration.showNotification(payload.title, { body: payload.content })
  );
});
const matka = "matka-v4"
const assets = [
  "/",
  // "/index.html",
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
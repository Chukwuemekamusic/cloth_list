const CACHE = 'clothlist-v1'

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.add('/')).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)

  // API calls — never intercept, let them fail naturally
  if (url.pathname.startsWith('/api/')) return

  // Immutable hashed assets — cache first, then network
  if (url.pathname.startsWith('/_next/static/')) {
    e.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((res) => {
            caches.open(CACHE).then((c) => c.put(request, res.clone()))
            return res
          })
      )
    )
    return
  }

  // Navigation — network first, fall back to cached shell
  if (request.mode === 'navigate') {
    e.respondWith(
      fetch(request)
        .then((res) => {
          caches.open(CACHE).then((c) => c.put(request, res.clone()))
          return res
        })
        .catch(() => caches.match('/'))
    )
    return
  }

  // Everything else (fonts, images in public/) — cache first
  e.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          caches.open(CACHE).then((c) => c.put(request, res.clone()))
          return res
        })
    )
  )
})

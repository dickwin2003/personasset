// service-worker.js
const CACHE_NAME = 'converasset-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/css/tailwind.min.css',
  '/src/css/style.css',
  '/src/js/app.js',
  '/src/js/charts.js',
  '/src/js/clipboard.js',
  '/src/js/constants.js',
  '/src/js/data.js',
  '/src/js/events.js',
  '/src/js/pages.js',
  '/src/js/ui.js',
  '/src/js/utils.js',
  '/assets/vendor/chart.js/chart.umd.min.js',
  '/assets/vendor/chartjs-plugin-datalabels.min.js',
  '/assets/fontawesome/css/all.min.css',
  '/assets/fontawesome/webfonts/fa-brands-400.woff2',
  '/assets/fontawesome/webfonts/fa-regular-400.woff2',
  '/assets/fontawesome/webfonts/fa-solid-900.woff2',
  '/assets/fontawesome/webfonts/fa-v4compatibility.woff2',
  '/assets/icons/favicon.ico',
  '/assets/icons/favicon-16x16.png',
  '/assets/icons/favicon-32x32.png',
  '/assets/icons/apple-touch-icon.png',
  '/assets/icons/android-chrome-192x192.png',
  '/assets/icons/android-chrome-512x512.png'
];

// 安装事件 - 缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 获取事件 - 拦截网络请求并返回缓存内容
self.addEventListener('fetch', event => {
  // 对于导航请求，优先返回缓存的index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.open(CACHE_NAME)
            .then(cache => {
              return cache.match('/index.html');
            });
        })
    );
    return;
  }

  // 对于其他资源请求，尝试从网络获取，失败则从缓存获取
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
          .then(response => {
            return response || new Response('Resource not available', { status: 404 });
          });
      })
  );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
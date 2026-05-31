// JY Beauty Service Worker — 接收 web push + 顯示通知
// 冠 #4869 2026-05-31

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = { title: 'JY Beauty', body: '有新通知', url: '/admin' };
  try {
    if (event.data) {
      const json = event.data.json();
      data = { ...data, ...json };
    }
  } catch (e) {
    if (event.data) data.body = event.data.text();
  }

  const options = {
    body: data.body,
    icon: '/apple-touch-icon.png',
    badge: '/apple-touch-icon.png',
    tag: data.tag || 'jy-beauty',
    data: { url: data.url || '/admin' },
    vibrate: [100, 50, 100],
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/admin';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(targetUrl);
    })
  );
});

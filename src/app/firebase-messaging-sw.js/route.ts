import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  const cfg = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  }
  const script = `
    // Firebase SW (compat)
    importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-app-compat.js');
    importScripts('https://www.gstatic.com/firebasejs/9.6.11/firebase-messaging-compat.js');
    try {
      firebase.initializeApp({
        apiKey: '${cfg.apiKey}',
        authDomain: '${cfg.authDomain}',
        projectId: '${cfg.projectId}',
        messagingSenderId: '${cfg.messagingSenderId}',
        appId: '${cfg.appId}'
      });
      const messaging = firebase.messaging();
      messaging.onBackgroundMessage(function(payload) {
        const title = (payload && payload.notification && payload.notification.title) || 'Courtify';
        const options = {
          body: (payload && payload.notification && payload.notification.body) || 'Nueva notificación',
          icon: '/icons/icon-192x192.png',
          data: payload && payload.data ? payload.data : {}
        };
        self.registration.showNotification(title, options);
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('FCM SW init error', e);
    }
    self.addEventListener('notificationclick', function(event) {
      event.notification.close();
      const data = event.notification && event.notification.data || {};
      const url = data.url || '/dashboard';
      event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        for (let client of windowClients) {
          if (client.url && client.url.indexOf(url) !== -1 && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      }));
    });

    // Activate immediately to ensure availability after registration
    self.addEventListener('install', (event) => {
      self.skipWaiting();
    });
    self.addEventListener('activate', (event) => {
      event.waitUntil(self.clients.claim());
    });
  `
  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}

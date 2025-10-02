importScripts('https://www.gstatic.com/firebasejs/9.24.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.24.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "TA_CLE_API",
  authDomain: "TON_PROJET.firebaseapp.com",
  projectId: "TON_PROJET",
  storageBucket: "TON_PROJET.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Message reçu en arrière-plan ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

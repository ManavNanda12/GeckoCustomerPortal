importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAJc-9wsac7XsQ9yvFuAB1W6yoJhCtEqTs",
  authDomain: "geckocustomerportal-1fd47.firebaseapp.com",
  projectId: "geckocustomerportal-1fd47",
  storageBucket: "geckocustomerportal-1fd47.firebasestorage.app",
  messagingSenderId: "717664476356",
  appId: "1:717664476356:web:2a524c8fc16a8b30c47d91",
  measurementId: "G-KDG5G9EL0H"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("📩 Background message:", payload);

  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/assets/icons/icon-72x72.png",
  });
});

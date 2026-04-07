// Instalación del Service Worker
self.addEventListener("install", event => {
    console.log("Service Worker instalado");
    self.skipWaiting();
});

// Activación
self.addEventListener("activate", event => {
    console.log("Service Worker activado");
});

// Evento de notificación (opcional para push)
self.addEventListener("push", event => {
    const data = event.data ? event.data.text() : "Notificación sin contenido";

    self.registration.showNotification("🔔 Notificación", {
        body: data,
        icon: "icon/apple-touch-icon.png"
    });
});

// Click en la notificación
self.addEventListener("notificationclick", event => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow("https://tuweb.com")
    );
});
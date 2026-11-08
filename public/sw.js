self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "دریا پارت";
  const options = {
    body: data.body || "پیام جدیدی از دریا پارت دارید.",
    icon: new URL(data.icon || "darya-part-icon.svg", self.registration.scope).href,
    badge: new URL(data.badge || "favicon.svg", self.registration.scope).href,
    data: { url: data.url || "/" },
    dir: "rtl",
    lang: "fa",
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(String(event.notification.data?.url || "./").replace(/^\\/+/, "") || "./", self.registration.scope).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        await client.focus();
        if ("navigate" in client) await client.navigate(target);
        return;
      }
    }
    await self.clients.openWindow(target);
  })());
});

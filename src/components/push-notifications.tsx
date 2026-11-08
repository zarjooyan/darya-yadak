"use client";

import { useState } from "react";
import { Bell, BellOff, LoaderCircle } from "lucide-react";

const API_URL = "http://localhost:3031";
const serviceWorkerPath = process.env.NODE_ENV === "production" ? "/darya-yadak/sw.js" : "/sw.js";

function decodeVapidKey(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
}

export default function PushNotifications() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [enabled, setEnabled] = useState(false);

  const toggleSubscription = async () => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setMessage("مرورگر شما از اعلان وب پشتیبانی نمی‌کند.");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const registration = await navigator.serviceWorker.register(serviceWorkerPath, { scope: process.env.NODE_ENV === "production" ? "/darya-yadak/" : "/" });
      const existing = await registration.pushManager.getSubscription();

      if (existing) {
        await existing.unsubscribe();
        await fetch(`${API_URL}/push/unsubscribe`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: existing.endpoint }),
        });
        setEnabled(false);
        setMessage("اعلان‌ها غیرفعال شدند.");
        return;
      }

      const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
      if (permission !== "granted") {
        setMessage("برای فعال‌سازی اعلان‌ها باید اجازه نمایش اعلان را بدهید.");
        return;
      }

      const keyResponse = await fetch(`${API_URL}/push/public-key`, { credentials: "include" });
      if (!keyResponse.ok) throw new Error("کلید Push از سرویس محلی دریافت نشد.");
      const { publicKey } = (await keyResponse.json()) as { publicKey: string };
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: decodeVapidKey(publicKey),
      });
      const saveResponse = await fetch(`${API_URL}/push/subscribe`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });
      if (!saveResponse.ok) throw new Error("ثبت اشتراک اعلان انجام نشد.");
      setEnabled(true);
      setMessage("اعلان‌های دریا پارت با موفقیت فعال شدند.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "فعال‌سازی اعلان‌ها انجام نشد.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="push-opt-in" aria-label="اعلان‌های دریا پارت">
      <span className="push-opt-in-icon"><Bell size={19}/></span>
      <div className="push-opt-in-copy">
        <strong>از خبرهای جدید باخبر شو</strong>
        <small>اعلان محصولات و اطلاعیه‌های دریا پارت</small>
        {message && <small className="push-opt-in-message" role="status">{message}</small>}
      </div>
      <button type="button" className="push-opt-in-button" onClick={toggleSubscription} disabled={busy}>
        {busy ? <LoaderCircle size={16} className="push-spinner"/> : enabled ? <BellOff size={16}/> : <Bell size={16}/>}
        {busy ? "لطفاً صبر کنید" : enabled ? "غیرفعال‌سازی" : "فعال‌سازی اعلان"}
      </button>
    </section>
  );
}

"use client";

import { useEffect, useState, type FormEvent } from "react";

const API_URL = "http://localhost:3031";

export default function PushAdmin({ onBack }: { onBack: () => void }) {
  const [count, setCount] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_URL}/push/stats`, { credentials: "include" });
      if (!response.ok) throw new Error("آمار اشتراک‌ها دریافت نشد.");
      const result = (await response.json()) as { count: number };
      setCount(result.count);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "خطا در دریافت آمار");
    }
  };

  useEffect(() => { void loadStats(); }, []);

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`${API_URL}/push/send`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      });
      const result = (await response.json()) as { error?: string; sent?: number; failed?: number; removed?: number };
      if (!response.ok) throw new Error(result.error || "ارسال اعلان انجام نشد.");
      setMessage(`ارسال تمام شد؛ موفق: ${result.sent}، ناموفق: ${result.failed}، اشتراک حذف‌شده: ${result.removed}.`);
      await loadStats();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "ارسال اعلان انجام نشد.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="admin-shell" dir="rtl">
      <header className="admin-header">
        <div><span className="admin-eyebrow">DARYA PART · PUSH</span><h1>مدیریت اعلان‌ها</h1></div>
        <div className="admin-actions"><button className="admin-quiet" onClick={onBack}>بازگشت به محصولات</button></div>
      </header>
      <section className="admin-editor">
        <div className="admin-list-heading"><h2>اشتراک‌های فعال</h2><strong>{count === null ? "—" : count}</strong></div>
        <p>تعداد مرورگرهایی که اجازه دریافت اعلان داده‌اند و اشتراک آن‌ها در سرویس محلی ذخیره شده است.</p>
        <form onSubmit={send} className="push-admin-form">
          <label>عنوان اعلان<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={80} required placeholder="مثلاً محصول جدید در دریا پارت" /></label>
          <label>متن اعلان<textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={240} rows={4} required placeholder="متن کوتاه اعلان..." /></label>
          <label>مسیر مقصد داخل سایت<input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="/" /></label>
          <button type="submit" disabled={busy || !count}>{busy ? "در حال ارسال..." : "ارسال به همه مشترک‌ها"}</button>
        </form>
        {message && <p role="status" className="push-admin-message">{message}</p>}
        <small>برای تست، ابتدا از بخش پایین سایت در یک یا چند مرورگر اعلان‌ها را فعال کنید. ارسال فقط به اشتراک‌های ثبت‌شده انجام می‌شود.</small>
      </section>
    </main>
  );
}

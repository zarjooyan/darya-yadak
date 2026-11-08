"use client";

import { useEffect, useState } from "react";
import type { Category } from "@/lib/catalog";

const API_URL = "http://localhost:3031";
const emptyCategory = (): Category => ({
  slug: "",
  title: "",
  description: "",
  icon: "⚙️",
  count: "جدید",
});

export default function CategoryAdmin({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<Category[]>([]);
  const [active, setActive] = useState<Category | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/categories`, { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load categories");
        return response.json() as Promise<Category[]>;
      })
      .then(setItems)
      .catch(() => alert("دریافت دسته‌بندی‌ها انجام نشد."))
      .finally(() => setLoading(false));
  }, []);

  const persist = async (next: Category[]) => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "ذخیره دسته‌بندی انجام نشد.");
      setItems(next);
      return true;
    } catch (error) {
      alert(error instanceof Error ? error.message : "ذخیره دسته‌بندی انجام نشد.");
      return false;
    }
  };

  const save = async () => {
    if (!active?.title.trim() || !active.slug.trim()) {
      alert("نام و Slug دسته‌بندی الزامی است.");
      return;
    }
    if (items.some((item) => item.slug === active.slug && item.slug !== editingSlug)) {
      alert("این Slug قبلاً استفاده شده است.");
      return;
    }
    const next = editingSlug
      ? items.map((item) => item.slug === editingSlug ? active : item)
      : [...items, active];
    if (await persist(next)) {
      setActive(null);
      setEditingSlug(null);
    }
  };

  return (
    <main className="admin-shell" dir="rtl">
      <header className="admin-header">
        <div><span className="admin-eyebrow">DARYA PART · ADMIN</span><h1>مدیریت دسته‌بندی‌ها</h1></div>
        <button className="admin-quiet" onClick={onBack}>بازگشت به محصولات</button>
      </header>
      {active ? (
        <section className="admin-editor">
          <div className="admin-form-heading"><h2>{items.some((item) => item.slug === active.slug) ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}</h2><button className="admin-quiet" onClick={() => { setActive(null); setEditingSlug(null); }}>بستن</button></div>
          <div className="admin-fields">
            <label>نام دسته‌بندی<input value={active.title} onChange={(e) => setActive({ ...active, title: e.target.value })} /></label>
            <label>Slug<input value={active.slug} onChange={(e) => setActive({ ...active, slug: e.target.value })} /></label>
            <label>آیکون<input value={active.icon} onChange={(e) => setActive({ ...active, icon: e.target.value })} /></label>
            <label>متن شمارنده<input value={active.count} onChange={(e) => setActive({ ...active, count: e.target.value })} /></label>
            <label className="admin-full-field">توضیحات<textarea className="admin-content-textarea" rows={4} value={active.description} onChange={(e) => setActive({ ...active, description: e.target.value })} /></label>
          </div>
          <div className="admin-form-footer"><button onClick={save}>ذخیره دسته‌بندی</button><button className="admin-quiet" onClick={() => setActive(null)}>انصراف</button></div>
        </section>
      ) : (
        <section className="admin-product-list">
          <div className="admin-list-heading"><h2>دسته‌بندی‌ها ({items.length})</h2><button onClick={() => { setEditingSlug(null); setActive(emptyCategory()); }}>＋ دسته‌بندی جدید</button></div>
          {loading ? <p>در حال دریافت اطلاعات...</p> : items.map((item) => (
            <article className="admin-product-row" key={item.slug}>
              <div><strong>{item.icon} {item.title}</strong><small>{item.slug} · {item.count}</small></div>
              <button className="admin-quiet" onClick={() => { setEditingSlug(item.slug); setActive(item); }}>ویرایش</button>
              <button className="admin-danger" onClick={() => { if (confirm("این دسته‌بندی حذف شود؟")) void persist(items.filter((category) => category.slug !== item.slug)); }}>حذف</button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

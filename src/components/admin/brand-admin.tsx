"use client";

import { useEffect, useState } from "react";
import type { Brand } from "@/lib/catalog";

const API_URL = "http://localhost:3031";
const emptyBrand = (): Brand => ({ slug: "", name: "", description: "" });

export default function BrandAdmin({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<Brand[]>([]);
  const [active, setActive] = useState<Brand | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/brands`, { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load brands");
        return response.json() as Promise<Brand[]>;
      })
      .then(setItems)
      .catch(() => alert("دریافت برندها انجام نشد."))
      .finally(() => setLoading(false));
  }, []);

  const persist = async (next: Brand[]) => {
    try {
      const response = await fetch(`${API_URL}/brands`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "ذخیره برند انجام نشد.");
      setItems(next);
      return true;
    } catch (error) {
      alert(error instanceof Error ? error.message : "ذخیره برند انجام نشد.");
      return false;
    }
  };

  const save = async () => {
    if (!active?.name.trim() || !active.slug.trim()) {
      alert("نام و Slug برند الزامی است.");
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
        <div><span className="admin-eyebrow">DARYA PART · ADMIN</span><h1>مدیریت برندها</h1></div>
        <button className="admin-quiet" onClick={onBack}>بازگشت به محصولات</button>
      </header>
      {active ? (
        <section className="admin-editor">
          <div className="admin-form-heading"><h2>{editingSlug ? "ویرایش برند" : "برند جدید"}</h2><button className="admin-quiet" onClick={() => { setActive(null); setEditingSlug(null); }}>بستن</button></div>
          <div className="admin-fields">
            <label>نام برند<input value={active.name} onChange={(e) => setActive({ ...active, name: e.target.value })} /></label>
            <label>Slug<input value={active.slug} onChange={(e) => setActive({ ...active, slug: e.target.value })} /></label>
            <label className="admin-full-field">توضیحات<input value={active.description} onChange={(e) => setActive({ ...active, description: e.target.value })} /></label>
          </div>
          <div className="admin-form-footer"><button onClick={save}>ذخیره برند</button><button className="admin-quiet" onClick={() => { setActive(null); setEditingSlug(null); }}>انصراف</button></div>
        </section>
      ) : (
        <section className="admin-product-list">
          <div className="admin-list-heading"><h2>برندها ({items.length})</h2><button onClick={() => { setEditingSlug(null); setActive(emptyBrand()); }}>＋ برند جدید</button></div>
          {loading ? <p>در حال دریافت اطلاعات...</p> : items.map((item) => (
            <article className="admin-product-row" key={item.slug}>
              <div><strong>{item.name}</strong><small>{item.slug}</small></div>
              <button className="admin-quiet" onClick={() => { setEditingSlug(item.slug); setActive(item); }}>ویرایش</button>
              <button className="admin-danger" onClick={() => { if (confirm("این برند حذف شود؟")) void persist(items.filter((brand) => brand.slug !== item.slug)); }}>حذف</button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

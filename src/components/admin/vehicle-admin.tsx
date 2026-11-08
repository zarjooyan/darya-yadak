"use client";

import { useEffect, useState } from "react";
import type { Vehicle } from "@/lib/catalog";

const API_URL = "http://localhost:3031";
const emptyVehicle = (): Vehicle => ({ slug: "", name: "", make: "", model: "", years: "" });

export default function VehicleAdmin({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<Vehicle[]>([]);
  const [active, setActive] = useState<Vehicle | null>(null);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/vehicles`, { credentials: "include" })
      .then((response) => {
        if (!response.ok) throw new Error("Could not load vehicles");
        return response.json() as Promise<Vehicle[]>;
      })
      .then(setItems)
      .catch(() => alert("دریافت خودروها انجام نشد."))
      .finally(() => setLoading(false));
  }, []);

  const persist = async (next: Vehicle[]) => {
    try {
      const response = await fetch(`${API_URL}/vehicles`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "ذخیره خودرو انجام نشد.");
      setItems(next);
      return true;
    } catch (error) {
      alert(error instanceof Error ? error.message : "ذخیره خودرو انجام نشد.");
      return false;
    }
  };

  const save = async () => {
    if (!active?.name.trim() || !active.slug.trim()) {
      alert("نام و Slug خودرو الزامی است.");
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
        <div><span className="admin-eyebrow">DARYA PART · ADMIN</span><h1>مدیریت خودروها</h1></div>
        <button className="admin-quiet" onClick={onBack}>بازگشت به محصولات</button>
      </header>
      {active ? (
        <section className="admin-editor">
          <div className="admin-form-heading"><h2>{editingSlug ? "ویرایش خودرو" : "خودرو جدید"}</h2><button className="admin-quiet" onClick={() => { setActive(null); setEditingSlug(null); }}>بستن</button></div>
          <div className="admin-fields">
            <label>نام نمایشی<input value={active.name} onChange={(e) => setActive({ ...active, name: e.target.value })} /></label>
            <label>Slug<input value={active.slug} onChange={(e) => setActive({ ...active, slug: e.target.value })} /></label>
            <label>سازنده<input value={active.make} onChange={(e) => setActive({ ...active, make: e.target.value })} /></label>
            <label>مدل<input value={active.model} onChange={(e) => setActive({ ...active, model: e.target.value })} /></label>
            <label>سال‌های تولید<input value={active.years} onChange={(e) => setActive({ ...active, years: e.target.value })} /></label>
          </div>
          <div className="admin-form-footer"><button onClick={save}>ذخیره خودرو</button><button className="admin-quiet" onClick={() => { setActive(null); setEditingSlug(null); }}>انصراف</button></div>
        </section>
      ) : (
        <section className="admin-product-list">
          <div className="admin-list-heading"><h2>خودروها ({items.length})</h2><button onClick={() => { setEditingSlug(null); setActive(emptyVehicle()); }}>＋ خودرو جدید</button></div>
          {loading ? <p>در حال دریافت اطلاعات...</p> : items.map((item) => (
            <article className="admin-product-row" key={item.slug}>
              <div><strong>{item.name}</strong><small>{item.make} · {item.model} · {item.years}</small></div>
              <button className="admin-quiet" onClick={() => { setEditingSlug(item.slug); setActive(item); }}>ویرایش</button>
              <button className="admin-danger" onClick={() => { if (confirm("این خودرو از فهرست پیشنهادها حذف شود؟")) void persist(items.filter((vehicle) => vehicle.slug !== item.slug)); }}>حذف</button>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

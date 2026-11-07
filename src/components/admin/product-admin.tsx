"use client";

import { useMemo, useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Bold,
  Italic,
  Heading,
  Link,
  List,
  Table,
  TableToolbar,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { products as initialProducts, categories } from "@/lib/catalog";

type AdminProduct = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  sku: string;
  oemCode: string;
  fitment: string;
  image: string;
  shortDescription: string;
  content: string;
  seoTitle: string;
  seoDescription: string;
  status: "draft" | "published";
};

const STORAGE_KEY = "darya-part-admin-products";
const SESSION_KEY = "darya-part-admin-session";
const emptyProduct = (): AdminProduct => ({
  id: crypto.randomUUID(),
  slug: "",
  title: "",
  brand: "",
  category: categories[0]?.slug ?? "",
  sku: "",
  oemCode: "",
  fitment: "",
  image: "",
  shortDescription: "",
  content: "",
  seoTitle: "",
  seoDescription: "",
  status: "draft",
});

const editorConfig = {
  licenseKey: process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY || "",
  language: "fa",
  plugins: [Essentials, Paragraph, Bold, Italic, Heading, Link, List, Table, TableToolbar],
  toolbar: ["undo", "redo", "|", "heading", "|", "bold", "italic", "|", "link", "|", "bulletedList", "numberedList", "|", "insertTable"],
  table: { contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"] },
};

export default function ProductAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [configuredPin, setConfiguredPin] = useState("");
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [active, setActive] = useState<AdminProduct | null>(null);
  const [query, setQuery] = useState("");
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    const savedPin = localStorage.getItem("darya-part-admin-pin");
    setConfiguredPin(savedPin ?? "");
    setAuthenticated(sessionStorage.getItem(SESSION_KEY) === "1");
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setItems(JSON.parse(saved) as AdminProduct[]); } catch { setItems([]); }
    } else {
      setItems(initialProducts.map((p) => ({
        id: p.id, slug: p.slug, title: p.title, brand: p.brand,
        category: p.category, sku: "", oemCode: "", fitment: p.fitment,
        image: p.image, shortDescription: "", content: "", seoTitle: p.title,
        seoDescription: "", status: "published",
      })));
    }
  }, []);

  const persist = (next: AdminProduct[]) => {
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const filtered = useMemo(
    () => items.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.slug.includes(query)),
    [items, query],
  );

  const login = () => {
    if (!configuredPin) {
      if (pin.length < 6) return alert("رمز مدیر باید حداقل ۶ رقم یا کاراکتر باشد.");
      localStorage.setItem("darya-part-admin-pin", pin);
      setConfiguredPin(pin);
    } else if (pin !== configuredPin) {
      return alert("رمز ورود صحیح نیست.");
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    setAuthenticated(true);
    setPin("");
  };

  const save = () => {
    if (!active?.title.trim() || !active.slug.trim()) return alert("نام محصول و Slug الزامی است.");
    const next = items.some((p) => p.id === active.id)
      ? items.map((p) => p.id === active.id ? active : p)
      : [...items, active];
    persist(next);
    setActive(null);
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "darya-part-products.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJson = async (file?: File) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as AdminProduct[];
      if (!Array.isArray(parsed)) throw new Error();
      persist(parsed);
    } catch {
      alert("فایل JSON معتبر نیست.");
    }
  };

  if (!authenticated) {
    return (
      <main className="admin-shell" dir="rtl">
        <section className="admin-login">
          <span className="admin-eyebrow">DARYA PART · ADMIN</span>
          <h1>ورود به مدیریت</h1>
          <p>{configuredPin ? "رمز مدیر را وارد کنید." : "برای اولین ورود، رمز مدیر محلی را تعریف کنید."}</p>
          <form onSubmit={(e) => { e.preventDefault(); login(); }}>
            <label htmlFor="admin-pin">رمز مدیر</label>
            <input id="admin-pin" type="password" value={pin} onChange={(e) => setPin(e.target.value)} minLength={6} autoComplete="current-password" />
            <button type="submit">ورود به پنل</button>
          </form>
          <small>این قفل صرفاً برای استفاده محلی است و جایگزین احراز هویت امن سمت سرور نیست.</small>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell" dir="rtl">
      <header className="admin-header">
        <div><span className="admin-eyebrow">DARYA PART · ADMIN</span><h1>مدیریت محصولات</h1></div>
        <div className="admin-actions">
          <button onClick={exportJson}>خروجی JSON</button>
          <label className="admin-button">ورود JSON<input type="file" accept="application/json" hidden onChange={(e) => importJson(e.target.files?.[0])} /></label>
          <button className="admin-quiet" onClick={() => { sessionStorage.removeItem(SESSION_KEY); setAuthenticated(false); }}>خروج</button>
        </div>
      </header>
      <section className="admin-toolbar">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجوی نام یا slug محصول..." />
        <button onClick={() => setActive(emptyProduct())}>＋ محصول جدید</button>
      </section>
      {active ? (
        <section className="admin-editor">
          <div className="admin-form-heading"><h2>{items.some((p) => p.id === active.id) ? "ویرایش محصول" : "محصول جدید"}</h2><button className="admin-quiet" onClick={() => setActive(null)}>بستن</button></div>
          <div className="admin-fields">
            {([
              ["title", "نام محصول"], ["slug", "آدرس انگلیسی (slug)"], ["brand", "برند"], ["sku", "شناسه کالا"], ["oemCode", "کد OEM"], ["fitment", "خودروهای سازگار"], ["image", "آدرس تصویر"], ["shortDescription", "توضیح کوتاه"], ["seoTitle", "عنوان SEO"], ["seoDescription", "توضیحات Meta"],
            ] as const).map(([key, label]) => (
              <label key={key}>{label}<input value={active[key]} onChange={(e) => setActive({ ...active, [key]: e.target.value })} /></label>
            ))}
            <label>دسته‌بندی<select value={active.category} onChange={(e) => setActive({ ...active, category: e.target.value })}>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}</select></label>
            <label>وضعیت<select value={active.status} onChange={(e) => setActive({ ...active, status: e.target.value as AdminProduct["status"] })}><option value="draft">پیش‌نویس</option><option value="published">منتشرشده</option></select></label>
          </div>
          <label className="admin-editor-label">محتوای کامل محصول</label>
          {!process.env.NEXT_PUBLIC_CKEDITOR_LICENSE_KEY && <p className="admin-license-note">برای فعال‌سازی CKEditor، کلید لایسنس را در NEXT_PUBLIC_CKEDITOR_LICENSE_KEY در فایل .env.local قرار بده. مجوز GPL فقط در صورت سازگاری مجوز کل پروژه قابل استفاده است.</p>}
          <div className="admin-ckeditor" dir="rtl">
            <CKEditor
              editor={ClassicEditor}
              config={editorConfig}
              data={active.content}
              onReady={() => setEditorReady(true)}
              onChange={(_, editor) => setActive({ ...active, content: editor.getData() })}
            />
          </div>
          <div className="admin-form-footer"><button onClick={save}>ذخیره محصول</button><button className="admin-quiet" onClick={() => setActive(null)}>انصراف</button></div>
        </section>
      ) : (
        <section className="admin-product-list">
          <div className="admin-list-heading"><h2>محصولات ({filtered.length})</h2><span>نقش فعال: مدیر</span></div>
          {filtered.map((p) => <article className="admin-product-row" key={p.id}><div><strong>{p.title}</strong><small>{p.slug} · {p.brand || "بدون برند"}</small></div><span className={p.status === "published" ? "admin-status-published" : "admin-status-draft"}>{p.status === "published" ? "منتشرشده" : "پیش‌نویس"}</span><button className="admin-quiet" onClick={() => setActive(p)}>ویرایش</button><button className="admin-danger" onClick={() => { if (confirm("این محصول حذف شود؟")) persist(items.filter((x) => x.id !== p.id)); }}>حذف</button></article>)}
        </section>
      )}
    </main>
  );
}

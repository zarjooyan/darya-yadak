"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { brands, categories, getProductImageSrc, vehicles } from "@/lib/catalog";
import CategoryAdmin from "@/components/admin/category-admin";
import BrandAdmin from "@/components/admin/brand-admin";
import VehicleAdmin from "@/components/admin/vehicle-admin";

const API_URL = "http://localhost:3031";
const LEGACY_STORAGE_KEY = "darya-part-admin-products";

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
  price?: number;
  oldPrice?: number;
  rating?: number;
  reviews?: number;
  badge?: string;
};

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
  price: 0,
  rating: 0,
  reviews: 0,
});

export default function ProductAdmin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [authConfigured, setAuthConfigured] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [items, setItems] = useState<AdminProduct[]>([]);
  const [active, setActive] = useState<AdminProduct | null>(null);
  const [query, setQuery] = useState("");
  const [preview, setPreview] = useState(false);
  const [managingCategories, setManagingCategories] = useState(false);
  const [managingBrands, setManagingBrands] = useState(false);
  const [managingVehicles, setManagingVehicles] = useState(false);

  const loadProducts = useCallback(async () => {
    const response = await fetch(`${API_URL}/products`, { credentials: "include" });
    if (!response.ok) throw new Error("Could not load products");
    let next = (await response.json()) as AdminProduct[];

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      try {
        const migrated = JSON.parse(legacy) as AdminProduct[];
        if (Array.isArray(migrated) && migrated.every((product) => product.id && product.slug && product.title)) {
          const migration = await fetch(`${API_URL}/products`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(migrated),
          });
          if (migration.ok) {
            next = migrated;
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          }
        }
      } catch {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }
    }

    setItems(next);
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/status`, { credentials: "include" });
        if (!response.ok) throw new Error("Local API unavailable");
        const status = (await response.json()) as { configured: boolean; authenticated: boolean };
        setAuthConfigured(status.configured);
        setAuthenticated(status.authenticated);
        setApiAvailable(true);
        if (status.authenticated) await loadProducts();
      } catch {
        setApiAvailable(false);
      } finally {
        setAuthReady(true);
      }
    };
    void checkSession();
  }, [loadProducts]);

  const persist = async (next: AdminProduct[]) => {
    try {
      const response = await fetch(`${API_URL}/products`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!response.ok) throw new Error("Could not save products");
      setItems(next);
      return true;
    } catch {
      alert("ذخیره اطلاعات انجام نشد. اتصال سرویس محلی را بررسی کنید.");
      return false;
    }
  };

  const filtered = useMemo(
    () => items.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()) || p.slug.includes(query)),
    [items, query],
  );

  const authenticate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError("");
    if (password.length < 8) {
      setAuthError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/auth/${authConfigured ? "login" : "setup"}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "ورود انجام نشد.");
      setAuthenticated(true);
      setAuthConfigured(true);
      setPassword("");
      await loadProducts();
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "ارتباط با سرویس محلی برقرار نشد.");
    }
  };

  const logout = async () => {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    setAuthenticated(false);
    setActive(null);
  };

  const save = async () => {
    if (!active?.title.trim() || !active.slug.trim()) return alert("نام محصول و Slug الزامی است.");
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(active.slug)) {
      return alert("Slug باید فقط شامل حروف کوچک انگلیسی، عدد و خط تیره باشد.");
    }
    if (!categories.some((category) => category.slug === active.category)) {
      return alert("دسته‌بندی انتخاب‌شده معتبر نیست.");
    }
    if (active.seoTitle.length > 60 || active.seoDescription.length > 160) {
      return alert("عنوان SEO حداکثر ۶۰ و توضیحات متا حداکثر ۱۶۰ کاراکتر باشد.");
    }
    if (items.some((p) => p.id !== active.id && p.slug === active.slug)) {
      return alert("این slug قبلاً برای محصول دیگری استفاده شده است.");
    }
    const next = items.some((p) => p.id === active.id)
      ? items.map((p) => p.id === active.id ? active : p)
      : [...items, active];
    if (await persist(next)) setActive(null);
  };

  const uploadImage = async (file?: File) => {
    if (!file || !active) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("فقط تصاویر JPG، PNG و WebP پشتیبانی می‌شوند.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("حجم تصویر نباید بیشتر از ۸ مگابایت باشد.");
      return;
    }

    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, mimeType: file.type, base64 }),
      });
      if (!response.ok) throw new Error("Image upload failed");
      const result = (await response.json()) as { image: string };
      setActive((current) => current ? { ...current, image: result.image } : current);
    } catch {
      alert("آپلود تصویر انجام نشد.");
    }
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
      if (!Array.isArray(parsed) || parsed.some((product) => !product.id || !product.slug || !product.title)) {
        throw new Error("Invalid product data");
      }
      if (!(await persist(parsed))) throw new Error("Could not import products");
    } catch {
      alert("فایل JSON معتبر نیست یا ذخیره آن انجام نشد.");
    }
  };

  if (managingVehicles && authenticated) {
    return <VehicleAdmin onBack={() => setManagingVehicles(false)} />;
  }

  if (managingBrands && authenticated) {
    return <BrandAdmin onBack={() => setManagingBrands(false)} />;
  }

  if (managingCategories && authenticated) {
    return <CategoryAdmin onBack={() => setManagingCategories(false)} />;
  }

  if (!authReady) {
    return <main className="admin-shell" dir="rtl"><section className="admin-login"><h1>در حال اتصال به پنل...</h1></section></main>;
  }

  if (!apiAvailable) {
    return <main className="admin-shell" dir="rtl"><section className="admin-login"><h1>سرویس محلی اجرا نشده است</h1><p>ترمینال را در پوشه پروژه باز کن و دستور <code>npm run dev</code> را اجرا کن.</p></section></main>;
  }

  if (!authenticated) {
    return (
      <main className="admin-shell" dir="rtl">
        <section className="admin-login">
          <span className="admin-eyebrow">DARYA PART · ADMIN</span>
          <h1>{authConfigured ? "ورود به مدیریت" : "تنظیم رمز مدیر"}</h1>
          <p>{authConfigured ? "رمز عبور مدیر را وارد کنید." : "برای اولین ورود، یک رمز عبور محلی و امن تعریف کنید."}</p>
          <form onSubmit={authenticate}>
            <label htmlFor="admin-password">رمز عبور مدیر</label>
            <input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} autoComplete={authConfigured ? "current-password" : "new-password"} required />
            {authError && <small role="alert">{authError}</small>}
            <button type="submit">{authConfigured ? "ورود به پنل" : "ذخیره رمز و ورود"}</button>
          </form>
          <small>اطلاعات احراز هویت فقط روی همین سیستم و در فایل نادیده‌گرفته‌شده .admin-auth.json ذخیره می‌شود.</small>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell" dir="rtl">
      <header className="admin-header">
        <div><span className="admin-eyebrow">DARYA PART · ADMIN</span><h1>مدیریت محصولات</h1></div>
        <div className="admin-actions">
          <button className="admin-quiet" onClick={() => setManagingCategories(true)}>مدیریت دسته‌بندی‌ها</button>
          <button className="admin-quiet" onClick={() => setManagingBrands(true)}>مدیریت برندها</button>
          <button className="admin-quiet" onClick={() => setManagingVehicles(true)}>مدیریت خودروها</button>
          <button onClick={exportJson}>خروجی JSON</button>
          <label className="admin-button">ورود JSON<input type="file" accept="application/json" hidden onChange={(e) => importJson(e.target.files?.[0])} /></label>
          <button className="admin-quiet" onClick={logout}>خروج</button>
        </div>
      </header>
      <section className="admin-toolbar">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="جستجوی نام یا slug محصول..." />
        <button onClick={() => { setPreview(false); setActive(emptyProduct()); }}>＋ محصول جدید</button>
      </section>
      {active ? (
        <section className="admin-editor">
          <div className="admin-form-heading"><h2>{items.some((p) => p.id === active.id) ? "ویرایش محصول" : "محصول جدید"}</h2><div className="admin-actions"><button className="admin-quiet" onClick={() => setPreview((value) => !value)}>{preview ? "بازگشت به ویرایش" : "پیش‌نمایش"}</button><button className="admin-quiet" onClick={() => { setActive(null); setPreview(false); }}>بستن</button></div></div>
          {preview ? (
            <div className="admin-product-preview">
              {active.image && <img src={getProductImageSrc(active.image)} alt={active.title} />}
              <span className="admin-eyebrow">پیش‌نمایش محصول</span>
              <h1>{active.title || "عنوان محصول"}</h1>
              <p>{active.shortDescription || "توضیح کوتاه محصول"}</p>
              <div><strong>برند:</strong> {active.brand || "—"}　<strong>خودرو:</strong> {active.fitment || "—"}</div>
              {active.content && <p className="admin-preview-content">{active.content}</p>}
              <small>SEO title: {active.seoTitle || active.title}</small>
              <small>Meta description: {active.seoDescription || "—"}</small>
            </div>
          ) : (
            <>
          <div className="admin-fields">
            {([
              ["title", "نام محصول"], ["slug", "آدرس انگلیسی (slug)"], ["brand", "برند"], ["sku", "شناسه کالا"], ["oemCode", "کد OEM"], ["fitment", "خودروهای سازگار"], ["image", "آدرس تصویر"], ["shortDescription", "توضیح کوتاه"], ["seoTitle", "عنوان SEO"], ["seoDescription", "توضیحات Meta"],
            ] as const).map(([key, label]) => (
              <label key={key}>{label}<input list={key === "brand" ? "admin-brand-options" : key === "fitment" ? "admin-vehicle-options" : undefined} value={active[key]} onChange={(e) => setActive({ ...active, [key]: e.target.value })} />
                {key === "brand" && <datalist id="admin-brand-options">{brands.map((brand) => <option key={brand.slug} value={brand.name} />)}</datalist>}
                {key === "fitment" && <datalist id="admin-vehicle-options">{vehicles.map((vehicle) => <option key={vehicle.slug} value={vehicle.name} />)}</datalist>}
              </label>
            ))}
            <label>دسته‌بندی<select value={active.category} onChange={(e) => setActive({ ...active, category: e.target.value })}>{categories.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}</select></label>
            <label>وضعیت<select value={active.status} onChange={(e) => setActive({ ...active, status: e.target.value as AdminProduct["status"] })}><option value="draft">پیش‌نویس</option><option value="published">منتشرشده</option></select></label>
          </div>
          <div className="admin-image-upload">
            <label className="admin-button">آپلود تصویر<input type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => uploadImage(e.target.files?.[0])} /></label>
            {active.image && <img src={getProductImageSrc(active.image)} alt="پیش‌نمایش تصویر محصول" />}
          </div>
          <label className="admin-editor-label">محتوای کامل محصول</label>
          <textarea className="admin-content-textarea" value={active.content} onChange={(e) => setActive({ ...active, content: e.target.value })} rows={12} placeholder="محتوای کامل محصول را وارد کنید..." />
            </>
          )}
          <div className="admin-form-footer"><button onClick={save}>ذخیره محصول</button><button className="admin-quiet" onClick={() => setActive(null)}>انصراف</button></div>
        </section>
      ) : (
        <section className="admin-product-list">
          <div className="admin-list-heading"><h2>محصولات ({filtered.length})</h2><span>نقش فعال: مدیر</span></div>
          {filtered.map((p) => <article className="admin-product-row" key={p.id}><div><strong>{p.title}</strong><small>{p.slug} · {p.brand || "بدون برند"}</small></div><span className={p.status === "published" ? "admin-status-published" : "admin-status-draft"}>{p.status === "published" ? "منتشرشده" : "پیش‌نویس"}</span><button className="admin-quiet" onClick={() => { setPreview(false); setActive(p); }}>ویرایش</button><button className="admin-danger" onClick={() => { if (confirm("این محصول حذف شود؟")) void persist(items.filter((x) => x.id !== p.id)); }}>حذف</button></article>)}
        </section>
      )}
    </main>
  );
}

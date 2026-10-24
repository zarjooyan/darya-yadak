"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CarFront, Check, ChevronDown, Headphones, Heart, Menu, Moon, PackageCheck, Search, ShieldCheck, ShoppingBag, Sun, Truck, Wrench, X } from "lucide-react";
import { categories, formatPrice, products, type Product } from "@/lib/catalog";

export function Header() {
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  useEffect(() => {
    const saved = localStorage.getItem("darya-part-theme");
    const initial = saved === "dark" || saved === "light" ? saved : "light";
    document.documentElement.dataset.theme = initial;
    setTheme(initial);
  }, []);
  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("darya-part-theme", next);
    setTheme(next);
  };
  const [menuOpen, setMenuOpen] = useState(false);
  const results = useMemo(() => query.trim() ? products.filter((product) => (product.title + " " + product.brand + " " + product.fitment).includes(query.trim())).slice(0, 4) : [], [query]);
  return (
    <>
      <div className="top-strip"><div className="container top-strip-inner"><span>قطعه درست، انتخاب مطمئن؛ <strong>همراه خودروی شما</strong></span><div className="top-strip-items"><span>راهنمای انتخاب قطعه</span><span>پشتیبانی تخصصی</span><span>پیگیری سفارش</span></div></div></div>
      <header className="site-header">
        <div className="container header-main">
          <Link href="/" className="brand" aria-label="دریا پارت، صفحه اصلی"><span className="brand-mark"><Wrench size={23}/></span><span><span className="brand-name">دریا پارت</span><span className="brand-caption">همراه مطمئن خودروی شما</span></span></Link>
          <div className="search-wrap">
            <form className="search-box" action={process.env.NODE_ENV === "production" ? "/darya-yadak/search/" : "/search/"} role="search"><Search size={19}/><input aria-label="جستجوی قطعه" name="q" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="نام قطعه، کد فنی یا مدل خودرو را جستجو کنید..." autoComplete="off"/><button type="submit" aria-label="جستجو" className="text-link"><ArrowLeft size={17}/></button></form>
            {results.length > 0 && <div className="search-suggestions">{results.map((product) => <Link key={product.id} href={"/product/"+product.slug+"/"} className="suggestion-item"><Search size={15}/><span>{product.title}</span><small>{formatPrice(product.price)}</small></Link>)}</div>}
          </div>
          <div className="header-actions"><button className="action-icon theme-toggle" onClick={toggleTheme} aria-label={theme === "dark" ? "فعال کردن حالت روشن" : "فعال کردن حالت تاریک"} title={theme === "dark" ? "حالت روشن" : "حالت تاریک"}>{theme === "dark" ? <Sun size={19}/> : <Moon size={19}/>}</button><Link href="/guides/" className="header-action"><span className="action-icon"><Headphones size={19}/></span><span className="action-copy"><span className="action-label">راهنمای خرید</span><span className="action-caption">انتخاب مطمئن</span></span></Link><Link href="/search/" className="header-action"><span className="action-icon"><ShoppingBag size={19}/></span><span className="action-copy"><span className="action-label">سفارش من</span><span className="action-caption">فروشگاه آزمایشی</span></span></Link><button className="action-icon mobile-menu" aria-label={menuOpen ? "بستن منو" : "باز کردن منو"} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20}/> : <Menu size={20}/>}</button></div>
        </div>
        <div className={"nav-row"+(menuOpen ? " nav-row-open" : "")}><nav className="container nav-inner" aria-label="منوی اصلی"><Link className="nav-link nav-link-featured" href="/categories/"><Menu size={16}/>دسته‌بندی قطعات <ChevronDown size={14}/></Link><Link className="nav-link" href="/category/engine/">قطعات موتور</Link><Link className="nav-link" href="/category/body/">بدنه و چراغ</Link><Link className="nav-link" href="/category/electrical/">برقی و الکترونیکی</Link><Link className="nav-link" href="/category/suspension/">جلوبندی و تعلیق</Link><Link className="nav-link" href="/guides/">راهنمای خرید</Link><Link className="nav-link" href="/contact/">تماس با ما</Link></nav></div>
      </header>
    </>
  );
}

export function Footer() {
  return <footer className="site-footer"><div className="container"><div className="footer-grid"><div className="footer-brand"><Link href="/" className="brand"><span className="brand-mark"><Wrench size={23}/></span><span><span className="brand-name">دریا پارت</span><span className="brand-caption" >همراه مطمئن خودروی شما</span></span></Link><p>قطعه مناسب، اطلاعات شفاف و انتخاب آگاهانه؛ دریا پارت تجربه‌ای ساده‌تر برای پیدا کردن لوازم یدکی خودرو می‌سازد. اطلاعات این نسخه نمایشی است.</p></div><div><h2 className="footer-heading">دسترسی سریع</h2><div className="footer-links"><Link href="/categories/">همه دسته‌بندی‌ها</Link><Link href="/category/engine/">قطعات موتور</Link><Link href="/category/body/">قطعات بدنه</Link><Link href="/category/electrical/">قطعات برقی</Link></div></div><div><h2 className="footer-heading">راهنمای مشتریان</h2><div className="footer-links"><Link href="/guides/">راهنمای خرید قطعه</Link><Link href="/guides/#fitment">بررسی سازگاری خودرو</Link><Link href="/guides/#authenticity">تشخیص قطعه اصلی</Link><Link href="/contact/">پرسش‌های متداول</Link></div></div><div><h2 className="footer-heading">ارتباط با ما</h2><div className="footer-links"><Link href="/contact/">تماس و پشتیبانی</Link><Link href="/contact/#about">درباره دریا پارت</Link><Link href="/sitemap.xml">نقشه سایت</Link><Link href="https://github.com/zarjooyan/darya-yadak">مخزن پروژه در GitHub</Link></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} دریا پارت — تمامی حقوق محفوظ است.</span><span>قیمت‌ها و محصولات این نسخه صرفاً نمونه هستند.</span></div></div></footer>;
}

export function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);
  return <article className="product-card"><Link href={"/product/"+product.slug+"/"} aria-label={product.title}><div className="product-photo-wrap">{product.badge && <span className="product-badge">{product.badge}</span>}<img className="product-photo" src={product.image} alt={product.title} loading="lazy"/></div></Link><div className="product-body"><span className="product-brand">{product.brand}</span><Link href={"/product/"+product.slug+"/"} className="product-title">{product.title}</Link><div className="product-fitment"><CarFront size={14}/>{product.fitment}</div><div className="product-rating">★ {product.rating} <span>({product.reviews} دیدگاه نمونه)</span></div><div className="product-price-row"><div className="product-price">{formatPrice(product.price)}{product.oldPrice && <span className="product-old-price">{formatPrice(product.oldPrice)}</span>}</div><button className="add-cart" aria-label={added ? "به لیست علاقه‌مندی اضافه شد" : "افزودن به لیست"} onClick={() => setAdded(!added)} title={added ? "ذخیره شد" : "ذخیره محصول"}>{added ? <Check size={17}/> : <Heart size={17}/>}</button></div></div></article>;
}

export function ProductGrid({ items = products }: { items?: Product[] }) {
  if (!items.length) return <div className="empty-state">محصولی با این مشخصات پیدا نشد. نام قطعه یا مدل خودرو را تغییر دهید.</div>;
  return <div className="product-grid">{items.map((product) => <ProductCard key={product.id} product={product}/>)}</div>;
}

export function VehicleFinder() {
  const [make, setMake] = useState("پژو");
  const [model, setModel] = useState("۲۰۶");
  const [year, setYear] = useState("همه سال‌ها");
  return <div className="vehicle-panel" id="vehicle-finder"><div className="vehicle-panel-head"><div><h3>قطعه مناسب خودروی خودت رو پیدا کن</h3><p>خودرو رو انتخاب کن تا مسیر پیدا کردن قطعه راحت‌تر بشه.</p></div><span className="category-icon"><CarFront size={26}/></span></div><div className="vehicle-fields"><label><span className="field-label">برند خودرو</span><select className="field-select" value={make} onChange={(event) => setMake(event.target.value)}><option>پژو</option><option>ایران‌خودرو</option><option>سایپا</option><option>ام‌وی‌ام</option><option>جک</option></select></label><label><span className="field-label">مدل خودرو</span><select className="field-select" value={model} onChange={(event) => setModel(event.target.value)}><option>۲۰۶</option><option>۲۰۷</option><option>پارس</option><option>دنا</option><option>تیبا</option><option>شاهین</option></select></label><label><span className="field-label">سال ساخت</span><select className="field-select" value={year} onChange={(event) => setYear(event.target.value)}><option>همه سال‌ها</option><option>۱۳۹۵ تا ۱۴۰۰</option><option>۱۴۰۰ به بعد</option></select></label><Link className="btn btn-primary vehicle-submit" href={"/search/?q="+encodeURIComponent(make+" "+model)}><Search size={17}/>پیدا کردن قطعه</Link></div><p style={{margin:"12px 0 0",fontSize:10,color:"var(--text-secondary)"}}>انتخاب خودرو در این نسخه نمایشی، جستجوی نمونه را انجام می‌دهد؛ سازگاری نهایی باید با کد فنی تأیید شود.</p></div>;
}

export function TrustStrip() {
  const items = [{icon:ShieldCheck,title:"انتخاب آگاهانه",caption:"راهنمای سازگاری قطعه"},{icon:PackageCheck,title:"اطلاعات شفاف",caption:"مشخصات و کاربرد محصول"},{icon:Truck,title:"آماده برای ارسال",caption:"نمایش تجربه خرید یکپارچه"},{icon:Headphones,title:"پشتیبانی تخصصی",caption:"راهنمایی پیش از خرید"}];
  return <div className="trust-row">{items.map(({icon: Icon,title,caption})=><div className="trust-item" key={title}><span className="trust-icon"><Icon size={21}/></span><span><strong>{title}</strong><small>{caption}</small></span></div>)}</div>;
}

export function SearchResults({ query }: { query: string }) {
  const normalized = query.trim().toLocaleLowerCase("fa");
  const results = products.filter((product) => (product.title+" "+product.brand+" "+product.fitment+" "+product.category).toLocaleLowerCase("fa").includes(normalized));
  return <><p style={{color:"var(--color-muted)",marginTop:0}}>{query ? "نتایج جستجو برای «"+query+"»" : "برای پیدا کردن قطعه، نام یا کد آن را جستجو کنید."}</p><ProductGrid items={query ? results : products}/></>;
}

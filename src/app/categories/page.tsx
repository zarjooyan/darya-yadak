import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { categories, products } from "@/lib/catalog";
import { Footer, Header, ProductGrid } from "@/components/storefront";

export const metadata: Metadata = {
  title: "دسته‌بندی لوازم یدکی خودرو",
  description: "دسته‌بندی قطعات موتور، بدنه و چراغ، قطعات برقی و جلوبندی خودرو را در دریا پارت بررسی کنید.",
  alternates: { canonical: "/categories/" },
};

export default function CategoriesPage() {
  return <><Header/><main><section className="section"><div className="container"><span className="eyebrow">فروشگاه دریا پارت</span><h1 style={{fontSize:32,margin:"10px 0"}}>دسته‌بندی لوازم یدکی خودرو</h1><p style={{color:"var(--color-muted)",maxWidth:720}}>برای پیدا کردن قطعه مناسب، از دسته‌بندی موردنیاز شروع کنید. مشخصات و سازگاری قطعات را پیش از خرید بررسی کنید.</p><div className="category-grid" style={{marginTop:28}}>{categories.map((category)=><Link className="category-card" key={category.slug} href={"/category/"+category.slug+"/"}><span className="category-icon">{category.icon}</span><h2>{category.title}</h2><p>{category.description}</p><span className="category-count">{category.count} <ArrowLeft size={12} style={{display:"inline",verticalAlign:"middle"}}/></span></Link>)}</div></div></section><section className="section products-section"><div className="container"><div className="section-heading"><div><span className="eyebrow">کاتالوگ نمونه</span><h2>مشاهده محصولات</h2></div></div><ProductGrid items={products}/></div></section></main><Footer/></>;
}

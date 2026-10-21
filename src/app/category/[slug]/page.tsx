import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { categories, products } from "@/lib/catalog";
import { Footer, Header, ProductGrid } from "@/components/storefront";

export function generateStaticParams() { return categories.map((category) => ({ slug: category.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) return { title: "دسته‌بندی پیدا نشد" };
  return {
    title: "خرید " + category.title,
    description: category.description + "؛ مشاهده محصولات مرتبط، مشخصات و راهنمای انتخاب قطعه در دریا یدک.",
    alternates: { canonical: "/category/" + category.slug + "/" },
    openGraph: { title: "خرید " + category.title + " | دریا یدک", description: category.description, type: "website" },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const items = products.filter((product) => product.category === slug);
  const baseUrl = "https://zarjooyan.github.io/darya-yadak";
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: category.title, description: category.description, url: baseUrl + "/category/" + category.slug + "/", mainEntity: { "@type": "ItemList", itemListElement: items.map((product, index) => ({ "@type": "ListItem", position: index + 1, url: baseUrl + "/product/" + product.slug + "/", name: product.title })) } };
  return <><Header/><main><section className="section"><div className="container"><nav aria-label="مسیر صفحه" style={{fontSize:11,color:"var(--color-muted)",marginBottom:20}}><Link href="/">صفحه اصلی</Link>　/　<Link href="/categories/">دسته‌بندی‌ها</Link>　/　<span>{category.title}</span></nav><span className="eyebrow">دسته‌بندی قطعات</span><h1 style={{fontSize:32,margin:"10px 0"}}>{category.title}</h1><p style={{color:"var(--color-muted)",maxWidth:720}}>{category.description}. محصولات و مشخصات زیر نمونه هستند؛ سازگاری قطعه را قبل از خرید با کد فنی تأیید کنید.</p><div style={{marginTop:30}}><ProductGrid items={items}/></div><div style={{marginTop:28}}><Link className="text-link" href="/categories/">مشاهده همه دسته‌بندی‌ها <ArrowLeft size={16}/></Link></div></div></section></main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><Footer/></>;
}

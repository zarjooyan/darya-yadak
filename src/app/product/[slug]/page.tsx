import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CarFront, CheckCircle2, CircleHelp, ShieldCheck } from "lucide-react";
import { categories, getProduct, getProductImageSrc, products } from "@/lib/catalog";
import { Footer, Header, ProductGrid } from "@/components/storefront";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "محصول پیدا نشد" };
  const title = (product.seoTitle || product.title) + " | مشخصات و کاربرد";
  const image = new URL(getProductImageSrc(product.image), "https://zarjooyan.github.io").toString();
  return {
    title,
    description: product.seoDescription || product.shortDescription || "مشاهده مشخصات " + product.title + "، برند " + product.brand + "، کاربرد " + product.fitment + " و نکات انتخاب قطعه در دریا پارت.",
    alternates: { canonical: "/product/" + product.slug + "/" },
    openGraph: { title: title + " - دریا پارت", description: product.seoDescription || product.shortDescription || "مشخصات و کاربرد " + product.title, images: [{ url: image, alt: product.title }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const category = categories.find((item) => item.slug === product.category);
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0,4);
  const baseUrl = "https://zarjooyan.github.io/darya-yadak";
  const schema = {
    "@context": "https://schema.org", "@type": "Product", name: product.title,
    description: product.shortDescription || product.content || ("قطعه " + product.title + " از برند " + product.brand + ". کاربرد: " + product.fitment),
    image: [new URL(getProductImageSrc(product.image), baseUrl).toString()], sku: product.sku || product.id, brand: { "@type": "Brand", name: product.brand },
    category: category?.title, url: baseUrl + "/product/" + product.slug + "/",
  };
  return <><Header/><main><section className="section"><div className="container"><nav aria-label="مسیر صفحه" style={{fontSize:11,color:"var(--color-muted)",marginBottom:24}}><Link href="/">صفحه اصلی</Link>　/　<Link href="/categories/">دسته‌بندی‌ها</Link>　/　{category && <><Link href={"/category/"+category.slug+"/"}>{category.title}</Link>　/　</>}{product.title}</nav><div className="product-detail-grid"><div className="product-detail-photo"><img src={getProductImageSrc(product.image)} alt={product.title}/></div><div className="product-detail-info"><span className="eyebrow">مشخصات محصول</span><p className="product-brand" style={{marginTop:14}}>برند: {product.brand}</p><h1>{product.title}</h1>{product.shortDescription && <p className="product-short-description">{product.shortDescription}</p>}<div className="product-rating">★ {product.rating} <span>({product.reviews} دیدگاه نمونه)</span></div><p className="product-fitment" style={{fontSize:13,marginTop:18}}><CarFront size={18}/> خودروهای سازگار اعلام‌شده: {product.fitment}</p><div className="product-demo-notice"><CircleHelp size={18}/><span>برای استعلام قیمت، موجودی و اطمینان از سازگاری قطعه با خودروی خود تماس بگیرید.</span></div><div className="product-detail-benefits"><span><CheckCircle2 size={16}/> بررسی کد فنی قبل از سفارش</span><span><ShieldCheck size={16}/> تأیید اصالت از فروشنده</span><span><BadgeCheck size={16}/> انتخاب متناسب با مدل خودرو</span></div><Link href="/contact/" className="btn btn-primary" style={{marginTop:22}}>راهنمایی برای انتخاب قطعه <ArrowLeft size={16}/></Link></div></div><section style={{marginTop:54}}>{product.content && <div className="product-long-description"><h2 style={{fontSize:23}}>توضیحات محصول</h2><p style={{whiteSpace:"pre-wrap",lineHeight:2.2,color:"var(--color-muted)"}}>{product.content}</p></div>}<h2 style={{fontSize:23,marginTop:30}}>نکات مهم پیش از خرید</h2><p style={{color:"var(--color-muted)",maxWidth:850,lineHeight:2.2}}>نام خودرو به‌تنهایی برای تضمین سازگاری کافی نیست. سال ساخت، تیپ، کد موتور، شماره فنی قطعه و تفاوت نسخه‌های تولید را بررسی کنید. برای قطعات ایمنی مانند ترمز و تعلیق، نصب و تأیید متخصص اهمیت ویژه دارد.</p><h2 style={{fontSize:23,marginTop:30}}>محصولات مرتبط</h2><div style={{marginTop:18}}><ProductGrid items={related}/></div></section></div></section></main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><Footer/></>;
}

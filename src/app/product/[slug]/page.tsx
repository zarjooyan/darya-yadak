import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, CarFront, CheckCircle2, CircleHelp, ShieldCheck } from "lucide-react";
import { categories, formatPrice, getProduct, products } from "@/lib/catalog";
import { Footer, Header, ProductGrid } from "@/components/storefront";

export function generateStaticParams() { return products.map((product) => ({ slug: product.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "محصول پیدا نشد" };
  const title = product.title + " | قیمت و مشخصات";
  return {
    title,
    description: "مشاهده مشخصات " + product.title + "، برند " + product.brand + "، کاربرد " + product.fitment + " و نکات انتخاب قطعه در دریا یدک.",
    alternates: { canonical: "/product/" + product.slug + "/" },
    openGraph: { title: title + " - دریا یدک", description: "مشخصات، کاربرد و قیمت نمونه " + product.title, images: [{ url: product.image, alt: product.title }] },
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
    description: "قطعه " + product.title + " از برند " + product.brand + ". کاربرد نمونه: " + product.fitment,
    image: [product.image], sku: product.id, brand: { "@type": "Brand", name: product.brand },
    category: category?.title, url: baseUrl + "/product/" + product.slug + "/",
    offers: { "@type": "Offer", url: baseUrl + "/product/" + product.slug + "/", priceCurrency: "IRR", price: product.price * 10, availability: "https://schema.org/PreOrder", itemCondition: "https://schema.org/NewCondition" },
  };
  return <><Header/><main><section className="section"><div className="container"><nav aria-label="مسیر صفحه" style={{fontSize:11,color:"var(--color-muted)",marginBottom:24}}><Link href="/">صفحه اصلی</Link>　/　<Link href="/categories/">دسته‌بندی‌ها</Link>　/　{category && <><Link href={"/category/"+category.slug+"/"}>{category.title}</Link>　/　</>}{product.title}</nav><div className="product-detail-grid"><div className="product-detail-photo"><img src={product.image} alt={product.title}/></div><div className="product-detail-info"><span className="eyebrow">مشخصات محصول</span><p className="product-brand" style={{marginTop:14}}>برند: {product.brand}</p><h1>{product.title}</h1><div className="product-rating">★ {product.rating} <span>({product.reviews} دیدگاه نمونه)</span></div><p className="product-fitment" style={{fontSize:13,marginTop:18}}><CarFront size={18}/> خودروهای سازگار اعلام‌شده: {product.fitment}</p><div className="product-detail-price"><span>قیمت نمایشی</span><strong>{formatPrice(product.price)}</strong>{product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}</div><div className="product-demo-notice"><CircleHelp size={18}/><span>این یک نمونه نمایشی است؛ قیمت، موجودی و اصالت کالا باید پیش از خرید از فروشنده واقعی تأیید شود.</span></div><div className="product-detail-benefits"><span><CheckCircle2 size={16}/> بررسی کد فنی قبل از سفارش</span><span><ShieldCheck size={16}/> تأیید اصالت از فروشنده</span><span><BadgeCheck size={16}/> انتخاب متناسب با مدل خودرو</span></div><Link href="/contact/" className="btn btn-primary" style={{marginTop:22}}>راهنمایی برای انتخاب قطعه <ArrowLeft size={16}/></Link></div></div><section style={{marginTop:54}}><h2 style={{fontSize:23}}>نکات مهم پیش از خرید</h2><p style={{color:"var(--color-muted)",maxWidth:850,lineHeight:2.2}}>نام خودرو به‌تنهایی برای تضمین سازگاری کافی نیست. سال ساخت، تیپ، کد موتور، شماره فنی قطعه و تفاوت نسخه‌های تولید را بررسی کنید. برای قطعات ایمنی مانند ترمز و تعلیق، نصب و تأیید متخصص اهمیت ویژه دارد.</p><h2 style={{fontSize:23,marginTop:30}}>محصولات مرتبط</h2><div style={{marginTop:18}}><ProductGrid items={related}/></div></section></div></section></main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><Footer/></>;
}

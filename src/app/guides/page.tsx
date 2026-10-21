import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CarFront, CheckCircle2, ShieldCheck } from "lucide-react";
import { Footer, Header } from "@/components/storefront";

export const metadata: Metadata = {
  title: "راهنمای خرید و انتخاب لوازم یدکی خودرو",
  description: "راهنمای بررسی سازگاری قطعه با خودرو، کد فنی، اصالت کالا و نکات مهم پیش از خرید لوازم یدکی.",
  alternates: { canonical: "/guides/" },
};

const faq = [
  { q: "آیا مدل خودرو برای انتخاب قطعه کافی است؟", a: "خیر. سال ساخت، تیپ، کد موتور و شماره فنی قطعه می‌توانند تفاوت ایجاد کنند. قبل از خرید، سازگاری را با کاتالوگ معتبر یا متخصص بررسی کنید." },
  { q: "چطور قطعه اصلی را از نمونه تقلبی تشخیص بدهم؟", a: "بسته‌بندی و شناسه محصول را بررسی کنید، از فروشنده معتبر خرید کنید و در صورت امکان اصالت را از مسیر رسمی سازنده استعلام بگیرید. ظاهر به‌تنهایی تضمین‌کننده اصالت نیست." },
  { q: "قبل از نهایی کردن سفارش چه اطلاعاتی بگیرم؟", a: "قیمت نهایی، موجودی واقعی، ضمانت، شرایط بازگشت، هزینه و زمان ارسال و سازگاری قطعه را روشن کنید." },
];

export default function GuidesPage() {
  const schema = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) };
  return <><Header/><main><section className="section"><div className="container"><span className="eyebrow">راهنمای تخصصی</span><h1 style={{fontSize:32,margin:"10px 0"}}>راهنمای خرید لوازم یدکی خودرو</h1><p style={{maxWidth:800,color:"var(--color-muted)",lineHeight:2.2}}>برای انتخاب قطعه مناسب، فقط به نام و قیمت نگاه نکن. سازگاری، کد فنی، اصالت، ضمانت و شرایط فروش را در کنار هم بررسی کن. این راهنما برای تصمیم‌گیری آگاهانه‌تر آماده شده است.</p><div className="guide-grid" style={{marginTop:28}}><article className="guide-card" id="fitment"><span className="guide-number"><CarFront size={19}/></span><h2>۱. سازگاری قطعه با خودرو</h2><p>مدل، سال ساخت، تیپ و کد موتور را بررسی کن. در برخی خودروها یک مدل با موتور یا تیپ متفاوت از قطعات یکسانی استفاده نمی‌کند.</p><ul><li>کد موتور و تیپ دقیق</li><li>شماره فنی یا OEM</li><li>سمت نصب و نسخه تولید</li></ul></article><article className="guide-card" id="authenticity"><span className="guide-number"><ShieldCheck size={19}/></span><h2>۲. بررسی اصالت و کیفیت</h2><p>از فروشنده معتبر خرید کن و شناسه کالا، بسته‌بندی، برچسب و اطلاعات تولیدکننده را بررسی کن.</p><ul><li>استعلام از مسیر رسمی</li><li>فاکتور و ضمانت معتبر</li><li>پرهیز از قیمت غیرعادی</li></ul></article><article className="guide-card" id="checklist"><span className="guide-number"><CheckCircle2 size={19}/></span><h2>۳. چک‌لیست قبل از سفارش</h2><p>پیش از پرداخت، جزئیات سفارش و سیاست‌های فروشگاه را به‌روشنی بدان.</p><ul><li>موجودی و قیمت نهایی</li><li>ضمانت و شرایط مرجوعی</li><li>هزینه و زمان ارسال</li></ul></article></div><section style={{marginTop:55}}><h2 style={{fontSize:24}}>پرسش‌های متداول خرید قطعه</h2><div className="faq-list" style={{marginTop:18}}>{faq.map((item)=><article className="faq-item" key={item.q}><h3>{item.q}</h3><p>{item.a}</p></article>)}</div></section><div style={{marginTop:30}}><Link className="btn btn-primary" href="/categories/">مشاهده دسته‌بندی قطعات <ArrowLeft size={16}/></Link></div></div></section></main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><Footer/></>;
}

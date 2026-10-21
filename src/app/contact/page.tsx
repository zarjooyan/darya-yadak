import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Headphones, Mail, MessageCircle, ShieldCheck } from "lucide-react";
import { Footer, Header } from "@/components/storefront";

export const metadata: Metadata = {
  title: "تماس با دریا یدک",
  description: "اطلاعات تماس نمونه و راهنمای ارتباط با فروشگاه لوازم یدکی خودرو دریا یدک.",
  alternates: { canonical: "/contact/" },
};

export default function ContactPage() {
  return <><Header/><main><section className="section"><div className="container"><span className="eyebrow">پشتیبانی دریا یدک</span><h1 style={{fontSize:32,margin:"10px 0"}}>قبل از خرید، با اطمینان سؤال بپرس</h1><p style={{maxWidth:700,color:"var(--color-muted)",lineHeight:2.2}}>برای انتخاب قطعه مناسب، ابتدا مدل خودرو، سال ساخت، کد موتور و در صورت امکان شماره فنی قطعه را آماده کن. اطلاعات تماس واقعی پس از راه‌اندازی کسب‌وکار به این صفحه اضافه می‌شود.</p><div className="guide-grid" style={{marginTop:28}}><article className="guide-card"><span className="guide-number"><Headphones size={20}/></span><h2>راهنمای انتخاب قطعه</h2><p>اگر درباره سازگاری قطعه مطمئن نیستی، مشخصات خودرو و شماره فنی را با فروشنده یا تعمیرکار معتبر بررسی کن.</p><Link className="text-link" href="/guides/">مطالعه راهنما <ArrowLeft size={15}/></Link></article><article className="guide-card"><span className="guide-number"><MessageCircle size={20}/></span><h2>پاسخ به پرسش‌ها</h2><p>اطلاعات موجودی، ضمانت، شرایط بازگشت و هزینه ارسال را پیش از پرداخت از فروشنده واقعی استعلام کن.</p><Link className="text-link" href="/guides/#checklist">چک‌لیست خرید <ArrowLeft size={15}/></Link></article><article className="guide-card"><span className="guide-number"><Mail size={20}/></span><h2>اطلاعات تماس</h2><p>این نسخه نمایشی است و هنوز شماره تلفن، ایمیل یا آدرس تأییدشده‌ای برای کسب‌وکار تعریف نشده است.</p><span style={{display:"inline-flex",gap:8,alignItems:"center",fontSize:11,color:"var(--color-primary-700)"}}><ShieldCheck size={16}/> بدون اطلاعات تماس ساختگی</span></article></div><div id="about" style={{marginTop:50,padding:25,border:"1px solid var(--color-border)",borderRadius:18}}><h2 style={{marginTop:0}}>درباره دریا یدک</h2><p style={{color:"var(--color-muted)",lineHeight:2.2,marginBottom:0}}>دریا یدک یک نمونه فروشگاه اینترنتی فارسی برای جستجو و بررسی لوازم یدکی خودرو است. محصولات و قیمت‌های فعلی صرفاً جهت نمایش رابط کاربری هستند و به فروشنده یا انبار واقعی متصل نیستند.</p></div></div></section></main><Footer/></>;
}

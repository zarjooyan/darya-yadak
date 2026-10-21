import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-vazirmatn",
  display: "swap",
});

const siteUrl = "https://zarjooyan.github.io/darya-yadak";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "دریا یدک | فروشگاه تخصصی لوازم یدکی خودرو",
    template: "%s | دریا یدک",
  },
  description: "خرید و بررسی لوازم یدکی خودرو با راهنمای انتخاب قطعه، مشخصات فنی و دسته‌بندی تخصصی. قطعه مناسب خودروی خود را در دریا یدک پیدا کنید.",
  applicationName: "دریا یدک",
  keywords: ["لوازم یدکی خودرو", "خرید قطعات خودرو", "قطعات پژو ۲۰۶", "قطعات پژو ۲۰۷", "فیلتر روغن", "قطعات موتور"],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: siteUrl,
    siteName: "دریا یدک",
    title: "دریا یدک | فروشگاه تخصصی لوازم یدکی خودرو",
    description: "قطعه مناسب خودروی خود را ساده‌تر پیدا کنید.",
  },
  twitter: {
    card: "summary_large_image",
    title: "دریا یدک | فروشگاه تخصصی لوازم یدکی خودرو",
    description: "خرید و بررسی لوازم یدکی خودرو با راهنمای انتخاب قطعه.",
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
};

export const viewport: Viewport = {
  themeColor: "#101923",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "دریا یدک",
  url: siteUrl,
  description: "فروشگاه تخصصی لوازم یدکی خودرو",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "دریا یدک",
  url: siteUrl,
  inLanguage: "fa-IR",
  potentialAction: {
    "@type": "SearchAction",
    target: siteUrl + "/search/?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazirmatn.variable}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
        {children}
      </body>
    </html>
  );
}

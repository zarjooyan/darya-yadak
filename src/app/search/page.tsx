import type { Metadata } from "next";
import SearchPageClient from "@/components/search-page";

export const metadata: Metadata = {
  title: "جستجوی لوازم یدکی خودرو",
  description: "جستجو در کاتالوگ نمونه لوازم یدکی خودرو بر اساس نام قطعه، برند یا مدل خودرو.",
  robots: { index: false, follow: true },
};

export default function SearchPage() { return <SearchPageClient/>; }

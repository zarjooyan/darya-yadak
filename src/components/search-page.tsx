"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Footer, Header, SearchResults } from "@/components/storefront";

function SearchContent() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  useEffect(() => setQuery(searchParams.get("q") ?? ""), [searchParams]);
  return <section className="section"><div className="container"><span className="eyebrow">جستجوی قطعات</span><h1 style={{fontSize:30,margin:"10px 0 22px"}}>جستجوی لوازم یدکی خودرو</h1><SearchResults query={query}/></div></section>;
}

export default function SearchPageClient() {
  return <><Header/><main><Suspense fallback={<section className="section"><div className="container">در حال آماده‌سازی جستجو...</div></section>}><SearchContent/></Suspense></main><Footer/></>;
}

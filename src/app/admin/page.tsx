import "./admin.css";
"use client";

import { useEffect, useState } from "react";
import ProductAdmin from "@/components/admin/product-admin";

export default function AdminPage() {
  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    setIsDevelopment(process.env.NODE_ENV === "development");
  }, []);

  if (!isDevelopment) return null;
  return <ProductAdmin />;
}

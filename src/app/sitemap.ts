import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/catalog";

export const dynamic = "force-static";

const baseUrl = "https://zarjooyan.github.io/darya-yadak";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/categories", "/guides", "/contact"];
  return [
    ...staticRoutes.map((route) => ({ url: baseUrl + route + "/", lastModified: new Date(), changeFrequency: "weekly" as const, priority: route === "" ? 1 : 0.7 })),
    ...categories.map((category) => ({ url: baseUrl + "/category/" + category.slug + "/", lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.75 })),
    ...products.map((product) => ({ url: baseUrl + "/product/" + product.slug + "/", lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}

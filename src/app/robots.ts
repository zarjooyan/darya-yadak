import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://zarjooyan.github.io/darya-yadak/sitemap.xml",
  };
}

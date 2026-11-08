import type { MetadataRoute } from "next";

const basePath = process.env.NODE_ENV === "production" ? "/darya-yadak" : "";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: basePath + "/",
    name: "دریا پارت | قطعات یدکی خودرو",
    short_name: "دریا پارت",
    description: "فروشگاه تخصصی قطعات یدکی خودرو؛ راهنمای انتخاب و بررسی قطعه مناسب.",
    start_url: basePath + "/",
    scope: basePath + "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait-primary",
    lang: "fa-IR",
    dir: "rtl",
    categories: ["shopping"],
    theme_color: "#0B1220",
    background_color: "#F8FAFC",
    icons: [
      {
        src: basePath + "/darya-part-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: basePath + "/darya-part-icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

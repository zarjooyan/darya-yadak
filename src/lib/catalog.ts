import productData from "@/data/products.json";
import categoryData from "@/data/categories.json";

export type Category = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  count: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  fitment: string;
  image: string;
  badge?: string;
  sku?: string;
  oemCode?: string;
  shortDescription?: string;
  content?: string;
  seoTitle?: string;
  seoDescription?: string;
  status?: "draft" | "published";
};

export const categories: Category[] = categoryData as Category[];

export const products: Product[] = (productData as Product[]).filter(
  (product) => product.status === "published",
);

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
export const getCategory = (slug: string) => categories.find((category) => category.slug === slug);

export const getProductImageSrc = (image: string) =>
  image.startsWith("/uploads/") && process.env.NODE_ENV === "production"
    ? "/darya-yadak" + image
    : image;

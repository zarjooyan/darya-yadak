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
};

export const categories: Category[] = [
  { slug: "engine", title: "قطعات موتور", description: "فیلتر، تسمه، شمع و قطعات مصرفی", icon: "⚙️", count: "۲۴۰+ محصول" },
  { slug: "body", title: "بدنه و چراغ", description: "چراغ، آینه و قطعات بدنه", icon: "🚘", count: "۱۸۰+ محصول" },
  { slug: "electrical", title: "برقی و الکترونیکی", description: "باتری، سنسور و تجهیزات برقی", icon: "⚡", count: "۱۶۰+ محصول" },
  { slug: "suspension", title: "جلوبندی و تعلیق", description: "کمک‌فنر، بوش و قطعات فرمان", icon: "🛞", count: "۱۳۰+ محصول" },
];

export const products: Product[] = [
  { id: "p1", slug: "oil-filter-206-tu5", title: "فیلتر روغن پژو ۲۰۶ و ۲۰۷ TU5", brand: "ایساکو", category: "engine", price: 185000, oldPrice: 220000, rating: 4.8, reviews: 36, fitment: "۲۰۶ تیپ ۵، ۲۰۷، رانا", image: "https://images.unsplash.com/photo-1635784063386-9a5b5b4e9f89?auto=format&fit=crop&w=900&q=85", badge: "پرفروش" },
  { id: "p2", slug: "spark-plug-tu5", title: "شمع موتور مناسب TU5 (دست ۴ عددی)", brand: "NGK", category: "engine", price: 890000, rating: 4.9, reviews: 21, fitment: "۲۰۶، ۲۰۷، پارس TU5", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=85", badge: "انتخاب کاربران" },
  { id: "p3", slug: "front-brake-pad-206", title: "لنت ترمز جلو پژو ۲۰۶", brand: "تکستار", category: "suspension", price: 1250000, oldPrice: 1390000, rating: 4.7, reviews: 18, fitment: "۲۰۶ و ۲۰۷", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=85" },
  { id: "p4", slug: "headlight-207", title: "چراغ جلو پژو ۲۰۷ (سمت چپ)", brand: "مدرن", category: "body", price: 2450000, rating: 4.6, reviews: 12, fitment: "پژو ۲۰۷", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85" },
  { id: "p5", slug: "battery-55ah", title: "باتری ۵۵ آمپر مناسب خودروهای شهری", brand: "سپاهان", category: "electrical", price: 2850000, rating: 4.8, reviews: 29, fitment: "با بررسی ابعاد و پایه باتری", image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=900&q=85", badge: "ارسال سریع" },
  { id: "p6", slug: "timing-belt-tu5", title: "تسمه تایم موتور TU5", brand: "PowerGrip", category: "engine", price: 1680000, oldPrice: 1850000, rating: 4.7, reviews: 15, fitment: "۲۰۶، ۲۰۷، رانا TU5", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=85" },
  { id: "p7", slug: "side-mirror-206", title: "آینه جانبی پژو ۲۰۶ برقی", brand: "ایمن‌تک", category: "body", price: 1980000, rating: 4.5, reviews: 9, fitment: "پژو ۲۰۶", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=85" },
  { id: "p8", slug: "shock-absorber-206", title: "کمک‌فنر جلو پژو ۲۰۶ (جفت)", brand: "عظام", category: "suspension", price: 3750000, rating: 4.8, reviews: 17, fitment: "۲۰۶ و ۲۰۷", image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=85" },
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("fa-IR").format(price) + " تومان";

export const getProduct = (slug: string) => products.find((product) => product.slug === slug);
export const getCategory = (slug: string) => categories.find((category) => category.slug === slug);

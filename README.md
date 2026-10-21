# دریا یدک | Darya Yadak

فروشگاه نمایشی لوازم یدکی خودرو با **Next.js App Router، React، TypeScript و Tailwind CSS v4**. رابط کاربری فارسی و راست‌چین است و از Design System مبتنی بر آبی روشن/پررنگ و خاکستری زغالی استفاده می‌کند.

## شروع توسعه

```bash
npm install
npm run dev
```

## Build و انتشار

```bash
npm run build
```

Next.js با `output: "export"` فایل‌های استاتیک را در پوشه `out/` می‌سازد. هر push به شاخه `main`، workflow گیت‌هاب اکشنز را برای build و انتشار روی GitHub Pages اجرا می‌کند.

آدرس هدف: https://zarjooyan.github.io/darya-yadak/

اگر GitHub Pages قبلاً فعال نشده باشد، در مخزن به Settings → Pages بروید و Build and deployment → Source را روی **GitHub Actions** بگذارید.

## امکانات فعلی

- صفحه اصلی واکنش‌گرا، جستجوی نمونه و انتخاب خودرو
- دسته‌بندی‌ها و صفحات استاتیک محصولات با URL خوانا
- Design tokens، کامپوننت‌های مشترک و پالت رنگ یکپارچه
- عنوان و توضیحات متا، canonical، Open Graph و metadata زبان فارسی
- Schema برای Organization، WebSite/SearchAction، Product، CollectionPage و FAQ
- تولید sitemap و robots.txt
- لینک‌سازی داخلی بین منو، دسته‌بندی، محصول، راهنما و صفحات مرتبط
- مسیر انتشار خودکار با GitHub Actions

## نکات مهم

این نسخه یک **prototype** است. محصولات، قیمت‌ها، امتیازها و تصاویر نمونه‌اند؛ پرداخت، موجودی زنده، حساب کاربری، سبد خرید واقعی، API و اطلاعات تماس واقعی هنوز پیاده‌سازی نشده‌اند. برای فروش واقعی باید کاتالوگ معتبر و backend به آن متصل شود.

GitHub Pages فقط خروجی استاتیک را میزبانی می‌کند؛ قابلیت‌های نیازمند سرور Next.js مانند API Routes و SSR وابسته به درخواست روی این هاست اجرا نمی‌شوند. برای آن قابلیت‌ها به یک میزبان دارای runtime سرور نیاز است.

برای سئوی واقعی نیز پس از اتصال دامنه نهایی، آدرس canonical و sitemap را با همان دامنه تنظیم کنید، سایت را در Google Search Console ثبت کنید و داده‌های ساختاریافته را با قیمت/موجودی واقعی و مطابق محتوای قابل مشاهده نگه دارید. Schema به‌تنهایی تضمین نمایش rich result نیست.

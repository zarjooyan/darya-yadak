import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inputPath = path.resolve(process.cwd(), process.argv[2] ?? "darya-part-products.json");
const outputPath = path.join(root, "src/data/products.json");

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

try {
  const imported = JSON.parse(await readFile(inputPath, "utf8"));
  if (!Array.isArray(imported) || imported.length === 0) {
    throw new Error("فایل باید آرایه‌ای غیرخالی از محصولات باشد.");
  }

  const current = JSON.parse(await readFile(outputPath, "utf8"));
  const currentById = new Map(current.map((product) => [product.id, product]));
  const ids = new Set();
  const slugs = new Set();

  const products = imported.map((product, index) => {
    if (
      !isObject(product) ||
      typeof product.id !== "string" ||
      typeof product.slug !== "string" ||
      typeof product.title !== "string" ||
      typeof product.category !== "string" ||
      !product.id.trim() ||
      !product.slug.trim() ||
      !product.title.trim()
    ) {
      throw new Error(`اطلاعات محصول در ردیف ${index + 1} ناقص است.`);
    }

    if (ids.has(product.id)) throw new Error(`شناسه تکراری: ${product.id}`);
    if (slugs.has(product.slug)) throw new Error(`Slug تکراری: ${product.slug}`);
    ids.add(product.id);
    slugs.add(product.slug);

    const previous = currentById.get(product.id) ?? {};
    return {
      ...previous,
      ...product,
      price: Number.isFinite(product.price) ? product.price : previous.price ?? 0,
      rating: Number.isFinite(product.rating) ? product.rating : previous.rating ?? 0,
      reviews: Number.isFinite(product.reviews) ? product.reviews : previous.reviews ?? 0,
      image: typeof product.image === "string" ? product.image : previous.image ?? "",
      status: product.status === "published" ? "published" : "draft",
    };
  });

  await writeFile(outputPath, `${JSON.stringify(products, null, 2)}\n`);
  console.log(`با موفقیت ${products.length} محصول در src/data/products.json ذخیره شد.`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}

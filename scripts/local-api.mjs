import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productsPath = path.join(root, "src/data/products.json");
const uploadsPath = path.join(root, "public/uploads/products");
const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);
const allowedOrigin = /^http:\/\/(localhost|127\.0\.0\.1):30(?:0[0-9]|10)$/;

const send = (response, status, data) => {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
};

const readJson = async (request, limit = 12 * 1024 * 1024) => {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > limit) throw new Error("درخواست بیش از حد بزرگ است.");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const server = createServer(async (request, response) => {
  const origin = request.headers.origin;
  if (origin && !allowedOrigin.test(origin)) return send(response, 403, { error: "Origin not allowed" });
  if (origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    return response.end();
  }

  const url = new URL(request.url ?? "/", "http://localhost:3031");
  try {
    if (request.method === "GET" && url.pathname === "/health") {
      return send(response, 200, { ok: true });
    }
    if (request.method === "GET" && url.pathname === "/products") {
      const products = JSON.parse(await readFile(productsPath, "utf8"));
      return send(response, 200, products);
    }
    if (request.method === "PUT" && url.pathname === "/products") {
      const products = await readJson(request);
      if (!Array.isArray(products)) return send(response, 400, { error: "محصولات باید آرایه باشند." });
      const ids = new Set();
      const slugs = new Set();
      for (const product of products) {
        if (!product || typeof product.id !== "string" || typeof product.slug !== "string" || typeof product.title !== "string" || !product.id.trim() || !product.slug.trim() || !product.title.trim()) {
          return send(response, 400, { error: "اطلاعات ضروری محصول ناقص است." });
        }
        if (ids.has(product.id) || slugs.has(product.slug)) {
          return send(response, 400, { error: "شناسه یا Slug تکراری است." });
        }
        ids.add(product.id);
        slugs.add(product.slug);
      }
      await writeFile(productsPath, `${JSON.stringify(products, null, 2)}\n`);
      return send(response, 200, { success: true, count: products.length });
    }
    if (request.method === "POST" && url.pathname === "/upload") {
      const { name, mimeType, base64 } = await readJson(request, 12 * 1024 * 1024);
      const extension = allowedTypes.get(mimeType);
      if (!extension || typeof base64 !== "string" || !base64) return send(response, 400, { error: "فرمت تصویر پشتیبانی نمی‌شود." });
      const image = Buffer.from(base64, "base64");
      if (!image.length || image.length > 8 * 1024 * 1024) return send(response, 400, { error: "حجم تصویر باید کمتر از ۸ مگابایت باشد." });
      await mkdir(uploadsPath, { recursive: true });
      const safeName = path.basename(String(name ?? "image")).replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 40) || "image";
      const filename = `${safeName}-${randomUUID()}${extension}`;
      await writeFile(path.join(uploadsPath, filename), image, { flag: "wx" });
      return send(response, 201, { image: `/uploads/products/${filename}` });
    }
    return send(response, 404, { error: "Not found" });
  } catch (error) {
    return send(response, 500, { error: error instanceof Error ? error.message : "خطای داخلی" });
  }
});

server.listen(3031, "127.0.0.1", () => {
  console.log("Darya Part local API: http://127.0.0.1:3031");
});

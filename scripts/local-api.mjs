import { createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import webpush from "web-push";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const productsPath = path.join(root, "src/data/products.json");
const categoriesPath = path.join(root, "src/data/categories.json");
const brandsPath = path.join(root, "src/data/brands.json");
const vehiclesPath = path.join(root, "src/data/vehicles.json");
const uploadsPath = path.join(root, "public/uploads/products");
const authPath = path.join(root, ".admin-auth.json");
const pushVapidPath = path.join(root, ".push-vapid.json");
const pushSubscriptionsPath = path.join(root, ".push-subscriptions.json");
const cookieName = "darya_part_admin";
const allowedTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);
const allowedOrigin = /^http:\/\/(localhost|127\.0\.0\.1):30(?:0[0-9]|10)$/;
const sessionDuration = 8 * 60 * 60;

let authConfig = null;
try {
  authConfig = JSON.parse(await readFile(authPath, "utf8"));
} catch {
  authConfig = null;
}

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

const createSession = (response) => {
  const expires = String(Math.floor(Date.now() / 1000) + sessionDuration);
  const signature = createHmac("sha256", authConfig.secret).update(expires).digest("hex");
  response.setHeader("Set-Cookie", `${cookieName}=${expires}.${signature}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${sessionDuration}`);
};

const hasSession = (request) => {
  if (!authConfig) return false;
  const cookie = (request.headers.cookie ?? "").split(";").map((part) => part.trim()).find((part) => part.startsWith(`${cookieName}=`));
  if (!cookie) return false;
  const [expires, signature] = cookie.slice(cookieName.length + 1).split(".");
  if (!expires || !signature || Number(expires) <= Math.floor(Date.now() / 1000)) return false;
  const expected = createHmac("sha256", authConfig.secret).update(expires).digest();
  const received = Buffer.from(signature, "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
};

const readPushSubscriptions = async () => {
  try {
    const subscriptions = JSON.parse(await readFile(pushSubscriptionsPath, "utf8"));
    return Array.isArray(subscriptions) ? subscriptions : [];
  } catch {
    return [];
  }
};

const savePushSubscriptions = async (subscriptions) => {
  await writeFile(pushSubscriptionsPath, `${JSON.stringify(subscriptions, null, 2)}\n`, { mode: 0o600 });
};

const getPushConfig = async () => {
  try {
    return JSON.parse(await readFile(pushVapidPath, "utf8"));
  } catch {
    const keys = webpush.generateVAPIDKeys();
    const config = { ...keys, subject: "mailto:admin@darya-part.local" };
    await writeFile(pushVapidPath, `${JSON.stringify(config, null, 2)}\n`, { mode: 0o600 });
    return config;
  }
};

const configurePush = async () => {
  const config = await getPushConfig();
  webpush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  return config;
};

const saveAuthConfig = async (password) => {
  const salt = randomBytes(16).toString("hex");
  authConfig = {
    salt,
    hash: scryptSync(password, salt, 64).toString("hex"),
    secret: randomBytes(32).toString("hex"),
  };
  await writeFile(authPath, `${JSON.stringify(authConfig, null, 2)}\n`, { mode: 0o600 });
};

const server = createServer(async (request, response) => {
  const origin = request.headers.origin;
  if (origin && !allowedOrigin.test(origin)) return send(response, 403, { error: "Origin not allowed" });
  if (!origin && !(request.method === "GET" && request.url === "/health")) return send(response, 403, { error: "Origin header required" });
  if (origin) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Credentials", "true");
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

    if (request.method === "GET" && url.pathname === "/auth/status") {
      return send(response, 200, { configured: Boolean(authConfig), authenticated: hasSession(request) });
    }

    if (request.method === "POST" && url.pathname === "/auth/setup") {
      if (authConfig) return send(response, 409, { error: "رمز مدیر قبلاً تنظیم شده است." });
      const { password } = await readJson(request, 4096);
      if (typeof password !== "string" || password.length < 8 || password.length > 128) return send(response, 400, { error: "رمز عبور باید بین ۸ تا ۱۲۸ کاراکتر باشد." });
      await saveAuthConfig(password);
      createSession(response);
      return send(response, 200, { success: true });
    }

    if (request.method === "POST" && url.pathname === "/auth/login") {
      if (!authConfig) return send(response, 409, { error: "ابتدا رمز مدیر را تنظیم کنید." });
      const { password } = await readJson(request, 4096);
      if (typeof password !== "string") return send(response, 400, { error: "رمز عبور نامعتبر است." });
      const actual = scryptSync(password, authConfig.salt, 64);
      const expected = Buffer.from(authConfig.hash, "hex");
      if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
        return send(response, 401, { error: "رمز عبور صحیح نیست." });
      }
      createSession(response);
      return send(response, 200, { success: true });
    }

    if (request.method === "POST" && url.pathname === "/auth/logout") {
      response.setHeader("Set-Cookie", `${cookieName}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0`);
      return send(response, 200, { success: true });
    }

    if (request.method === "GET" && url.pathname === "/push/public-key") {
      const config = await configurePush();
      return send(response, 200, { publicKey: config.publicKey });
    }

    if (request.method === "POST" && url.pathname === "/push/subscribe") {
      const subscription = await readJson(request, 64 * 1024);
      if (!subscription || typeof subscription.endpoint !== "string" || !subscription.endpoint.startsWith("https://") ||
          !subscription.keys || typeof subscription.keys.p256dh !== "string" || typeof subscription.keys.auth !== "string") {
        return send(response, 400, { error: "اطلاعات اشتراک Push معتبر نیست." });
      }
      const subscriptions = await readPushSubscriptions();
      const next = subscriptions.filter((item) => item.endpoint !== subscription.endpoint);
      next.push({ endpoint: subscription.endpoint, keys: subscription.keys, createdAt: new Date().toISOString(), userAgent: String(request.headers["user-agent"] ?? "").slice(0, 300) });
      await savePushSubscriptions(next);
      return send(response, 201, { success: true });
    }

    if (request.method === "POST" && url.pathname === "/push/unsubscribe") {
      const { endpoint } = await readJson(request, 16 * 1024);
      if (typeof endpoint !== "string") return send(response, 400, { error: "آدرس اشتراک معتبر نیست." });
      const subscriptions = await readPushSubscriptions();
      const next = subscriptions.filter((item) => item.endpoint !== endpoint);
      await savePushSubscriptions(next);
      return send(response, 200, { success: true, removed: subscriptions.length - next.length });
    }

    if (!hasSession(request)) return send(response, 401, { error: "برای ادامه وارد پنل شوید." });

    if (request.method === "GET" && url.pathname === "/push/stats") {
      const subscriptions = await readPushSubscriptions();
      return send(response, 200, { count: subscriptions.length });
    }

    if (request.method === "POST" && url.pathname === "/push/send") {
      const { title, body, url: targetUrl } = await readJson(request, 16 * 1024);
      if (typeof title !== "string" || !title.trim() || title.length > 80 ||
          typeof body !== "string" || !body.trim() || body.length > 240) {
        return send(response, 400, { error: "عنوان (حداکثر ۸۰) و متن (حداکثر ۲۴۰ کاراکتر) الزامی است." });
      }
      const destination = typeof targetUrl === "string" && targetUrl.startsWith("/") && !targetUrl.startsWith("//") ? targetUrl : "/";
      await configurePush();
      const subscriptions = await readPushSubscriptions();
      const payload = JSON.stringify({ title: title.trim(), body: body.trim(), url: destination, icon: "darya-part-icon.svg", badge: "favicon.svg" });
      let sent = 0;
      let failed = 0;
      const expired = new Set();
      await Promise.all(subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(subscription, payload, { TTL: 60 * 60, urgency: "normal" });
          sent += 1;
        } catch (error) {
          failed += 1;
          if (error && (error.statusCode === 404 || error.statusCode === 410)) expired.add(subscription.endpoint);
        }
      }));
      if (expired.size) await savePushSubscriptions(subscriptions.filter((item) => !expired.has(item.endpoint)));
      return send(response, 200, { success: true, sent, failed, removed: expired.size });
    }

    if (request.method === "GET" && url.pathname === "/vehicles") {
      const vehicles = JSON.parse(await readFile(vehiclesPath, "utf8"));
      return send(response, 200, vehicles);
    }

    if (request.method === "PUT" && url.pathname === "/vehicles") {
      const vehicles = await readJson(request);
      if (!Array.isArray(vehicles)) return send(response, 400, { error: "خودروها باید آرایه باشند." });
      const slugs = new Set();
      const names = new Set();
      for (const vehicle of vehicles) {
        if (!vehicle || typeof vehicle.slug !== "string" || typeof vehicle.name !== "string" || !vehicle.slug.trim() || !vehicle.name.trim()) {
          return send(response, 400, { error: "نام و Slug خودرو الزامی است." });
        }
        if (slugs.has(vehicle.slug) || names.has(vehicle.name)) return send(response, 400, { error: "Slug یا نام خودرو تکراری است." });
        slugs.add(vehicle.slug);
        names.add(vehicle.name);
      }
      await writeFile(vehiclesPath, `${JSON.stringify(vehicles, null, 2)}\n`);
      return send(response, 200, { success: true, count: vehicles.length });
    }

    if (request.method === "GET" && url.pathname === "/brands") {
      const brands = JSON.parse(await readFile(brandsPath, "utf8"));
      return send(response, 200, brands);
    }

    if (request.method === "PUT" && url.pathname === "/brands") {
      const brands = await readJson(request);
      if (!Array.isArray(brands)) return send(response, 400, { error: "برندها باید آرایه باشند." });
      const slugs = new Set();
      const names = new Set();
      for (const brand of brands) {
        if (!brand || typeof brand.slug !== "string" || typeof brand.name !== "string" || !brand.slug.trim() || !brand.name.trim()) {
          return send(response, 400, { error: "نام و Slug برند الزامی است." });
        }
        if (slugs.has(brand.slug) || names.has(brand.name)) return send(response, 400, { error: "Slug یا نام برند تکراری است." });
        slugs.add(brand.slug);
        names.add(brand.name);
      }
      const products = JSON.parse(await readFile(productsPath, "utf8"));
      if (products.some((product) => product.brand && !names.has(product.brand))) {
        return send(response, 409, { error: "ابتدا برند محصولات وابسته را به‌روزرسانی کنید." });
      }
      await writeFile(brandsPath, `${JSON.stringify(brands, null, 2)}\n`);
      return send(response, 200, { success: true, count: brands.length });
    }

    if (request.method === "GET" && url.pathname === "/categories") {
      const categories = JSON.parse(await readFile(categoriesPath, "utf8"));
      return send(response, 200, categories);
    }

    if (request.method === "PUT" && url.pathname === "/categories") {
      const categories = await readJson(request);
      if (!Array.isArray(categories)) return send(response, 400, { error: "دسته‌بندی‌ها باید آرایه باشند." });
      const slugs = new Set();
      for (const category of categories) {
        if (!category || typeof category.slug !== "string" || typeof category.title !== "string" || !category.slug.trim() || !category.title.trim()) {
          return send(response, 400, { error: "نام و Slug دسته‌بندی الزامی است." });
        }
        if (slugs.has(category.slug)) return send(response, 400, { error: "Slug دسته‌بندی تکراری است." });
        slugs.add(category.slug);
      }
      const products = JSON.parse(await readFile(productsPath, "utf8"));
      if (products.some((product) => !slugs.has(product.category))) {
        return send(response, 409, { error: "ابتدا محصولات این دسته‌بندی را به دسته دیگری منتقل کنید." });
      }
      await writeFile(categoriesPath, `${JSON.stringify(categories, null, 2)}\n`);
      return send(response, 200, { success: true, count: categories.length });
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

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var port = Number(process.env.PORT) || 3e3;
var portArgIndex = process.argv.indexOf("--port");
if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
  const parsed = Number(process.argv[portArgIndex + 1]);
  if (!isNaN(parsed) && parsed > 0) port = parsed;
}
var host = "0.0.0.0";
var hostArgIndex = process.argv.indexOf("--host");
if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
  host = process.argv[hostArgIndex + 1];
}
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(import_express.default.json({ limit: "2mb" }));
app.get(["/sitemap.xml", "/Warraich-Goods/sitemap.xml"], (_req, res) => {
  const publicPath = import_path.default.join(process.cwd(), "public", "sitemap.xml");
  const distPath = import_path.default.join(process.cwd(), "dist", "sitemap.xml");
  res.header("Content-Type", "application/xml; charset=utf-8");
  res.header("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.header("X-CDN-Status", "Active");
  res.sendFile(publicPath, (err) => {
    if (err) res.sendFile(distPath);
  });
});
app.get(["/robots.txt", "/Warraich-Goods/robots.txt"], (_req, res) => {
  const publicPath = import_path.default.join(process.cwd(), "public", "robots.txt");
  const distPath = import_path.default.join(process.cwd(), "dist", "robots.txt");
  res.header("Content-Type", "text/plain; charset=utf-8");
  res.header("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.header("X-CDN-Status", "Active");
  res.sendFile(publicPath, (err) => {
    if (err) res.sendFile(distPath);
  });
});
app.get(["/.well-known/assetlinks.json", "/Warraich-Goods/.well-known/assetlinks.json"], (_req, res) => {
  const publicPath = import_path.default.join(process.cwd(), "public", ".well-known", "assetlinks.json");
  const distPath = import_path.default.join(process.cwd(), "dist", ".well-known", "assetlinks.json");
  res.header("Content-Type", "application/json; charset=utf-8");
  res.header("Cache-Control", "public, max-age=86400, s-maxage=86400");
  res.header("X-CDN-Status", "Active");
  res.sendFile(publicPath, (err) => {
    if (err) res.sendFile(distPath);
  });
});
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "Driver Dost API Server"
  });
});
var weatherCache = /* @__PURE__ */ new Map();
var WEATHER_CACHE_TTL = 10 * 60 * 1e3;
app.get("/api/weather", async (req, res) => {
  const { latitude, longitude } = req.query;
  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Latitude and Longitude required" });
  }
  const cacheKey = `${latitude}_${longitude}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < WEATHER_CACHE_TTL) {
    return res.json(cached.data);
  }
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,visibility&hourly=precipitation_probability&forecast_days=1&timezone=Asia%2FKarachi`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8e3);
    const apiRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!apiRes.ok) {
      throw new Error(`Open-Meteo returned status ${apiRes.status}`);
    }
    const data = await apiRes.json();
    weatherCache.set(cacheKey, { timestamp: Date.now(), data });
    return res.json(data);
  } catch (err) {
    console.warn("Weather proxy fetch error:", err.message);
    if (cached) {
      return res.json(cached.data);
    }
    return res.status(502).json({ error: "Weather upstream unavailable" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath, {
      maxAge: "1y",
      setHeaders: (res) => {
        res.setHeader("X-CDN-Status", "Active");
        res.setHeader("CDN-Cache-Control", "max-age=31536000");
      }
    }));
    app.get("*", (_req, res) => {
      res.setHeader("X-CDN-Status", "Active");
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  const server = app.listen(port, host, () => {
    console.log(`Driver Dost Server running on http://${host}:${port}`);
  });
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${port} is currently in use, process will exit cleanly.`);
      process.exit(0);
    } else {
      console.error("Server error:", err);
    }
  });
  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}
startServer().catch((err) => {
  console.error("Failed to start Driver Dost server:", err);
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map

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
var PORT = 3e3;
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
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Driver Dost Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

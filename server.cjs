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
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "2mb" }));
var geminiClient = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "") {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new import_genai.GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return geminiClient;
}
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
    service: "Driver Dost API Server",
    aiAvailable: Boolean(process.env.GEMINI_API_KEY)
  });
});
app.post("/api/ai-chat", async (req, res) => {
  try {
    const { message, lang = "ur", contextSummary, chatHistory = [] } = req.body;
    if (!message || typeof message !== "string" || message.trim() === "") {
      return res.status(400).json({ error: "Message is required" });
    }
    const ai = getGeminiClient();
    if (!ai) {
      const fallbackMsg = lang === "en" ? "AI service requires GEMINI_API_KEY to be configured in project settings. Please add your free Gemini API key to activate Driver Dost AI." : "\u0688\u0631\u0627\u0626\u06CC\u0648\u0631 \u062F\u0648\u0633\u062A AI \u06A9\u0648 \u0641\u0639\u0627\u0644 \u06A9\u0631\u0646\u06D2 \u06A9\u06D2 \u0644\u06CC\u06D2 \u067E\u0631\u0648\u062C\u06CC\u06A9\u0679 \u0633\u06CC\u0679\u0646\u06AF\u0632 \u0645\u06CC\u06BA \u0645\u0641\u062A Gemini API Key \u0634\u0627\u0645\u0644 \u06A9\u0631\u06CC\u06BA\u06D4";
      return res.status(503).json({
        error: "AI_KEY_NOT_CONFIGURED",
        reply: fallbackMsg
      });
    }
    const systemInstruction = `You are "Driver Dost AI" (\u0688\u0631\u0627\u0626\u06CC\u0648\u0631 \u062F\u0648\u0633\u062A AI), an intelligent, brotherly, practical road freight and transport assistant for Pakistani truck drivers, vehicle owners, and logistics operators.
Language mode: ${lang === "en" ? "English (with friendly Pakistani road freight context)" : "Urdu (friendly, clear, conversational, Urdu-first)"}.

Current Signed-In User Data Context:
${contextSummary || "No data recorded yet for this user."}

CRITICAL RULES:
1. Persona: Speak like a trusted, helpful transport driver friend ("\u062F\u0648\u0633\u062A\u0627\u0646\u06C1\u060C \u0628\u0627\u0627\u062F\u0628 \u0627\u0648\u0631 \u0628\u0627\u0648\u0642\u0627\u0631 \u0627\u0646\u062F\u0627\u0632"). Keep responses short, direct, and practical.
2. ABSOLUTE TRUTH RULE: You must ONLY answer questions based on the user's data provided above. NEVER invent, fabricate, hallucinate, or guess any numbers, financial figures (PKR), vehicle numbers, trip expenses, or bilties.
3. If the user asks about an expense, trip, vehicle, or bilty that is NOT present in their data, clearly and politely respond:
   - In Urdu: "\u06CC\u06C1 \u0688\u06CC\u0679\u0627 \u0627\u0628\u06BE\u06CC \u0622\u067E \u06A9\u06D2 \u0631\u06CC\u06A9\u0627\u0631\u0688 \u0645\u06CC\u06BA \u0645\u0648\u062C\u0648\u062F \u0646\u06C1\u06CC\u06BA \u06C1\u06D2\u06D4"
   - In English: "This data is not currently recorded in your app."
4. Quick advice guidelines:
   - For trip costs: refer to saved trips or calculate distance / mileage * fuel rate if asked.
   - For fuel: quote the user's latest POL fuel rates if available.
   - For routes: give safe driving, motorway/highway M-Tag, and resting point guidance across Pakistan.
5. Do not use complex jargon. Be supportive and helpful to transporters and drivers.`;
    const contents = [];
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      for (const turn of chatHistory.slice(-6)) {
        if (turn.role === "user" || turn.role === "model") {
          contents.push({
            role: turn.role,
            parts: [{ text: String(turn.text || "") }]
          });
        }
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: message.trim() }]
    });
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
        // Lower temperature for factuality and strict adherence to context
        maxOutputTokens: 600
      }
    });
    const reply = response.text || (lang === "en" ? "Sorry, could not generate a response." : "\u0645\u0639\u0630\u0631\u062A\u060C \u0627\u0633 \u0648\u0642\u062A \u062C\u0648\u0627\u0628 \u062A\u06CC\u0627\u0631 \u0646\u06C1\u06CC\u06BA \u06C1\u0648 \u0633\u06A9\u0627\u06D4");
    return res.json({ reply });
  } catch (err) {
    console.error("Gemini API Error:", err);
    const errMsg = String(err?.message || "");
    const isRateLimit = err?.status === 429 || errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED");
    if (isRateLimit) {
      return res.status(429).json({
        error: "RATE_LIMIT_EXCEEDED",
        message: "AI abhi thoda busy hai, thori dair mein dobara koshish karain."
      });
    }
    return res.status(500).json({
      error: "SERVER_ERROR",
      message: "Failed to process AI request"
    });
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
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Driver Dost Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

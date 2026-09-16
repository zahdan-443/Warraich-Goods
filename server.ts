import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// CORS middleware for cross-origin client requests (PWA, mobile, preview, GitHub Pages)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// JSON parser for API routes
app.use(express.json({ limit: '2mb' }));

// Lazy initialization of Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

// Serve sitemap.xml explicitly
app.get(['/sitemap.xml', '/Warraich-Goods/sitemap.xml'], (_req, res) => {
  const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
  const distPath = path.join(process.cwd(), 'dist', 'sitemap.xml');
  res.header('Content-Type', 'application/xml; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.header('X-CDN-Status', 'Active');
  res.sendFile(publicPath, (err) => {
    if (err) res.sendFile(distPath);
  });
});

// Serve robots.txt explicitly
app.get(['/robots.txt', '/Warraich-Goods/robots.txt'], (_req, res) => {
  const publicPath = path.join(process.cwd(), 'public', 'robots.txt');
  const distPath = path.join(process.cwd(), 'dist', 'robots.txt');
  res.header('Content-Type', 'text/plain; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.header('X-CDN-Status', 'Active');
  res.sendFile(publicPath, (err) => {
    if (err) res.sendFile(distPath);
  });
});

// Serve Digital Asset Links for Android TWA verification
app.get(['/.well-known/assetlinks.json', '/Warraich-Goods/.well-known/assetlinks.json'], (_req, res) => {
  const publicPath = path.join(process.cwd(), 'public', '.well-known', 'assetlinks.json');
  const distPath = path.join(process.cwd(), 'dist', '.well-known', 'assetlinks.json');
  res.header('Content-Type', 'application/json; charset=utf-8');
  res.header('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.header('X-CDN-Status', 'Active');
  res.sendFile(publicPath, (err) => {
    if (err) res.sendFile(distPath);
  });
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Driver Dost API Server',
    aiAvailable: Boolean(process.env.GEMINI_API_KEY)
  });
});

// AI Advisor Chat Endpoint (Resilient Multi-Model Architecture)
app.post(['/api/ai-chat', '/Warraich-Goods/api/ai-chat'], async (req, res) => {
  const { message, lang = 'ur', contextSummary, chatHistory = [] } = req.body || {};

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({
      error: 'MESSAGE_REQUIRED',
      reply: lang === 'en' ? 'Please enter a question or topic to discuss.' : 'براہ کرم کوئی سوال یا پیغام درج کریں۔'
    });
  }

  const ai = getGeminiClient();
  if (!ai) {
    const fallbackMsg = lang === 'en'
      ? 'Driver Dost AI requires GEMINI_API_KEY to be configured in project settings. Please add your free Gemini API key in settings.'
      : 'ڈرائیور دوست AI کو فعال کرنے کے لیے پروجیکٹ سیٹنگز میں مفت Gemini API Key شامل کریں۔';
    return res.status(503).json({
      error: 'AI_KEY_NOT_CONFIGURED',
      reply: fallbackMsg,
      message: fallbackMsg
    });
  }

  // System instruction strictly bounding Persona and Data isolation
  const systemInstruction = `You are "Driver Dost AI" (ڈرائیور دوست AI), an intelligent, brotherly, practical road freight and transport assistant for Pakistani truck drivers, vehicle owners, and logistics operators.
Language mode: ${lang === 'en' ? 'English (with friendly Pakistani road freight context)' : 'Urdu (friendly, clear, conversational, Urdu-first)'}.

Current Signed-In User Data Context:
${contextSummary || 'No data recorded yet for this user.'}

CRITICAL RULES:
1. Persona: Speak like a trusted, helpful transport driver friend ("دوستانہ، باادب اور باوقار انداز"). Keep responses short, direct, and practical.
2. ABSOLUTE TRUTH RULE: You must ONLY answer questions based on the user's data provided above. NEVER invent, fabricate, hallucinate, or guess any numbers, financial figures (PKR), vehicle numbers, trip expenses, or bilties.
3. If the user asks about an expense, trip, vehicle, or bilty that is NOT present in their data, clearly and politely respond:
   - In Urdu: "یہ ڈیٹا ابھی آپ کے ریکارڈ میں موجود نہیں ہے۔"
   - In English: "This data is not currently recorded in your app."
4. Quick advice guidelines:
   - For trip costs: refer to saved trips or calculate distance / mileage * fuel rate if asked.
   - For fuel: quote the user's latest POL fuel rates if available.
   - For routes: give safe driving, motorway/highway M-Tag, and resting point guidance across Pakistan.
5. Do not use complex jargon. Be supportive and helpful to transporters and drivers.`;

  // Format chat history for generateContent
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
  if (Array.isArray(chatHistory) && chatHistory.length > 0) {
    for (const turn of chatHistory.slice(-6)) {
      if (turn && (turn.role === 'user' || turn.role === 'model')) {
        contents.push({
          role: turn.role,
          parts: [{ text: String(turn.text || '') }]
        });
      }
    }
  }

  // Append current user message
  contents.push({
    role: 'user',
    parts: [{ text: message.trim() }]
  });

  // Candidate models: Primary is ultra-fast, high-availability 'gemini-3.1-flash-lite'.
  // Secondary fallback is 'gemini-flash-latest'.
  const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 700
        }
      });

      if (response && response.text) {
        return res.json({
          reply: response.text.trim(),
          modelUsed: model
        });
      }
    } catch (err: any) {
      lastError = err;
      const status = err?.status || err?.code;
      console.warn(`[Driver Dost AI] Model ${model} encountered error (status: ${status}):`, err?.message);

      // If high demand (503), not found (404), or rate limited, attempt next model immediately
      if (status === 503 || status === 404 || status === 429 || String(err?.message || '').includes('demand')) {
        continue;
      }
    }
  }

  console.error('All Gemini AI models exhausted:', lastError);

  const errMsg = String(lastError?.message || '');
  const isRateLimit = lastError?.status === 429 || errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED');

  if (isRateLimit) {
    const rateLimitReply = lang === 'en'
      ? 'AI is currently busy with high requests, please try again in a little while.'
      : 'AI ابھی تھوڑا مصروف ہے، براہ کرم تھوڑی دیر بعد دوبارہ کوشش کریں۔';
    return res.status(429).json({
      error: 'RATE_LIMIT_EXCEEDED',
      reply: rateLimitReply,
      message: rateLimitReply
    });
  }

  const serverErrorReply = lang === 'en'
    ? 'Sorry, communication failed. Please try sending your message again.'
    : 'معذرت، رابطہ میں کچھ دشواری پیش آئی ہے۔ براہ کرم دوبارہ پیغام بھیجیں۔';

  return res.status(500).json({
    error: 'SERVER_ERROR',
    reply: serverErrorReply,
    message: serverErrorReply
  });
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, {
      maxAge: '1y',
      setHeaders: (res) => {
        res.setHeader('X-CDN-Status', 'Active');
        res.setHeader('CDN-Cache-Control', 'max-age=31536000');
      }
    }));
    app.get('*', (_req, res) => {
      res.setHeader('X-CDN-Status', 'Active');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Driver Dost Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

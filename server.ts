import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

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

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Driver Dost API Server',
    aiAvailable: Boolean(process.env.GEMINI_API_KEY)
  });
});

// AI Advisor Chat Endpoint (Free Tier Gemini Flash Model)
app.post('/api/ai-chat', async (req, res) => {
  try {
    const { message, lang = 'ur', contextSummary, chatHistory = [] } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      const fallbackMsg = lang === 'en'
        ? 'AI service requires GEMINI_API_KEY to be configured in project settings. Please add your free Gemini API key to activate Driver Dost AI.'
        : 'ڈرائیور دوست AI کو فعال کرنے کے لیے پروجیکٹ سیٹنگز میں مفت Gemini API Key شامل کریں۔';
      return res.status(503).json({
        error: 'AI_KEY_NOT_CONFIGURED',
        reply: fallbackMsg
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
    const contents = [];
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      for (const turn of chatHistory.slice(-6)) {
        if (turn.role === 'user' || turn.role === 'model') {
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

    // Call free Flash model as requested (gemini-flash-latest)
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents,
      config: {
        systemInstruction,
        temperature: 0.3, // Lower temperature for factuality and strict adherence to context
        maxOutputTokens: 600
      }
    });

    const reply = response.text || (lang === 'en' ? 'Sorry, could not generate a response.' : 'معذرت، اس وقت جواب تیار نہیں ہو سکا۔');
    return res.json({ reply });

  } catch (err: any) {
    console.error('Gemini API Error:', err);

    // Rate Limit / Quota Exceeded (429)
    const errMsg = String(err?.message || '');
    const isRateLimit = err?.status === 429 || errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED');

    if (isRateLimit) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'AI abhi thoda busy hai, thori dair mein dobara koshish karain.'
      });
    }

    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Failed to process AI request'
    });
  }
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
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Driver Dost Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

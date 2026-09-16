import { GoogleGenAI } from '@google/genai';

/**
 * Vercel Serverless Function Handler for Driver Dost AI Chat
 * Route: /api/ai-chat
 */
export default async function handler(req: any, res: any) {
  // Set CORS headers for cross-origin requests (e.g. from GitHub Pages)
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is accepted.' });
  }

  try {
    const { message, lang = 'ur', contextSummary, chatHistory = [] } = req.body || {};

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallbackMsg = lang === 'en'
        ? 'Gemini API key is not configured on this serverless deployment. Please set GEMINI_API_KEY in your environment variables.'
        : 'ڈرائیور دوست AI کے لیے سرورلیس سیٹنگز میں GEMINI_API_KEY شامل کریں۔';
      return res.status(503).json({
        error: 'AI_KEY_NOT_CONFIGURED',
        reply: fallbackMsg
      });
    }

    const ai = new GoogleGenAI({ apiKey });

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

    const contents: any[] = [];
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

    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }]
    });

    // Candidate models: Primary is ultra-fast 'gemini-3.1-flash-lite', secondary is 'gemini-flash-latest'
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
          return res.status(200).json({
            reply: response.text.trim(),
            modelUsed: model
          });
        }
      } catch (err: any) {
        lastError = err;
        const status = err?.status || err?.code;
        if (status === 503 || status === 404 || status === 429 || String(err?.message || '').includes('demand')) {
          continue;
        }
      }
    }

    throw lastError || new Error('ALL_MODELS_UNAVAILABLE');

  } catch (err: any) {
    console.error('Serverless Gemini API Error:', err);
    const errMsg = String(err?.message || '');
    const isRateLimit = err?.status === 429 || errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED');

    if (isRateLimit) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        reply: (req.body?.lang || 'ur') === 'en'
          ? 'AI is currently busy, please try again in a little while.'
          : 'AI ابھی تھوڑا مصروف ہے، براہ کرم تھوڑی دیر بعد دوبارہ کوشش کریں۔'
      });
    }

    return res.status(500).json({
      error: 'AI_INTERNAL_ERROR',
      reply: (req.body?.lang || 'ur') === 'en'
        ? 'Sorry, communication failed. Please try again.'
        : 'معذرت، رابطہ میں کچھ دشواری پیش آئی ہے۔ براہ کرم دوبارہ کوشش کریں۔'
    });
  }
}

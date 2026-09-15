const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });
const { GoogleGenAI } = require('@google/genai');

/**
 * Firebase Cloud Function for Driver Dost AI Chat
 * Endpoint URL: https://[REGION]-[PROJECT_ID].cloudfunctions.net/aiChat
 */
exports.aiChat = functions.https.onRequest((req, res) => {
  return cors(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
      const { message, lang = 'ur', contextSummary, chatHistory = [] } = req.body || {};

      if (!message || typeof message !== 'string' || message.trim() === '') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key;
      if (!apiKey) {
        return res.status(503).json({
          error: 'AI_KEY_NOT_CONFIGURED',
          reply: lang === 'en'
            ? 'Gemini API key is not configured in Firebase environment.'
            : 'ڈرائیور دوست AI کے لیے Firebase انوائرنمنٹ میں GEMINI_API_KEY شامل کریں۔'
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

      contents.push({
        role: 'user',
        parts: [{ text: message.trim() }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
          maxOutputTokens: 600
        }
      });

      const reply = response.text || (lang === 'en' ? 'Sorry, could not generate a response.' : 'معذرت، اس وقت جواب تیار نہیں ہو سکا۔');
      return res.status(200).json({ reply });

    } catch (err) {
      console.error('Firebase Cloud Function AI Error:', err);
      const isRateLimit = err?.status === 429 || String(err?.message || '').includes('429');

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
  });
});

import { Language } from '../types';
import {
  getStoredTrips,
  getStoredVehicles,
  getStoredDrivers,
  getStoredFuelLog,
  getStoredBilties,
  getActiveUserScope
} from './storage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

/**
 * Builds a strict, isolated structured data summary for the CURRENT user only.
 * Guaranteed zero leakage of any other user's records.
 */
export async function buildUserAiContext(userEmail?: string | null): Promise<string> {
  const scope = getActiveUserScope();
  
  try {
    const [trips, vehicles, bilties, fuelList, drivers] = await Promise.all([
      getStoredTrips(),
      getStoredVehicles(),
      getStoredBilties(),
      getStoredFuelLog(),
      getStoredDrivers()
    ]);

    const latestFuel = fuelList && fuelList.length > 0 ? fuelList[0] : null;

    // Filter down to a compact, token-efficient summary
    const tripSummaries = trips.slice(0, 5).map(t => (
      `- ${t.name || 'Trip'} (${t.dist} km) on ${t.date || 'N/A'}: Fuel Cost Rs ${t.fuelCost?.toLocaleString() || '0'}, Net Profit Rs ${t.netProfit?.toLocaleString() || '0'}`
    ));

    const vehicleSummaries = vehicles.slice(0, 5).map(v => (
      `- ${v.reg} (${v.model || 'Truck'}): Owner: ${v.owner || 'Self'}, Mileage: ${v.mileage || 'N/A'} km/L, Capacity: ${v.capacity || '0'} tons`
    ));

    const biltySummaries = bilties.slice(0, 5).map(b => (
      `- Bilty #${b.biltyNo} (${b.date || 'N/A'}): ${b.sendingCity || 'Origin'} to ${b.receivingCity || 'Dest'}, Item: ${b.itemDescription || 'Cargo'} (${b.weight || '0'} kg), Total: Rs ${b.total?.toLocaleString() || '0'}, Payable: Rs ${b.payable?.toLocaleString() || '0'}`
    ));

    const driverSummaries = drivers.slice(0, 5).map(d => (
      `- ${d.name} (${d.phone || 'No phone'}), License: ${d.license || 'N/A'}`
    ));

    const summaryParts: string[] = [
      `User Account Scope: ${userEmail || scope}`,
      `Total Recorded Trips: ${trips.length}`,
      tripSummaries.length > 0 ? `Recent Trips:\n${tripSummaries.join('\n')}` : 'Recent Trips: None recorded yet',
      `Total Vehicles: ${vehicles.length}`,
      vehicleSummaries.length > 0 ? `Vehicles:\n${vehicleSummaries.join('\n')}` : 'Vehicles: None recorded yet',
      `Total Bilties: ${bilties.length}`,
      biltySummaries.length > 0 ? `Recent Bilties:\n${biltySummaries.join('\n')}` : 'Recent Bilties: None recorded yet',
      `Total Drivers: ${drivers.length}`,
      driverSummaries.length > 0 ? `Drivers:\n${driverSummaries.join('\n')}` : 'Drivers: None recorded yet',
      latestFuel ? `Current POL Fuel Rates (Dated ${latestFuel.date}): Diesel: Rs ${latestFuel.diesel}/L, Petrol: Rs ${latestFuel.petrol}/L` : 'Fuel Rates: Standard rates applied'
    ];

    return summaryParts.join('\n\n');
  } catch (err) {
    console.warn('Failed to build AI context summary:', err);
    return `User Account Scope: ${scope} (Data loading limited)`;
  }
}

/**
 * Returns the current active AI endpoint:
 * 1. Explicit VITE_AI_CHAT_ENDPOINT env variable
 * 2. Saved custom serverless endpoint in localStorage (Firebase Cloud Function or Vercel URL)
 * 3. Default relative '/api/ai-chat' (when hosted on full-stack Node/Express/Vercel)
 */
export function getAiChatEndpoint(): string {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_AI_CHAT_ENDPOINT) {
    return import.meta.env.VITE_AI_CHAT_ENDPOINT;
  }
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('driver_dost_ai_endpoint');
    if (saved && saved.trim()) return saved.trim();
  }
  return '/api/ai-chat';
}

/**
 * Sets or clears the custom serverless endpoint URL in localStorage
 */
export function setAiChatEndpoint(url: string): void {
  if (typeof window !== 'undefined') {
    if (url && url.trim()) {
      localStorage.setItem('driver_dost_ai_endpoint', url.trim());
    } else {
      localStorage.removeItem('driver_dost_ai_endpoint');
    }
  }
}

/**
 * Checks if the current app is running on static GitHub Pages
 */
export function isStaticGithubPages(): boolean {
  if (typeof window === 'undefined' || !window.location) return false;
  return window.location.hostname.includes('github.io');
}

/**
 * Sends prompt to the active AI endpoint with exponential backoff on 429 rate limits
 */
export async function sendAiChatMessage(params: {
  message: string;
  lang: Language;
  history?: ChatMessage[];
  userEmail?: string | null;
  maxRetries?: number;
}): Promise<{ reply: string; isRateLimited?: boolean; error?: string; isStaticGh?: boolean }> {
  const { message, lang, history = [], userEmail, maxRetries = 3 } = params;

  const endpoint = getAiChatEndpoint();
  const onStaticGh = isStaticGithubPages() && endpoint === '/api/ai-chat';

  // If on static GitHub Pages without an external serverless function URL configured:
  if (onStaticGh) {
    const ghNotice = lang === 'en'
      ? 'Driver Dost AI Advisor requires a serverless endpoint on static GitHub Pages to securely access Gemini without exposing API keys.\n\nTo activate live AI:\n1. Deploy the included api/ai-chat function to Vercel or Firebase Cloud Functions.\n2. Tap the settings icon (⚙️) above and paste your serverless function URL.'
      : 'ڈرائیور دوست AI ایڈوائزر کو گٹ ہب پیجز (GitHub Pages) جیسی جامد ہوسٹنگ پر Gemini کال کرنے کے لیے سرورلیس فنکشن درکار ہوتا ہے۔\n\nلائیو AI چیٹ فعال کرنے کا طریقہ:\n1. پراجیکٹ میں موجود api/ai-chat فنکشن کو Vercel یا Firebase Cloud Function پر تعینات کریں۔\n2. اوپر سیٹنگز آئیکن (⚙️) دبا کر اپنے کلاؤڈ فنکشن کا لنک درج کریں۔';

    return {
      reply: ghNotice,
      error: 'STATIC_GITHUB_PAGES_NO_ENDPOINT',
      isStaticGh: true
    };
  }

  const contextSummary = await buildUserAiContext(userEmail);

  let waitTime = 1000; // 1s initial delay
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message,
          lang,
          contextSummary,
          chatHistory: history.map(h => ({ role: h.role, text: h.text }))
        })
      });

      // 429 Rate limit handling with exponential backoff (1s, 2s, 4s)
      if (response.status === 429) {
        if (attempt < maxRetries) {
          console.warn(`[Driver Dost AI] Rate limited (429). Retrying in ${waitTime}ms (Attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          waitTime *= 2; // 1s -> 2s -> 4s
          continue;
        }

        // Daily or burst quota exceeded
        const friendlyRateLimitMsg = lang === 'en'
          ? 'AI is currently busy, please try again in a little while.'
          : 'AI ابھی تھوڑا مصروف ہے، براہ کرم تھوڑی دیر بعد دوبارہ کوشش کریں۔';

        return {
          reply: friendlyRateLimitMsg,
          isRateLimited: true,
          error: 'RATE_LIMIT_EXCEEDED'
        };
      }

      // Check for 404
      if (response.status === 404) {
        const notFoundMsg = lang === 'en'
          ? 'AI chat endpoint returned 404 (Not Found). If running on GitHub Pages, please configure your Vercel or Firebase Cloud Function URL in Chat Settings (⚙️).'
          : 'AI اینڈ پوائنٹ نہیں ملا (404)۔ گٹ ہب پیجز پر چلانے کے لیے چیٹ سیٹنگز (⚙️) میں اپنا سرورلیس فنکشن (Firebase / Vercel) لنک درج کریں۔';
        return { reply: notFoundMsg, error: 'ENDPOINT_NOT_FOUND' };
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const reply = errorData.reply || (
          lang === 'en'
            ? 'Sorry, AI service is temporarily unavailable.'
            : 'معذرت، AI سروس اس وقت دستیاب نہیں ہے۔'
        );
        return { reply, error: errorData.error || 'HTTP_ERROR' };
      }

      const data = await response.json();
      return { reply: data.reply || '' };

    } catch (netErr) {
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        waitTime *= 2;
        continue;
      }

      // If failed on GitHub pages
      if (isStaticGithubPages()) {
        return {
          reply: lang === 'en'
            ? 'Cannot reach AI endpoint from static GitHub Pages. Tap settings (⚙️) to link your Firebase Cloud Function or Vercel URL.'
            : 'گٹ ہب پیجز سے AI سرور سے رابطہ نہیں ہو سکا۔ سیٹنگز (⚙️) پر کلک کر کے اپنا کلاؤڈ فنکشن یا Vercel لنک درج کریں۔',
          error: 'NETWORK_ERROR',
          isStaticGh: true
        };
      }

      return {
        reply: lang === 'en'
          ? 'Network connection issue. Please check your internet connection.'
          : 'انٹرنیٹ کنکشن کا مسئلہ ہے۔ براہ کرم اپنا نیٹ ورک چیک کریں۔',
        error: 'NETWORK_ERROR'
      };
    }
  }

  return {
    reply: lang === 'en'
      ? 'AI is currently busy, please try again in a little while.'
      : 'AI ابھی تھوڑا مصروف ہے، براہ کرم تھوڑی دیر بعد دوبارہ کوشش کریں۔',
    isRateLimited: true
  };
}

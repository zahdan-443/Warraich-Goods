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
 * Sends prompt to /api/ai-chat with exponential backoff on 429 rate limits
 */
export async function sendAiChatMessage(params: {
  message: string;
  lang: Language;
  history?: ChatMessage[];
  userEmail?: string | null;
  maxRetries?: number;
}): Promise<{ reply: string; isRateLimited?: boolean; error?: string }> {
  const { message, lang, history = [], userEmail, maxRetries = 3 } = params;

  const contextSummary = await buildUserAiContext(userEmail);

  let waitTime = 1000; // 1s initial delay
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/ai-chat', {
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

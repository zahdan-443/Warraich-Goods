// OpenStreetMap / OSRM Free Route Distance Calculator for Pakistan Cities

export interface CityCoords {
  nameUr: string;
  nameEn: string;
  lat: number;
  lng: number;
}

export const PAKISTAN_CITIES: CityCoords[] = [
  { nameUr: 'سمندری (Samundri)', nameEn: 'Samundri', lat: 31.0632, lng: 72.9602 },
  { nameUr: 'فیصل آباد (Faisalabad)', nameEn: 'Faisalabad', lat: 31.4504, lng: 73.1350 },
  { nameUr: 'لاہور (Lahore)', nameEn: 'Lahore', lat: 31.5204, lng: 74.3587 },
  { nameUr: 'راولپنڈی / اسلام آباد (Rawalpindi/Islamabad)', nameEn: 'Rawalpindi', lat: 33.5651, lng: 73.0169 },
  { nameUr: 'ملتان (Multan)', nameEn: 'Multan', lat: 30.1575, lng: 71.5249 },
  { nameUr: 'گوجرانوالہ (Gujranwala)', nameEn: 'Gujranwala', lat: 32.1877, lng: 74.1945 },
  { nameUr: 'سیالکوٹ (Sialkot)', nameEn: 'Sialkot', lat: 32.4945, lng: 74.5229 },
  { nameUr: 'سرگودھا (Sargodha)', nameEn: 'Sargodha', lat: 32.0836, lng: 72.6711 },
  { nameUr: 'بہاولپور (Bahawalpur)', nameEn: 'Bahawalpur', lat: 29.3544, lng: 71.6911 },
  { nameUr: 'ساہیوال (Sahiwal)', nameEn: 'Sahiwal', lat: 30.6682, lng: 73.1114 },
  { nameUr: 'گوجرہ (Gojra)', nameEn: 'Gojra', lat: 31.1503, lng: 72.6836 },
  { nameUr: 'ٹوبہ ٹیک سنگھ (Toba Tek Singh)', nameEn: 'Toba Tek Singh', lat: 30.9709, lng: 72.4826 },
  { nameUr: 'کمالیہ (Kamalia)', nameEn: 'Kamalia', lat: 30.7258, lng: 72.6447 },
  { nameUr: 'پیر محل (Pir Mahal)', nameEn: 'Pir Mahal', lat: 30.7675, lng: 72.4338 },
  { nameUr: 'جھنگ (Jhang)', nameEn: 'Jhang', lat: 31.2681, lng: 72.3181 },
  { nameUr: 'چنیوٹ (Chiniot)', nameEn: 'Chiniot', lat: 31.7200, lng: 72.9780 },
  { nameUr: 'شیخوپورہ (Sheikhupura)', nameEn: 'Sheikhupura', lat: 31.7131, lng: 73.9783 },
  { nameUr: 'قصور (Kasur)', nameEn: 'Kasur', lat: 31.1167, lng: 74.4500 },
  { nameUr: 'اوکاڑہ (Okara)', nameEn: 'Okara', lat: 30.8100, lng: 73.4590 },
  { nameUr: 'رحیم یار خان (Rahim Yar Khan)', nameEn: 'Rahim Yar Khan', lat: 28.4212, lng: 70.2989 },
  { nameUr: 'ڈیرہ غازی خان (D.G. Khan)', nameEn: 'D.G. Khan', lat: 30.0561, lng: 70.6348 },
  { nameUr: 'گجرات (Gujrat)', nameEn: 'Gujrat', lat: 32.5742, lng: 74.0754 },
  { nameUr: 'خانیوال (Khanewal)', nameEn: 'Khanewal', lat: 30.3017, lng: 71.9321 },
  { nameUr: 'مظفر گڑھ (Muzaffargarh)', nameEn: 'Muzaffargarh', lat: 30.0703, lng: 71.1933 },
  { nameUr: 'وہاڑی (Vehari)', nameEn: 'Vehari', lat: 30.0419, lng: 72.3528 },
  { nameUr: 'بورے والا (Burewala)', nameEn: 'Burewala', lat: 30.1667, lng: 72.6833 },
  { nameUr: 'پاکپتن (Pakpattan)', nameEn: 'Pakpattan', lat: 30.3410, lng: 73.3866 },
  { nameUr: 'بہاولنگر (Bahawalnagar)', nameEn: 'Bahawalnagar', lat: 29.9961, lng: 73.2536 },
  { nameUr: 'لودھراں (Lodhran)', nameEn: 'Lodhran', lat: 29.5405, lng: 71.6336 },
  { nameUr: 'میانوالی (Mianwali)', nameEn: 'Mianwali', lat: 32.5839, lng: 71.5370 },
  { nameUr: 'بھکر (Bhakkar)', nameEn: 'Bhakkar', lat: 31.6253, lng: 71.0657 },
  { nameUr: 'لیہ (Layyah)', nameEn: 'Layyah', lat: 30.9613, lng: 70.9390 },
  { nameUr: 'خوشاب (Khushab)', nameEn: 'Khushab', lat: 32.2967, lng: 72.3525 },
  { nameUr: 'چکوال (Chakwal)', nameEn: 'Chakwal', lat: 32.9328, lng: 72.8631 },
  { nameUr: 'جہلم (Jhelum)', nameEn: 'Jhelum', lat: 32.9425, lng: 73.7257 },
  { nameUr: 'اٹک (Attock)', nameEn: 'Attock', lat: 33.7667, lng: 72.3598 },
  { nameUr: 'منڈی بہاؤالدین (Mandi Bahauddin)', nameEn: 'Mandi Bahauddin', lat: 32.5861, lng: 73.4917 },
  { nameUr: 'حافظ آباد (Hafizabad)', nameEn: 'Hafizabad', lat: 32.0679, lng: 73.6854 },
  { nameUr: 'ننکانہ صاحب (Nankana Sahib)', nameEn: 'Nankana Sahib', lat: 31.4492, lng: 73.7042 },
  { nameUr: 'پتوکی (Pattoki)', nameEn: 'Pattoki', lat: 31.0214, lng: 73.8475 },
  { nameUr: 'وزیرآباد (Wazirabad)', nameEn: 'Wazirabad', lat: 32.4431, lng: 74.1197 },
  { nameUr: 'ڈسکہ (Daska)', nameEn: 'Daska', lat: 32.3242, lng: 74.3503 },
  { nameUr: 'نارووال (Narowal)', nameEn: 'Narowal', lat: 32.0997, lng: 74.8756 },
  { nameUr: 'چیچہ وطنی (Chichawatni)', nameEn: 'Chichawatni', lat: 30.5333, lng: 72.7000 },
  { nameUr: 'عارف والا (Arifwala)', nameEn: 'Arifwala', lat: 30.2906, lng: 73.0644 },
  { nameUr: 'دیپالپور (Depalpur)', nameEn: 'Depalpur', lat: 30.6708, lng: 73.6528 },
  { nameUr: 'پنڈی بھٹیاں (Pindi Bhattian)', nameEn: 'Pindi Bhattian', lat: 31.8984, lng: 73.2736 },
  { nameUr: 'کراچی (Karachi)', nameEn: 'Karachi', lat: 24.8607, lng: 67.0011 },
  { nameUr: 'حیدرآباد (Hyderabad)', nameEn: 'Hyderabad', lat: 25.3960, lng: 68.3578 },
  { nameUr: 'سکھر (Sukkur)', nameEn: 'Sukkur', lat: 27.7052, lng: 68.8574 },
  { nameUr: 'نواب شاہ (Nawabshah)', nameEn: 'Nawabshah', lat: 26.2483, lng: 68.4096 },
  { nameUr: 'لاڑکانہ (Larkana)', nameEn: 'Larkana', lat: 27.5589, lng: 68.2120 },
  { nameUr: 'پشاور (Peshawar)', nameEn: 'Peshawar', lat: 34.0151, lng: 71.5249 },
  { nameUr: 'ایبٹ آباد (Abbottabad)', nameEn: 'Abbottabad', lat: 34.1688, lng: 73.2215 },
  { nameUr: 'مردان (Mardan)', nameEn: 'Mardan', lat: 34.1986, lng: 72.0404 },
  { nameUr: 'سوات / مینگورہ (Swat)', nameEn: 'Swat', lat: 34.7717, lng: 72.3602 },
  { nameUr: 'کوئٹہ (Quetta)', nameEn: 'Quetta', lat: 30.1798, lng: 66.9750 },
  { nameUr: 'گوادر (Gwadar)', nameEn: 'Gwadar', lat: 25.1216, lng: 62.3254 },
  { nameUr: 'گلگت (Gilgit)', nameEn: 'Gilgit', lat: 35.9208, lng: 74.3089 },
];

// Fallback Haversine formula distance calculation
function calculateHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const straightKm = R * c;
  // Multiply by road routing factor (typically ~1.25x in Pakistan highway routes)
  return Math.round(straightKm * 1.25);
}

/**
 * Get road driving distance using free OpenStreetMap OSRM API with Haversine fallback
 */
export async function fetchOSRMRouteDistance(
  originName: string,
  destName: string
): Promise<number | null> {
  if (!originName || !destName || originName === destName) return 0;

  const originCity = PAKISTAN_CITIES.find(
    (c) => c.nameUr === originName || c.nameEn.toLowerCase() === originName.toLowerCase()
  );
  const destCity = PAKISTAN_CITIES.find(
    (c) => c.nameUr === destName || c.nameEn.toLowerCase() === destName.toLowerCase()
  );

  if (!originCity || !destCity) return null;

  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${originCity.lng},${originCity.lat};${destCity.lng},${destCity.lat}?overview=false`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.routes && data.routes.length > 0 && data.routes[0].distance) {
        const meters = data.routes[0].distance;
        return Math.round(meters / 1000);
      }
    }
  } catch (e) {
    console.warn('OSRM API fetch error or timeout, falling back to Haversine road estimation:', e);
  }

  // Fallback to Haversine road estimation
  return calculateHaversineDistanceKm(originCity.lat, originCity.lng, destCity.lat, destCity.lng);
}

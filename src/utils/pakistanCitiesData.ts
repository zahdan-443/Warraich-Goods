// Comprehensive Master Database of Major Cities & Tehsils of Pakistan
// Covers Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Islamabad, Azad Kashmir, and Gilgit-Baltistan

export interface MasterCity {
  id: string;
  nameUr: string;
  nameEn: string;
  provinceEn: string;
  provinceUr: string;
  districtEn: string;
  isTehsil: boolean;
  lat: number;
  lng: number;
  elevationMeters: number;
  highways: string[];
}

export const PAKISTAN_CITIES_MASTER: MasterCity[] = [
  // ─────────────────────────────────────────────────────────────
  // PUNJAB (پنجاب) - Major Commercial Hubs & Key Tehsils
  // ─────────────────────────────────────────────────────────────
  { id: 'samundri', nameUr: 'سمندری', nameEn: 'Samundri', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Faisalabad', isTehsil: true, lat: 31.0632, lng: 72.9602, elevationMeters: 168, highways: ['M-4 Interchange', 'Samundri-Gojra Rd', 'Rajana Rd'] },
  { id: 'faisalabad', nameUr: 'فیصل آباد', nameEn: 'Faisalabad', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Faisalabad', isTehsil: false, lat: 31.4504, lng: 73.1350, elevationMeters: 184, highways: ['M-3', 'M-4', 'Canal Rd'] },
  { id: 'jaranwala', nameUr: 'جڑانوالہ', nameEn: 'Jaranwala', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Faisalabad', isTehsil: true, lat: 31.3342, lng: 73.4194, elevationMeters: 184, highways: ['M-3 Jaranwala Interchange', 'Lahore Rd'] },
  { id: 'tandlianwala', nameUr: 'تانڈلیانوالہ', nameEn: 'Tandlianwala', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Faisalabad', isTehsil: true, lat: 31.0336, lng: 73.1322, elevationMeters: 165, highways: ['Okara Rd', 'Samundri Rd'] },
  { id: 'chakjhumra', nameUr: 'چک جھمرہ', nameEn: 'Chak Jhumra', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Faisalabad', isTehsil: true, lat: 31.5644, lng: 73.1825, elevationMeters: 188, highways: ['M-4 Chak Jhumra Interchange'] },
  
  { id: 'lahore', nameUr: 'لاہور', nameEn: 'Lahore', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Lahore', isTehsil: false, lat: 31.5204, lng: 74.3587, elevationMeters: 217, highways: ['M-2', 'M-3', 'M-11', 'N-5'] },
  { id: 'raiwind', nameUr: 'رائے ونڈ', nameEn: 'Raiwind', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Lahore', isTehsil: true, lat: 31.2500, lng: 74.2167, elevationMeters: 208, highways: ['M-2 Link', 'Raiwind-Manga Rd'] },
  { id: 'modeltown', nameUr: 'ماڈل ٹاؤن لاہور', nameEn: 'Model Town Lahore', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Lahore', isTehsil: true, lat: 31.4822, lng: 74.3189, elevationMeters: 215, highways: ['Ferozepur Rd'] },
  { id: 'canttlahore', nameUr: 'لاہور کینٹ', nameEn: 'Lahore Cantt', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Lahore', isTehsil: true, lat: 31.5200, lng: 74.3900, elevationMeters: 217, highways: ['Lahore Ring Road'] },

  { id: 'rawalpindi', nameUr: 'راولپنڈی', nameEn: 'Rawalpindi', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Rawalpindi', isTehsil: false, lat: 33.5651, lng: 73.0169, elevationMeters: 508, highways: ['M-2', 'N-5 G.T Road'] },
  { id: 'gujarkhan', nameUr: 'گوجر خان', nameEn: 'Gujar Khan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Rawalpindi', isTehsil: true, lat: 33.2562, lng: 73.3042, elevationMeters: 461, highways: ['N-5 G.T Road'] },
  { id: 'taxila', nameUr: 'ٹیکسلا', nameEn: 'Taxila', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Rawalpindi', isTehsil: true, lat: 33.7463, lng: 72.8397, elevationMeters: 549, highways: ['N-5', 'M-1 Link'] },
  { id: 'kahuta', nameUr: 'کہوٹہ', nameEn: 'Kahuta', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Rawalpindi', isTehsil: true, lat: 33.5900, lng: 73.3800, elevationMeters: 620, highways: ['Rawalpindi-Kotli Rd'] },
  { id: 'kallarsyedan', nameUr: 'کلر سیداں', nameEn: 'Kallar Syedan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Rawalpindi', isTehsil: true, lat: 33.4167, lng: 73.3667, elevationMeters: 520, highways: ['Chua Saidan Shah Rd'] },
  { id: 'murree', nameUr: 'مری', nameEn: 'Murree', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Murree', isTehsil: true, lat: 33.9062, lng: 73.3903, elevationMeters: 2291, highways: ['Murree Expressway E-75'] },
  { id: 'kotlisattian', nameUr: 'کوٹلی ستیاں', nameEn: 'Kotli Sattian', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Murree', isTehsil: true, lat: 33.8058, lng: 73.4792, elevationMeters: 1750, highways: ['Kotli Sattian Rd'] },

  { id: 'islamabad', nameUr: 'اسلام آباد', nameEn: 'Islamabad', provinceEn: 'Federal', provinceUr: 'وفاق', districtEn: 'Islamabad', isTehsil: false, lat: 33.6844, lng: 73.0479, elevationMeters: 540, highways: ['M-1', 'M-2', 'Expressway', 'N-5'] },

  { id: 'multan', nameUr: 'ملتان', nameEn: 'Multan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Multan', isTehsil: false, lat: 30.1575, lng: 71.5249, elevationMeters: 122, highways: ['M-4', 'M-5', 'N-5', 'N-70'] },
  { id: 'shujabad', nameUr: 'شجاع آباد', nameEn: 'Shujabad', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Multan', isTehsil: true, lat: 29.8803, lng: 71.2950, elevationMeters: 119, highways: ['M-5 Shujabad Interchange'] },
  { id: 'jalalpurpirwala', nameUr: 'جلالپور پیروالہ', nameEn: 'Jalalpur Pirwala', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Multan', isTehsil: true, lat: 29.5056, lng: 71.2211, elevationMeters: 115, highways: ['M-5 Jalalpur Interchange'] },

  { id: 'gujranwala', nameUr: 'گوجرانوالہ', nameEn: 'Gujranwala', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Gujranwala', isTehsil: false, lat: 32.1877, lng: 74.1945, elevationMeters: 226, highways: ['N-5 G.T Road', 'M-11'] },
  { id: 'kamoke', nameUr: 'کامونکے', nameEn: 'Kamoke', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Gujranwala', isTehsil: true, lat: 31.9744, lng: 74.2239, elevationMeters: 219, highways: ['N-5 G.T Road'] },
  { id: 'nowsheravirkan', nameUr: 'نوشہرہ ورکاں', nameEn: 'Nowshera Virkan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Gujranwala', isTehsil: true, lat: 31.9619, lng: 73.9986, elevationMeters: 212, highways: ['Hafizabad Rd'] },

  { id: 'wazirabad', nameUr: 'وزیرآباد', nameEn: 'Wazirabad', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Wazirabad', isTehsil: true, lat: 32.4431, lng: 74.1197, elevationMeters: 228, highways: ['N-5 G.T Road', 'Sialkot Rd'] },
  { id: 'alipurchatta', nameUr: 'علی پور چٹھہ', nameEn: 'Ali Pur Chatta', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Wazirabad', isTehsil: true, lat: 32.2667, lng: 73.8167, elevationMeters: 215, highways: ['Akbar Ghanoke Rd'] },

  { id: 'sialkot', nameUr: 'سیالکوٹ', nameEn: 'Sialkot', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sialkot', isTehsil: false, lat: 32.4945, lng: 74.5229, elevationMeters: 256, highways: ['M-11 Sialkot Motorway'] },
  { id: 'daska', nameUr: 'ڈسکہ', nameEn: 'Daska', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sialkot', isTehsil: true, lat: 32.3242, lng: 74.3503, elevationMeters: 236, highways: ['M-11 Daska Interchange', 'Gujranwala Rd'] },
  { id: 'pasrur', nameUr: 'پسرور', nameEn: 'Pasrur', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sialkot', isTehsil: true, lat: 32.2681, lng: 74.6675, elevationMeters: 238, highways: ['M-11 Pasrur Interchange', 'Narowal Rd'] },
  { id: 'sambrial', nameUr: 'سمبڑیال', nameEn: 'Sambrial', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sialkot', isTehsil: true, lat: 32.4764, lng: 74.3533, elevationMeters: 237, highways: ['M-11 Sambrial Interchange', 'Airport Rd'] },

  { id: 'narowal', nameUr: 'نارووال', nameEn: 'Narowal', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Narowal', isTehsil: false, lat: 32.0997, lng: 74.8756, elevationMeters: 234, highways: ['Muridke-Narowal Rd'] },
  { id: 'shakargarh', nameUr: 'شکرگڑھ', nameEn: 'Shakargarh', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Narowal', isTehsil: true, lat: 32.2417, lng: 75.1611, elevationMeters: 250, highways: ['Narowal-Shakargarh Rd'] },
  { id: 'zafarwal', nameUr: 'ظفروال', nameEn: 'Zafarwal', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Narowal', isTehsil: true, lat: 32.3444, lng: 74.9000, elevationMeters: 245, highways: ['Pasrur Rd'] },

  { id: 'gujrat', nameUr: 'گجرات', nameEn: 'Gujrat', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Gujrat', isTehsil: false, lat: 32.5744, lng: 74.0754, elevationMeters: 233, highways: ['N-5 G.T Road'] },
  { id: 'kharian', nameUr: 'کھاریاں', nameEn: 'Kharian', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Gujrat', isTehsil: true, lat: 32.8133, lng: 73.8822, elevationMeters: 268, highways: ['N-5 G.T Road', 'M-12 Sambrial-Kharian Motorway'] },
  { id: 'sarai-alamgir', nameUr: 'سرائے عالمگیر', nameEn: 'Sarai Alamgir', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Gujrat', isTehsil: true, lat: 32.9022, lng: 73.7550, elevationMeters: 246, highways: ['N-5 G.T Road', 'Mirpur Rd'] },
  { id: 'jalalpurjattan', nameUr: 'جلالپور جٹاں', nameEn: 'Jalalpur Jattan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Gujrat', isTehsil: true, lat: 32.6417, lng: 74.2083, elevationMeters: 235, highways: ['Gujrat-Chamb Rd'] },

  { id: 'mandibahauddin', nameUr: 'منڈی بہاؤالدین', nameEn: 'Mandi Bahauddin', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Mandi Bahauddin', isTehsil: false, lat: 32.5861, lng: 73.4917, elevationMeters: 220, highways: ['M-2 Salam Interchange Link'] },
  { id: 'phalia', nameUr: 'پھالیہ', nameEn: 'Phalia', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Mandi Bahauddin', isTehsil: true, lat: 32.4286, lng: 73.5786, elevationMeters: 218, highways: ['M-2 Salam Interchange Rd', 'Gujrat Rd'] },
  { id: 'malakwal', nameUr: 'ملکوال', nameEn: 'Malakwal', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Mandi Bahauddin', isTehsil: true, lat: 32.5539, lng: 73.2119, elevationMeters: 212, highways: ['Bhera-Malakwal Rd'] },

  { id: 'hafizabad', nameUr: 'حافظ آباد', nameEn: 'Hafizabad', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Hafizabad', isTehsil: false, lat: 32.0679, lng: 73.6854, elevationMeters: 207, highways: ['M-2 Kot Sarwar Interchange'] },
  { id: 'pindibhattian', nameUr: 'پنڈی بھٹیاں', nameEn: 'Pindi Bhattian', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Hafizabad', isTehsil: true, lat: 31.8984, lng: 73.2736, elevationMeters: 190, highways: ['M-2', 'M-3 Junction Motorway'] },

  { id: 'sheikhupura', nameUr: 'شیخوپورہ', nameEn: 'Sheikhupura', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sheikhupura', isTehsil: false, lat: 31.7131, lng: 73.9783, elevationMeters: 214, highways: ['M-2 Interchange', 'Faisalabad Rd'] },
  { id: 'muridke', nameUr: 'مریدکے', nameEn: 'Muridke', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sheikhupura', isTehsil: true, lat: 31.8028, lng: 74.2569, elevationMeters: 215, highways: ['N-5 G.T Road', 'Narowal Rd'] },
  { id: 'ferozewala', nameUr: 'فیروزوالہ', nameEn: 'Ferozewala', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sheikhupura', isTehsil: true, lat: 31.6667, lng: 74.2833, elevationMeters: 214, highways: ['G.T Road', 'Ravi Siphon Rd'] },
  { id: 'sharakpur', nameUr: 'شرقپور شریف', nameEn: 'Sharakpur Sharif', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sheikhupura', isTehsil: true, lat: 31.4658, lng: 74.0044, elevationMeters: 206, highways: ['M-3 Sharakpur Interchange', 'Jaranwala Rd'] },
  { id: 'safdarabad', nameUr: 'صفدر آباد', nameEn: 'Safdarabad', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sheikhupura', isTehsil: true, lat: 31.7228, lng: 73.5756, elevationMeters: 203, highways: ['Sangla Hill Rd'] },

  { id: 'nankanasahib', nameUr: 'ننکانہ صاحب', nameEn: 'Nankana Sahib', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Nankana Sahib', isTehsil: false, lat: 31.4492, lng: 73.7042, elevationMeters: 187, highways: ['M-3 Nankana Interchange'] },
  { id: 'sanglahill', nameUr: 'سانگلہ ہل', nameEn: 'Sangla Hill', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Nankana Sahib', isTehsil: true, lat: 31.7167, lng: 73.3833, elevationMeters: 185, highways: ['M-4 Sangla Hill Interchange'] },
  { id: 'shahkot', nameUr: 'شاہکوٹ', nameEn: 'Shahkot', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Nankana Sahib', isTehsil: true, lat: 31.5714, lng: 73.4847, elevationMeters: 186, highways: ['M-3 Shahkot Interchange', 'Faisalabad Rd'] },

  { id: 'kasur', nameUr: 'قصور', nameEn: 'Kasur', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Kasur', isTehsil: false, lat: 31.1179, lng: 74.4461, elevationMeters: 218, highways: ['Ferozepur Rd', 'Ganda Singh Border'] },
  { id: 'pattoki', nameUr: 'پتوکی', nameEn: 'Pattoki', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Kasur', isTehsil: true, lat: 31.0214, lng: 73.8475, elevationMeters: 186, highways: ['N-5 G.T Road', 'Multan Rd'] },
  { id: 'chunian', nameUr: 'چونیاں', nameEn: 'Chunian', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Kasur', isTehsil: true, lat: 30.9639, lng: 73.9806, elevationMeters: 185, highways: ['Chunian-Habibabad Rd'] },
  { id: 'kotradhakishan', nameUr: 'کوٹ رادھا کشن', nameEn: 'Kot Radha Kishan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Kasur', isTehsil: true, lat: 31.1714, lng: 74.0994, elevationMeters: 195, highways: ['Raiwind-Kasur Link'] },

  { id: 'okara', nameUr: 'اوکاڑہ', nameEn: 'Okara', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Okara', isTehsil: false, lat: 30.8081, lng: 73.4458, elevationMeters: 180, highways: ['N-5 G.T Road'] },
  { id: 'depalpur', nameUr: 'دیپالپور', nameEn: 'Depalpur', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Okara', isTehsil: true, lat: 30.6708, lng: 73.6528, elevationMeters: 172, highways: ['Okara-Depalpur Rd', 'Pakpattan Rd'] },
  { id: 'renalakhurd', nameUr: 'رینالہ خورد', nameEn: 'Renala Khurd', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Okara', isTehsil: true, lat: 30.8847, lng: 73.5975, elevationMeters: 182, highways: ['N-5 G.T Road'] },
  { id: 'hujrashahmuqeem', nameUr: 'حجرہ شاہ مقیم', nameEn: 'Hujra Shah Muqeem', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Okara', isTehsil: true, lat: 30.7389, lng: 73.8222, elevationMeters: 175, highways: ['Depalpur Link'] },

  { id: 'sahiwal', nameUr: 'ساہیوال', nameEn: 'Sahiwal', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sahiwal', isTehsil: false, lat: 30.6682, lng: 73.1114, elevationMeters: 171, highways: ['N-5 G.T Road'] },
  { id: 'chichawatni', nameUr: 'چیچہ وطنی', nameEn: 'Chichawatni', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sahiwal', isTehsil: true, lat: 30.5333, lng: 72.7000, elevationMeters: 161, highways: ['N-5 G.T Road', 'Kamalia Rd'] },

  { id: 'pakpattan', nameUr: 'پاکپتن', nameEn: 'Pakpattan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Pakpattan', isTehsil: false, lat: 30.3410, lng: 73.3866, elevationMeters: 157, highways: ['Sahiwal-Pakpattan Rd', 'Minchinabad Rd'] },
  { id: 'arifwala', nameUr: 'عارف والا', nameEn: 'Arifwala', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Pakpattan', isTehsil: true, lat: 30.2906, lng: 73.0644, elevationMeters: 154, highways: ['Sahiwal-Bahawalnagar Rd', 'Burewala Rd'] },

  { id: 'tobateksingh', nameUr: 'ٹوبہ ٹیک سنگھ', nameEn: 'Toba Tek Singh', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Toba Tek Singh', isTehsil: false, lat: 30.9709, lng: 72.4826, elevationMeters: 162, highways: ['M-4 Motorway', 'Jhang Rd'] },
  { id: 'gojra', nameUr: 'گوجرہ', nameEn: 'Gojra', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Toba Tek Singh', isTehsil: true, lat: 31.1503, lng: 72.6836, elevationMeters: 165, highways: ['M-4 Gojra Interchange', 'Faisalabad Rd'] },
  { id: 'kamalia', nameUr: 'کمالیہ', nameEn: 'Kamalia', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Toba Tek Singh', isTehsil: true, lat: 30.7258, lng: 72.6447, elevationMeters: 160, highways: ['M-4 Rajana Interchange', 'Chichawatni Rd'] },
  { id: 'pirmahal', nameUr: 'پیر محل', nameEn: 'Pir Mahal', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Toba Tek Singh', isTehsil: true, lat: 30.7675, lng: 72.4338, elevationMeters: 158, highways: ['M-4 Pir Mahal Interchange', 'Abdul Hakeem Link'] },

  { id: 'jhang', nameUr: 'جھنگ', nameEn: 'Jhang', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Jhang', isTehsil: false, lat: 31.2681, lng: 72.3181, elevationMeters: 158, highways: ['M-4 Link', 'N-70', 'Faisalabad-Sargodha Link'] },
  { id: 'shorkot', nameUr: 'شورکوٹ', nameEn: 'Shorkot', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Jhang', isTehsil: true, lat: 30.8267, lng: 72.0786, elevationMeters: 147, highways: ['M-4 Shorkot Interchange', 'Cantt Rd'] },
  { id: 'ahmadpursial', nameUr: 'احمد پور سیال', nameEn: 'Ahmadpur Sial', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Jhang', isTehsil: true, lat: 30.6869, lng: 71.7431, elevationMeters: 144, highways: ['Garh Maharaja Rd', 'Jhang Rd'] },
  { id: 'atharahazari', nameUr: 'اٹھارہ ہزاری', nameEn: 'Athara Hazari', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Jhang', isTehsil: true, lat: 31.1711, lng: 72.1008, elevationMeters: 152, highways: ['Trimmu Barrage Rd', 'Layyah Rd'] },

  { id: 'chiniot', nameUr: 'چنیوٹ', nameEn: 'Chiniot', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Chiniot', isTehsil: false, lat: 31.7200, lng: 72.9780, elevationMeters: 179, highways: ['Faisalabad-Sargodha Rd', 'Lahore Rd'] },
  { id: 'bhawana', nameUr: 'بھوانہ', nameEn: 'Bhawana', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Chiniot', isTehsil: true, lat: 31.5667, lng: 72.6500, elevationMeters: 168, highways: ['Chiniot-Bhawana Rd'] },
  { id: 'lalian', nameUr: 'لالیان', nameEn: 'Lalian', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Chiniot', isTehsil: true, lat: 31.8167, lng: 72.7833, elevationMeters: 175, highways: ['Sargodha Rd'] },

  { id: 'sargodha', nameUr: 'سرگودھا', nameEn: 'Sargodha', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sargodha', isTehsil: false, lat: 32.0836, lng: 72.6711, elevationMeters: 193, highways: ['M-2 Salam / Kot Momin Interchanges'] },
  { id: 'bhalwal', nameUr: 'بھلوال', nameEn: 'Bhalwal', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sargodha', isTehsil: true, lat: 32.2667, lng: 72.9000, elevationMeters: 200, highways: ['M-2 Bhalwal Interchange'] },
  { id: 'kotmomin', nameUr: 'کوٹ مومن', nameEn: 'Kot Momin', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sargodha', isTehsil: true, lat: 32.1897, lng: 73.0336, elevationMeters: 198, highways: ['M-2 Kot Momin Interchange'] },
  { id: 'shahpur', nameUr: 'شاہ پور', nameEn: 'Shahpur', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sargodha', isTehsil: true, lat: 32.3167, lng: 72.4667, elevationMeters: 188, highways: ['Jhelum River Rd', 'Khushab Rd'] },
  { id: 'sillanwali', nameUr: 'سلانوالی', nameEn: 'Sillanwali', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Sargodha', isTehsil: true, lat: 31.8256, lng: 72.5408, elevationMeters: 175, highways: ['Farooqoka Rd'] },

  { id: 'khushab', nameUr: 'خوشاب', nameEn: 'Khushab', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Khushab', isTehsil: false, lat: 32.2967, lng: 72.3525, elevationMeters: 182, highways: ['M-2 Link', 'Sargodha-Mianwali Rd'] },
  { id: 'noorpurthal', nameUr: 'نورپور تھل', nameEn: 'Noorpur Thal', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Khushab', isTehsil: true, lat: 31.8667, lng: 71.9000, elevationMeters: 172, highways: ['Khushab Thal Rd'] },
  { id: 'quaidabad', nameUr: 'قائد آباد', nameEn: 'Quaidabad', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Khushab', isTehsil: true, lat: 32.3333, lng: 71.9167, elevationMeters: 190, highways: ['Mianwali Rd'] },
  { id: 'naushera-soon', nameUr: 'نوشہرہ وادی سون', nameEn: 'Naushera Soon Valley', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Khushab', isTehsil: true, lat: 32.5694, lng: 72.1556, elevationMeters: 780, highways: ['Kallar Kahar-Soon Rd'] },

  { id: 'mianwali', nameUr: 'میانوالی', nameEn: 'Mianwali', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Mianwali', isTehsil: false, lat: 32.5839, lng: 71.5370, elevationMeters: 210, highways: ['M-14 Hakla-DI Khan Motorway'] },
  { id: 'isakhel', nameUr: 'عیسیٰ خیل', nameEn: 'Isakhel', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Mianwali', isTehsil: true, lat: 32.6847, lng: 71.2750, elevationMeters: 215, highways: ['M-14 Daud Khel / Isakhel Interchanges'] },
  { id: 'piplan', nameUr: 'پپلاں', nameEn: 'Piplan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Mianwali', isTehsil: true, lat: 32.2858, lng: 71.3719, elevationMeters: 185, highways: ['Chashma Barrage Rd'] },

  { id: 'bhakkar', nameUr: 'بھکر', nameEn: 'Bhakkar', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bhakkar', isTehsil: false, lat: 31.6253, lng: 71.0657, elevationMeters: 159, highways: ['MM Road', 'Indus Highway Link'] },
  { id: 'daryakhan', nameUr: 'دریا خان', nameEn: 'Darya Khan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bhakkar', isTehsil: true, lat: 31.7878, lng: 71.1042, elevationMeters: 165, highways: ['D.I. Khan Bridge Link'] },
  { id: 'kallurkot', nameUr: 'کلور کوٹ', nameEn: 'Kallurkot', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bhakkar', isTehsil: true, lat: 32.1569, lng: 71.2658, elevationMeters: 180, highways: ['Piplan-Bhakkar Rd'] },
  { id: 'mankera', nameUr: 'منکیرہ', nameEn: 'Mankera', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bhakkar', isTehsil: true, lat: 31.3833, lng: 71.4500, elevationMeters: 160, highways: ['Thal Jhang Rd'] },

  { id: 'chakwal', nameUr: 'چکوال', nameEn: 'Chakwal', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Chakwal', isTehsil: false, lat: 32.9328, lng: 72.8631, elevationMeters: 498, highways: ['M-2 Balkassar / Kallar Kahar Interchanges'] },
  { id: 'kallarkahar', nameUr: 'کلر کہار', nameEn: 'Kallar Kahar', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Chakwal', isTehsil: true, lat: 32.7806, lng: 72.7000, elevationMeters: 620, highways: ['M-2 Kallar Kahar Interchange'] },
  { id: 'choasaidanshah', nameUr: 'چوآ سیدن شاہ', nameEn: 'Choa Saidan Shah', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Chakwal', isTehsil: true, lat: 32.7167, lng: 72.9833, elevationMeters: 676, highways: ['Katas Raj Rd', 'Khewra Rd'] },
  { id: 'talagang', nameUr: 'تلہ گنگ', nameEn: 'Talagang', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Talagang', isTehsil: true, lat: 32.9283, lng: 72.4172, elevationMeters: 468, highways: ['M-2 Balkassar Link', 'Mianwali Rd'] },
  { id: 'lawa', nameUr: 'لاوہ', nameEn: 'Lawa', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Talagang', isTehsil: true, lat: 32.6833, lng: 71.9333, elevationMeters: 380, highways: ['Talagang-Mianwali Rd'] },

  { id: 'jhelum', nameUr: 'جہلم', nameEn: 'Jhelum', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Jhelum', isTehsil: false, lat: 32.9425, lng: 73.7257, elevationMeters: 233, highways: ['N-5 G.T Road'] },
  { id: 'dina', nameUr: 'دینہ', nameEn: 'Dina', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Jhelum', isTehsil: true, lat: 33.0236, lng: 73.6006, elevationMeters: 275, highways: ['N-5 G.T Road', 'Mangla Dam Rd'] },
  { id: 'sohawa', nameUr: 'سوہاوہ', nameEn: 'Sohawa', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Jhelum', isTehsil: true, lat: 33.1258, lng: 73.4289, elevationMeters: 410, highways: ['N-5 G.T Road'] },
  { id: 'pinddadankhan', nameUr: 'پنڈ دادن خان', nameEn: 'Pind Dadan Khan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Jhelum', isTehsil: true, lat: 32.5833, lng: 73.0500, elevationMeters: 205, highways: ['M-2 Lilla Interchange', 'Khewra Salt Mine Rd'] },

  { id: 'attock', nameUr: 'اٹک', nameEn: 'Attock', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Attock', isTehsil: false, lat: 33.7667, lng: 72.3598, elevationMeters: 352, highways: ['M-1 Interchange', 'N-5'] },
  { id: 'fatehjang', nameUr: 'فتح جنگ', nameEn: 'Fateh Jang', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Attock', isTehsil: true, lat: 33.5667, lng: 72.6500, elevationMeters: 510, highways: ['M-14 Hakla Interchange', 'Rawalpindi-Kohat Rd'] },
  { id: 'hassanabdal', nameUr: 'حسن ابدال', nameEn: 'Hassan Abdal', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Attock', isTehsil: true, lat: 33.8208, lng: 72.6908, elevationMeters: 440, highways: ['M-1', 'M-15 Hazara Motorway Start', 'N-5', 'N-35'] },
  { id: 'hazro', nameUr: 'حضرو', nameEn: 'Hazro', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Attock', isTehsil: true, lat: 33.9103, lng: 72.4939, elevationMeters: 320, highways: ['M-1 Chach Interchange'] },
  { id: 'jand', nameUr: 'جنڈ', nameEn: 'Jand', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Attock', isTehsil: true, lat: 33.4333, lng: 72.0167, elevationMeters: 310, highways: ['M-14 Tarap Interchange'] },
  { id: 'pindigheb', nameUr: 'پنڈی گھیب', nameEn: 'Pindi Gheb', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Attock', isTehsil: true, lat: 33.2408, lng: 72.2689, elevationMeters: 350, highways: ['M-14 Pindi Gheb Interchange'] },

  { id: 'khanewal', nameUr: 'خانیوال', nameEn: 'Khanewal', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Khanewal', isTehsil: false, lat: 30.3017, lng: 71.9321, elevationMeters: 128, highways: ['M-4', 'M-3 Abdul Hakeem', 'N-5'] },
  { id: 'mianchannu', nameUr: 'میاں چنوں', nameEn: 'Mian Channu', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Khanewal', isTehsil: true, lat: 30.4397, lng: 72.3556, elevationMeters: 142, highways: ['N-5 G.T Road', 'Talamba Rd'] },
  { id: 'kabirwala', nameUr: 'کبیروالا', nameEn: 'Kabirwala', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Khanewal', isTehsil: true, lat: 30.4058, lng: 71.8647, elevationMeters: 130, highways: ['M-4 Shamkot Interchange', 'Jhang Rd'] },
  { id: 'jahanian', nameUr: 'جہانیاں', nameEn: 'Jahanian', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Khanewal', isTehsil: true, lat: 30.0167, lng: 71.9833, elevationMeters: 125, highways: ['Lodhran-Khanewal Rd'] },

  { id: 'lodhran', nameUr: 'لودھراں', nameEn: 'Lodhran', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Lodhran', isTehsil: false, lat: 29.5405, lng: 71.6336, elevationMeters: 114, highways: ['M-5', 'N-5'] },
  { id: 'dunyapur', nameUr: 'دنیا پور', nameEn: 'Dunyapur', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Lodhran', isTehsil: true, lat: 29.8000, lng: 71.7333, elevationMeters: 120, highways: ['Kahror Pacca Rd'] },
  { id: 'kahrorpacca', nameUr: 'کہروڑ پکا', nameEn: 'Kahror Pacca', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Lodhran', isTehsil: true, lat: 29.6256, lng: 71.9142, elevationMeters: 118, highways: ['Mailsi Rd'] },

  { id: 'vehari', nameUr: 'وہاڑی', nameEn: 'Vehari', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Vehari', isTehsil: false, lat: 30.0419, lng: 72.3528, elevationMeters: 135, highways: ['Multan-Vehari Rd'] },
  { id: 'burewala', nameUr: 'بورے والا', nameEn: 'Burewala', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Vehari', isTehsil: true, lat: 30.1667, lng: 72.6833, elevationMeters: 138, highways: ['Vehari-Chichawatni Rd', 'Arifwala Rd'] },
  { id: 'mailsi', nameUr: 'میلسی', nameEn: 'Mailsi', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Vehari', isTehsil: true, lat: 29.8008, lng: 72.1764, elevationMeters: 126, highways: ['Sutlej Syphon Rd'] },

  { id: 'bahawalpur', nameUr: 'بہاولپور', nameEn: 'Bahawalpur', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bahawalpur', isTehsil: false, lat: 29.3956, lng: 71.6836, elevationMeters: 117, highways: ['N-5', 'M-5 Link'] },
  { id: 'ahmadpureast', nameUr: 'احمد پور شرقیہ', nameEn: 'Ahmadpur East', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bahawalpur', isTehsil: true, lat: 29.1436, lng: 71.2589, elevationMeters: 109, highways: ['N-5', 'M-5 Uch Sharif Interchange'] },
  { id: 'hasilpur', nameUr: 'حاصل پور', nameEn: 'Hasilpur', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bahawalpur', isTehsil: true, lat: 29.6978, lng: 72.5517, elevationMeters: 140, highways: ['Vehari Rd', 'Bahawalnagar Rd'] },
  { id: 'yazman', nameUr: 'یزمان', nameEn: 'Yazman', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bahawalpur', isTehsil: true, lat: 29.1211, lng: 71.7456, elevationMeters: 115, highways: ['Derawar Fort Rd'] },
  { id: 'khairpurtamewali', nameUr: 'خیرپور ٹامیوالی', nameEn: 'Khairpur Tamewali', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bahawalpur', isTehsil: true, lat: 29.5800, lng: 72.2300, elevationMeters: 130, highways: ['Hasilpur Rd'] },

  { id: 'bahawalnagar', nameUr: 'بہاولنگر', nameEn: 'Bahawalnagar', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bahawalnagar', isTehsil: false, lat: 29.9961, lng: 73.2536, elevationMeters: 163, highways: ['Arifwala Rd'] },
  { id: 'chishtian', nameUr: 'چشتیاں', nameEn: 'Chishtian', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bahawalnagar', isTehsil: true, lat: 29.7961, lng: 72.8569, elevationMeters: 150, highways: ['Hasilpur Rd'] },
  { id: 'haroonabad', nameUr: 'ہارون آباد', nameEn: 'Haroonabad', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bahawalnagar', isTehsil: true, lat: 29.6111, lng: 73.1361, elevationMeters: 160, highways: ['Fort Abbas Rd'] },
  { id: 'fortabbas', nameUr: 'فورٹ عباس', nameEn: 'Fort Abbas', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bahawalnagar', isTehsil: true, lat: 29.1928, lng: 72.8544, elevationMeters: 140, highways: ['Cholistan Border Rd'] },
  { id: 'minchinabad', nameUr: 'منچن آباد', nameEn: 'Minchinabad', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Bahawalnagar', isTehsil: true, lat: 30.1639, lng: 73.5686, elevationMeters: 165, highways: ['Pakpattan Link'] },

  { id: 'rahimyarkhan', nameUr: 'رحیم یار خان', nameEn: 'Rahim Yar Khan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Rahim Yar Khan', isTehsil: false, lat: 28.4212, lng: 70.2989, elevationMeters: 88, highways: ['M-5 Rahim Yar Khan Interchange', 'N-5'] },
  { id: 'sadiqabad', nameUr: 'صادق آباد', nameEn: 'Sadiqabad', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Rahim Yar Khan', isTehsil: true, lat: 28.3089, lng: 70.1333, elevationMeters: 84, highways: ['N-5 Sindh Border Highway'] },
  { id: 'khanpur', nameUr: 'خانپور', nameEn: 'Khanpur', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Rahim Yar Khan', isTehsil: true, lat: 28.6467, lng: 70.6558, elevationMeters: 92, highways: ['N-5 G.T Road'] },
  { id: 'liaqatpur', nameUr: 'لیاقت پور', nameEn: 'Liaqatpur', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Rahim Yar Khan', isTehsil: true, lat: 28.9333, lng: 70.9667, elevationMeters: 100, highways: ['N-5', 'Feroza Rd'] },

  { id: 'dgkhan', nameUr: 'ڈیرہ غازی خان', nameEn: 'Dera Ghazi Khan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'D.G. Khan', isTehsil: false, lat: 30.0489, lng: 70.6455, elevationMeters: 125, highways: ['N-55 Indus Hwy', 'N-70 Quetta Hwy'] },
  { id: 'taunsa', nameUr: 'تونسہ شریف', nameEn: 'Taunsa Sharif', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Taunsa', isTehsil: true, lat: 30.7042, lng: 70.6506, elevationMeters: 135, highways: ['N-55 Indus Highway'] },
  { id: 'kotchutta', nameUr: 'کوٹ چھٹہ', nameEn: 'Kot Chutta', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'D.G. Khan', isTehsil: true, lat: 29.8833, lng: 70.6500, elevationMeters: 118, highways: ['N-55 Indus Highway'] },

  { id: 'layyah', nameUr: 'لیہ', nameEn: 'Layyah', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Layyah', isTehsil: false, lat: 30.9613, lng: 70.9390, elevationMeters: 143, highways: ['Indus Highway Link', 'MM Road Link'] },
  { id: 'karorlalesan', nameUr: 'کروڑ لعل عیسن', nameEn: 'Karor Lal Esan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Layyah', isTehsil: true, lat: 31.2222, lng: 70.9528, elevationMeters: 148, highways: ['Layyah-Bhakkar Rd'] },
  { id: 'chaubara', nameUr: 'چوبارہ', nameEn: 'Chaubara', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Layyah', isTehsil: true, lat: 30.9833, lng: 71.5167, elevationMeters: 155, highways: ['Thal Desert Rd'] },
  { id: 'fatehpur-layyah', nameUr: 'فتح پور', nameEn: 'Fatehpur', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Layyah', isTehsil: true, lat: 31.1783, lng: 71.2153, elevationMeters: 150, highways: ['MM Road Chowk Azam Link'] },

  { id: 'muzaffargarh', nameUr: 'مظفر گڑھ', nameEn: 'Muzaffargarh', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Muzaffargarh', isTehsil: false, lat: 30.0703, lng: 71.1933, elevationMeters: 122, highways: ['N-70', 'N-55 Indus Hwy'] },
  { id: 'kotaddu', nameUr: 'کوٹ ادو', nameEn: 'Kot Addu', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Kot Addu', isTehsil: true, lat: 30.4700, lng: 70.9667, elevationMeters: 133, highways: ['N-55 Taunsa Barrage Rd'] },
  { id: 'alipur', nameUr: 'علی پور', nameEn: 'Alipur', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Muzaffargarh', isTehsil: true, lat: 29.3833, lng: 70.9167, elevationMeters: 108, highways: ['Seetpur Rd'] },
  { id: 'jatoi', nameUr: 'جتوئی', nameEn: 'Jatoi', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Muzaffargarh', isTehsil: true, lat: 29.5167, lng: 70.8500, elevationMeters: 110, highways: ['Shah Jamal Rd'] },

  { id: 'rajanpur', nameUr: 'راجن پور', nameEn: 'Rajanpur', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Rajanpur', isTehsil: false, lat: 29.1039, lng: 70.3250, elevationMeters: 96, highways: ['N-55 Indus Highway'] },
  { id: 'jampur', nameUr: 'جامپور', nameEn: 'Jampur', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Rajanpur', isTehsil: true, lat: 29.6417, lng: 70.5972, elevationMeters: 110, highways: ['N-55 Indus Highway', 'Dajal Rd'] },
  { id: 'rojhan', nameUr: 'روجھان', nameEn: 'Rojhan', provinceEn: 'Punjab', provinceUr: 'پنجاب', districtEn: 'Rajanpur', isTehsil: true, lat: 28.6833, lng: 69.9500, elevationMeters: 80, highways: ['N-55 Kashmore Border'] },

  // ─────────────────────────────────────────────────────────────
  // SINDH (سندھ) - Major Transport & Commercial Hubs
  // ─────────────────────────────────────────────────────────────
  { id: 'karachi', nameUr: 'کراچی', nameEn: 'Karachi', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Karachi', isTehsil: false, lat: 24.8607, lng: 67.0011, elevationMeters: 8, highways: ['M-9', 'N-5', 'N-10 Coastal Hwy', 'N-25'] },
  { id: 'portqasim', nameUr: 'پورٹ قاسم', nameEn: 'Port Qasim Karachi', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Malir', isTehsil: true, lat: 24.7833, lng: 67.3500, elevationMeters: 6, highways: ['National Highway N-5', 'Port Access Rd'] },
  { id: 'sitekarachi', nameUr: 'سائٹ کراچی', nameEn: 'SITE Karachi', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Karachi West', isTehsil: true, lat: 24.9000, lng: 66.9800, elevationMeters: 18, highways: ['Hub River Rd', 'Northern Bypass M-10'] },

  { id: 'hyderabad', nameUr: 'حیدرآباد', nameEn: 'Hyderabad', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Hyderabad', isTehsil: false, lat: 25.3960, lng: 68.3578, elevationMeters: 28, highways: ['M-9 Motorway', 'N-5', 'N-55 Indus Hwy'] },
  { id: 'latifabad', nameUr: 'لطیف آباد', nameEn: 'Latifabad', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Hyderabad', isTehsil: true, lat: 25.3611, lng: 68.3472, elevationMeters: 26, highways: ['Auto Bhan Rd'] },
  { id: 'qasimabad', nameUr: 'قاسم آباد', nameEn: 'Qasimabad', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Hyderabad', isTehsil: true, lat: 25.4056, lng: 68.3306, elevationMeters: 30, highways: ['Jamshoro Rd'] },

  { id: 'kotri', nameUr: 'کوٹری', nameEn: 'Kotri', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Jamshoro', isTehsil: true, lat: 25.3667, lng: 68.3000, elevationMeters: 32, highways: ['Indus Hwy N-55', 'SITE Kotri'] },
  { id: 'sehwan', nameUr: 'سیہون شریف', nameEn: 'Sehwan Sharif', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Jamshoro', isTehsil: true, lat: 26.4250, lng: 67.8611, elevationMeters: 38, highways: ['N-55 Indus Highway'] },

  { id: 'sukkur', nameUr: 'سکھر', nameEn: 'Sukkur', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Sukkur', isTehsil: false, lat: 27.7052, lng: 68.8574, elevationMeters: 67, highways: ['M-5', 'M-6', 'N-5', 'N-55'] },
  { id: 'rohri', nameUr: 'روہڑی', nameEn: 'Rohri', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Sukkur', isTehsil: true, lat: 27.6744, lng: 68.8967, elevationMeters: 65, highways: ['N-5 G.T Road', 'M-5 Rohri Interchange'] },
  { id: 'panoakil', nameUr: 'پنو عاقل', nameEn: 'Pano Akil', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Sukkur', isTehsil: true, lat: 27.8556, lng: 69.1111, elevationMeters: 70, highways: ['M-5 Pano Akil Interchange', 'N-5'] },

  { id: 'larkana', nameUr: 'لاڑکانہ', nameEn: 'Larkana', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Larkana', isTehsil: false, lat: 27.5590, lng: 68.2120, elevationMeters: 49, highways: ['N-55 Indus Hwy', 'Ratodero Link'] },
  { id: 'ratodero', nameUr: 'رتوڈیرو', nameEn: 'Ratodero', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Larkana', isTehsil: true, lat: 27.8019, lng: 68.2881, elevationMeters: 55, highways: ['M-8 Motorway Start', 'M-5 / M-6 Junction'] },

  { id: 'nawabshah', nameUr: 'نواب شاہ', nameEn: 'Nawabshah', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Shaheed Benazirabad', isTehsil: false, lat: 26.2483, lng: 68.4096, elevationMeters: 36, highways: ['N-5', 'M-6 Proposed', 'Sanghar Rd'] },
  { id: 'sakrand', nameUr: 'سکرنڈ', nameEn: 'Sakrand', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Shaheed Benazirabad', isTehsil: true, lat: 26.1389, lng: 68.2722, elevationMeters: 34, highways: ['N-5 National Highway'] },
  { id: 'qaziahmad', nameUr: 'قاضی احمد', nameEn: 'Qazi Ahmed', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Shaheed Benazirabad', isTehsil: true, lat: 26.1472, lng: 68.0833, elevationMeters: 35, highways: ['N-5 National Highway'] },

  { id: 'khairpur', nameUr: 'خیرپور', nameEn: 'Khairpur', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Khairpur', isTehsil: false, lat: 27.5295, lng: 68.7592, elevationMeters: 60, highways: ['N-5 National Highway'] },
  { id: 'gambat', nameUr: 'گمبٹ', nameEn: 'Gambat', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Khairpur', isTehsil: true, lat: 27.3500, lng: 68.5200, elevationMeters: 52, highways: ['N-5 National Highway'] },
  { id: 'kotdiji', nameUr: 'کوٹ ڈیجی', nameEn: 'Kot Diji', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Khairpur', isTehsil: true, lat: 27.3400, lng: 68.7100, elevationMeters: 65, highways: ['Mehran Highway'] },

  { id: 'ghotki', nameUr: 'گھوٹکی', nameEn: 'Ghotki', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Ghotki', isTehsil: false, lat: 28.0064, lng: 69.3164, elevationMeters: 72, highways: ['M-5 Ghotki Interchange', 'N-5'] },
  { id: 'mirpurmathelo', nameUr: 'میرپور ماتھیلو', nameEn: 'Mirpur Mathelo', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Ghotki', isTehsil: true, lat: 28.0222, lng: 69.5489, elevationMeters: 74, highways: ['N-5 National Highway'] },
  { id: 'daharki', nameUr: 'ڈھرکی', nameEn: 'Daharki', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Ghotki', isTehsil: true, lat: 28.0444, lng: 69.6778, elevationMeters: 76, highways: ['N-5 National Highway (Engro Hub)'] },
  { id: 'ubauro', nameUr: 'اوباڑو', nameEn: 'Ubauro', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Ghotki', isTehsil: true, lat: 28.1667, lng: 69.7333, elevationMeters: 78, highways: ['N-5 Punjab-Sindh Border'] },

  { id: 'shikarpur', nameUr: 'شکارپور', nameEn: 'Shikarpur', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Shikarpur', isTehsil: false, lat: 27.9571, lng: 68.6383, elevationMeters: 62, highways: ['N-65 Sukkur-Quetta Hwy', 'N-55'] },
  { id: 'jacobabad', nameUr: 'جیکب آباد', nameEn: 'Jacobabad', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Jacobabad', isTehsil: false, lat: 28.2819, lng: 68.4375, elevationMeters: 55, highways: ['N-65 Balochistan Gateway'] },
  { id: 'kashmore', nameUr: 'کشمور', nameEn: 'Kashmore', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Kashmore', isTehsil: false, lat: 28.4333, lng: 69.5833, elevationMeters: 72, highways: ['N-55 Indus Highway (Guddu Barrage)'] },
  { id: 'kandhkot', nameUr: 'کندھ کوٹ', nameEn: 'Kandhkot', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Kashmore', isTehsil: true, lat: 28.2439, lng: 69.1825, elevationMeters: 68, highways: ['Indus Highway N-55'] },

  { id: 'mirpurkhas', nameUr: 'میرپور خاص', nameEn: 'Mirpur Khas', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Mirpur Khas', isTehsil: false, lat: 25.5269, lng: 69.0111, elevationMeters: 25, highways: ['Hyderabad-Mirpur Khas Dual C/W'] },
  { id: 'digri', nameUr: 'ڈگری', nameEn: 'Digri', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Mirpur Khas', isTehsil: true, lat: 25.1583, lng: 69.1111, elevationMeters: 18, highways: ['Tando Jan Mohammad Rd'] },
  { id: 'tandoadam', nameUr: 'ٹنڈو آدم', nameEn: 'Tando Adam', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Sanghar', isTehsil: true, lat: 25.7681, lng: 68.6625, elevationMeters: 30, highways: ['Hyderabad Rd', 'Sanghar Rd'] },
  { id: 'shahdadpur', nameUr: 'شہدادپور', nameEn: 'Shahdadpur', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Sanghar', isTehsil: true, lat: 25.9261, lng: 68.6214, elevationMeters: 33, highways: ['Hala-Shahdadpur Rd'] },
  { id: 'sanghar', nameUr: 'سانگھڑ', nameEn: 'Sanghar', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Sanghar', isTehsil: false, lat: 26.0464, lng: 68.9492, elevationMeters: 34, highways: ['Nawabshah Rd'] },

  { id: 'badin', nameUr: 'بدین', nameEn: 'Badin', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Badin', isTehsil: false, lat: 24.6561, lng: 68.8378, elevationMeters: 10, highways: ['Badin-Hyderabad Coastal Link'] },
  { id: 'matli', nameUr: 'ماتلی', nameEn: 'Matli', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Badin', isTehsil: true, lat: 25.0417, lng: 68.6583, elevationMeters: 16, highways: ['Hyderabad Rd'] },
  { id: 'thatta', nameUr: 'ٹھٹھہ', nameEn: 'Thatta', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Thatta', isTehsil: false, lat: 24.7475, lng: 67.9236, elevationMeters: 12, highways: ['N-5 National Highway'] },
  { id: 'sujawal', nameUr: 'سجاول', nameEn: 'Sujawal', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Sujawal', isTehsil: false, lat: 24.6047, lng: 68.0778, elevationMeters: 11, highways: ['Badin-Thatta Bridge Rd'] },
  { id: 'dadu', nameUr: 'دادو', nameEn: 'Dadu', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Dadu', isTehsil: false, lat: 26.7319, lng: 67.7750, elevationMeters: 40, highways: ['N-55 Indus Highway'] },
  { id: 'mehar', nameUr: 'میہڑ', nameEn: 'Mehar', provinceEn: 'Sindh', provinceUr: 'سندھ', districtEn: 'Dadu', isTehsil: true, lat: 27.1806, lng: 67.8222, elevationMeters: 45, highways: ['N-55 Indus Highway'] },

  // ─────────────────────────────────────────────────────────────
  // KHYBER PAKHTUNKHWA (خیبر پختونخوا)
  // ─────────────────────────────────────────────────────────────
  { id: 'peshawar', nameUr: 'پشاور', nameEn: 'Peshawar', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Peshawar', isTehsil: false, lat: 34.0151, lng: 71.5249, elevationMeters: 359, highways: ['M-1 Motorway', 'N-5 G.T Road', 'N-55 Indus Hwy'] },
  { id: 'chamkani', nameUr: 'چمکنی', nameEn: 'Chamkani', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Peshawar', isTehsil: true, lat: 34.0000, lng: 71.6500, elevationMeters: 345, highways: ['Ring Road', 'M-1 Toll Entry'] },

  { id: 'mardan', nameUr: 'مردان', nameEn: 'Mardan', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Mardan', isTehsil: false, lat: 34.1989, lng: 72.0403, elevationMeters: 285, highways: ['M-1 Rashakai Interchange', 'N-45 Malakand Rd'] },
  { id: 'takhtbhai', nameUr: 'تخت بھائی', nameEn: 'Takht Bhai', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Mardan', isTehsil: true, lat: 34.2833, lng: 71.9333, elevationMeters: 320, highways: ['Malakand Rd N-45'] },
  { id: 'katlang', nameUr: 'کاتلنگ', nameEn: 'Katlang', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Mardan', isTehsil: true, lat: 34.3500, lng: 72.0833, elevationMeters: 360, highways: ['Mardan-Swat Expressway Link'] },

  { id: 'swabi', nameUr: 'صوابی', nameEn: 'Swabi', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Swabi', isTehsil: false, lat: 34.1200, lng: 72.4700, elevationMeters: 340, highways: ['M-1 Swabi Interchange'] },
  { id: 'topi', nameUr: 'ٹوپی', nameEn: 'Topi', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Swabi', isTehsil: true, lat: 34.0700, lng: 72.6200, elevationMeters: 360, highways: ['Tarbela Dam Rd'] },
  { id: 'chotalahor', nameUr: 'چھوٹا لاہور', nameEn: 'Chota Lahor', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Swabi', isTehsil: true, lat: 34.0500, lng: 72.3600, elevationMeters: 320, highways: ['M-1 Chota Lahor Interchange'] },

  { id: 'charsadda', nameUr: 'چارسدہ', nameEn: 'Charsadda', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Charsadda', isTehsil: false, lat: 34.1453, lng: 71.7308, elevationMeters: 295, highways: ['M-1 Charsadda Interchange'] },
  { id: 'shabqadar', nameUr: 'شبقدر', nameEn: 'Shabqadar', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Charsadda', isTehsil: true, lat: 34.2167, lng: 71.5500, elevationMeters: 330, highways: ['Mohmand Border Rd'] },

  { id: 'nowshere-kpk', nameUr: 'نوشہرہ', nameEn: 'Nowshera', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Nowshera', isTehsil: false, lat: 34.0153, lng: 71.9747, elevationMeters: 280, highways: ['M-1 Nowshera Interchange', 'N-5'] },
  { id: 'pabbi', nameUr: 'پبی', nameEn: 'Pabbi', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Nowshera', isTehsil: true, lat: 34.0117, lng: 71.8000, elevationMeters: 300, highways: ['N-5 G.T Road'] },
  { id: 'jehangira', nameUr: 'جہانگیرا', nameEn: 'Jehangira', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Nowshera', isTehsil: true, lat: 33.9556, lng: 72.2194, elevationMeters: 305, highways: ['N-5 Attock River Bridge'] },

  { id: 'abbottabad', nameUr: 'ایبٹ آباد', nameEn: 'Abbottabad', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Abbottabad', isTehsil: false, lat: 34.1688, lng: 73.2215, elevationMeters: 1256, highways: ['M-15 Hazara Motorway', 'N-35 KKH'] },
  { id: 'havelian', nameUr: 'حویلیاں', nameEn: 'Havelian', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Abbottabad', isTehsil: true, lat: 34.0547, lng: 73.1558, elevationMeters: 855, highways: ['M-15 Havelian Interchange', 'Dry Port CPEC'] },

  { id: 'haripur', nameUr: 'ہری پور', nameEn: 'Haripur', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Haripur', isTehsil: false, lat: 33.9997, lng: 72.9342, elevationMeters: 520, highways: ['M-15 Haripur Interchange', 'G.T Road Link'] },
  { id: 'ghazi', nameUr: 'غازی', nameEn: 'Ghazi', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Haripur', isTehsil: true, lat: 34.0200, lng: 72.7000, elevationMeters: 380, highways: ['Ghazi-Barotha Canal Rd'] },

  { id: 'mansehra', nameUr: 'مانسہرہ', nameEn: 'Mansehra', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Mansehra', isTehsil: false, lat: 34.3333, lng: 73.2000, elevationMeters: 1088, highways: ['M-15 Hazara Motorway', 'N-35 Karakoram Hwy'] },
  { id: 'balakot', nameUr: 'بالاکوٹ', nameEn: 'Balakot', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Mansehra', isTehsil: true, lat: 34.5492, lng: 73.3547, elevationMeters: 980, highways: ['N-15 Kaghan Valley Naran Road'] },
  { id: 'oghi', nameUr: 'اوگی', nameEn: 'Oghi', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Mansehra', isTehsil: true, lat: 34.5000, lng: 72.9833, elevationMeters: 1100, highways: ['Darband Rd'] },

  { id: 'swat', nameUr: 'سوات / مینگورہ', nameEn: 'Swat / Mingora', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Swat', isTehsil: false, lat: 34.7717, lng: 72.3602, elevationMeters: 984, highways: ['M-16 Swat Expressway', 'N-95'] },
  { id: 'barikot', nameUr: 'بریکوٹ', nameEn: 'Barikot', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Swat', isTehsil: true, lat: 34.6667, lng: 72.2333, elevationMeters: 850, highways: ['M-16 Chakdara-Barikot Rd'] },
  { id: 'kalam', nameUr: 'کالام', nameEn: 'Kalam', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Swat', isTehsil: true, lat: 35.4900, lng: 72.5800, elevationMeters: 2000, highways: ['N-95 Swat Kalam Highway'] },
  { id: 'bahrain-swat', nameUr: 'بحرین سوات', nameEn: 'Bahrain Swat', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Swat', isTehsil: true, lat: 35.2000, lng: 72.5500, elevationMeters: 1400, highways: ['N-95 Kalam Rd'] },

  { id: 'malakand', nameUr: 'مالاکنڈ / بٹ خیلہ', nameEn: 'Batkhela / Malakand', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Malakand', isTehsil: false, lat: 34.6167, lng: 71.9667, elevationMeters: 750, highways: ['M-16 Swat Expy Terminal', 'N-45'] },
  { id: 'dargai', nameUr: 'درگئی', nameEn: 'Dargai', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Malakand', isTehsil: true, lat: 34.5000, lng: 71.9000, elevationMeters: 450, highways: ['M-16 Dargai Interchange'] },

  { id: 'timergara', nameUr: 'تیمرگرہ', nameEn: 'Timergara', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Lower Dir', isTehsil: false, lat: 34.8281, lng: 71.8408, elevationMeters: 820, highways: ['N-45 Dir-Chitral Hwy'] },
  { id: 'chitral', nameUr: 'چترال', nameEn: 'Chitral', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Chitral', isTehsil: false, lat: 35.8511, lng: 71.7864, elevationMeters: 1518, highways: ['Lowari Tunnel N-45'] },

  { id: 'kohat', nameUr: 'کوہاٹ', nameEn: 'Kohat', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Kohat', isTehsil: false, lat: 33.5869, lng: 71.4414, elevationMeters: 489, highways: ['N-55 Indus Hwy', 'Kohat Friendship Tunnel'] },
  { id: 'lachi', nameUr: 'لاچی', nameEn: 'Lachi', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Kohat', isTehsil: true, lat: 33.3833, lng: 71.3333, elevationMeters: 450, highways: ['N-55 Indus Highway'] },

  { id: 'bannu', nameUr: 'بنوں', nameEn: 'Bannu', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Bannu', isTehsil: false, lat: 32.9861, lng: 70.6042, elevationMeters: 371, highways: ['N-55 Indus Hwy Link', 'Miranshah Rd'] },
  { id: 'lakkimarwat', nameUr: 'لکی مروت', nameEn: 'Lakki Marwat', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Lakki Marwat', isTehsil: false, lat: 32.6072, lng: 70.9114, elevationMeters: 255, highways: ['N-55 Indus Highway Link'] },
  { id: 'sarainaurang', nameUr: 'سرائے نورنگ', nameEn: 'Sarai Naurang', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'Lakki Marwat', isTehsil: true, lat: 32.8250, lng: 70.7817, elevationMeters: 300, highways: ['N-55 Indus Highway'] },

  { id: 'dikhan', nameUr: 'ڈیرہ اسماعیل خان', nameEn: 'Dera Ismail Khan', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'D.I. Khan', isTehsil: false, lat: 31.8314, lng: 70.9019, elevationMeters: 165, highways: ['M-14 Hakla-DI Khan Motorway', 'N-55 Indus Hwy'] },
  { id: 'kulachi', nameUr: 'کلاچی', nameEn: 'Kulachi', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'D.I. Khan', isTehsil: true, lat: 31.9306, lng: 70.4589, elevationMeters: 210, highways: ['Tank-D.I. Khan Rd'] },
  { id: 'paharpur', nameUr: 'پہاڑ پور', nameEn: 'Paharpur', provinceEn: 'KPK', provinceUr: 'خیبر پختونخوا', districtEn: 'D.I. Khan', isTehsil: true, lat: 32.1028, lng: 70.9708, elevationMeters: 175, highways: ['Chashma Right Bank Rd'] },

  // ─────────────────────────────────────────────────────────────
  // BALOCHISTAN (بلوچستان)
  // ─────────────────────────────────────────────────────────────
  { id: 'quetta', nameUr: 'کوئٹہ', nameEn: 'Quetta', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Quetta', isTehsil: false, lat: 30.1798, lng: 66.9750, elevationMeters: 1680, highways: ['N-25 RCD Hwy', 'N-50', 'N-65 Bolan', 'N-70'] },
  { id: 'kuchlak', nameUr: 'کچلاک', nameEn: 'Kuchlak', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Quetta', isTehsil: true, lat: 30.3667, lng: 66.9333, elevationMeters: 1590, highways: ['N-25 Chaman Rd', 'N-50 Zhob Rd'] },

  { id: 'hub', nameUr: 'حب چوکی', nameEn: 'Hub', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Hub', isTehsil: false, lat: 25.0289, lng: 66.8833, elevationMeters: 25, highways: ['N-25 RCD Highway', 'Hub-Karachi Bypass'] },
  { id: 'uthal', nameUr: 'اوتھل', nameEn: 'Uthal', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Lasbela', isTehsil: true, lat: 25.8072, lng: 66.6219, elevationMeters: 45, highways: ['N-25 RCD Highway'] },
  { id: 'bela', nameUr: 'بیلہ', nameEn: 'Bela', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Lasbela', isTehsil: true, lat: 26.2272, lng: 66.3117, elevationMeters: 80, highways: ['N-25 RCD Highway'] },

  { id: 'gwadar', nameUr: 'گوادر', nameEn: 'Gwadar', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Gwadar', isTehsil: false, lat: 25.1216, lng: 62.3254, elevationMeters: 12, highways: ['N-10 Makran Coastal Hwy', 'M-8 CPEC Corridor'] },
  { id: 'pasni', nameUr: 'پسنی', nameEn: 'Pasni', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Gwadar', isTehsil: true, lat: 25.2631, lng: 63.4711, elevationMeters: 10, highways: ['N-10 Makran Coastal Highway'] },
  { id: 'ormara', nameUr: 'اورماڑہ', nameEn: 'Ormara', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Gwadar', isTehsil: true, lat: 25.2089, lng: 64.6358, elevationMeters: 8, highways: ['N-10 Makran Coastal Highway'] },

  { id: 'turbat', nameUr: 'تربت', nameEn: 'Turbat', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Kech', isTehsil: false, lat: 26.0031, lng: 63.0544, elevationMeters: 129, highways: ['M-8 Motorway Hoshab-Turbat', 'CPEC Route'] },
  { id: 'panjgur', nameUr: 'پنجگور', nameEn: 'Panjgur', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Panjgur', isTehsil: false, lat: 26.9644, lng: 64.0903, elevationMeters: 968, highways: ['N-85 CPEC Western Alignment'] },

  { id: 'khuzdar', nameUr: 'خضدار', nameEn: 'Khuzdar', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Khuzdar', isTehsil: false, lat: 27.8105, lng: 66.6053, elevationMeters: 1237, highways: ['N-25 RCD Hwy', 'M-8 Ratodero-Khuzdar Link'] },
  { id: 'kalat', nameUr: 'قلات', nameEn: 'Kalat', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Kalat', isTehsil: false, lat: 29.0267, lng: 66.5936, elevationMeters: 2007, highways: ['N-25 RCD Highway'] },
  { id: 'mastung', nameUr: 'مستونگ', nameEn: 'Mastung', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Mastung', isTehsil: false, lat: 29.7997, lng: 66.8456, elevationMeters: 1700, highways: ['N-25', 'N-40 Taftan Link'] },
  { id: 'chaman', nameUr: 'چمن', nameEn: 'Chaman', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Chaman', isTehsil: false, lat: 30.9210, lng: 66.4597, elevationMeters: 1324, highways: ['N-25 Afghan Transit Border'] },
  { id: 'pishin', nameUr: 'پشین', nameEn: 'Pishin', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Pishin', isTehsil: false, lat: 30.5803, lng: 66.9961, elevationMeters: 1550, highways: ['N-25 Link'] },

  { id: 'zhob', nameUr: 'ژوب', nameEn: 'Zhob', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Zhob', isTehsil: false, lat: 31.3417, lng: 69.4486, elevationMeters: 1426, highways: ['N-50 D.I. Khan-Quetta Hwy'] },
  { id: 'loralai', nameUr: 'لورالائی', nameEn: 'Loralai', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Loralai', isTehsil: false, lat: 30.3706, lng: 68.5978, elevationMeters: 1430, highways: ['N-70 D.G. Khan-Quetta Hwy'] },
  { id: 'sibi', nameUr: 'سبی', nameEn: 'Sibi', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Sibi', isTehsil: false, lat: 29.5447, lng: 67.8764, elevationMeters: 130, highways: ['N-65 Sukkur-Quetta Hwy'] },
  { id: 'deramuradjamali', nameUr: 'ڈیرہ مراد جمالی', nameEn: 'Dera Murad Jamali', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Nasirabad', isTehsil: false, lat: 28.5467, lng: 68.2231, elevationMeters: 62, highways: ['N-65 Highway'] },
  { id: 'derallahyar', nameUr: 'ڈیرہ اللہ یار', nameEn: 'Dera Allah Yar', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Jaffarabad', isTehsil: false, lat: 28.3750, lng: 68.3500, elevationMeters: 58, highways: ['N-65 Jacobabad Border'] },
  { id: 'taftan', nameUr: 'تفتان', nameEn: 'Taftan', provinceEn: 'Balochistan', provinceUr: 'بلوچستان', districtEn: 'Chagai', isTehsil: true, lat: 28.9667, lng: 61.5833, elevationMeters: 620, highways: ['N-40 Iran Border Highway'] },

  // ─────────────────────────────────────────────────────────────
  // GILGIT-BALTISTAN (گلگت بلتستان)
  // ─────────────────────────────────────────────────────────────
  { id: 'gilgit', nameUr: 'گلگت', nameEn: 'Gilgit', provinceEn: 'GB', provinceUr: 'گلگت بلتستان', districtEn: 'Gilgit', isTehsil: false, lat: 35.9221, lng: 74.3087, elevationMeters: 1500, highways: ['N-35 Karakoram Highway (KKH)'] },
  { id: 'skardu', nameUr: 'سکردو', nameEn: 'Skardu', provinceEn: 'GB', provinceUr: 'گلگت بلتستان', districtEn: 'Skardu', isTehsil: false, lat: 35.2971, lng: 75.6333, elevationMeters: 2228, highways: ['S-1 Jaglot-Skardu Strategic Rd'] },
  { id: 'chilas', nameUr: 'چلاس', nameEn: 'Chilas', provinceEn: 'GB', provinceUr: 'گلگت بلتستان', districtEn: 'Diamer', isTehsil: false, lat: 35.4206, lng: 74.0967, elevationMeters: 1265, highways: ['N-35 KKH (Diamer Bhasha Dam)'] },
  { id: 'hunza-aliabad', nameUr: 'ہنزہ / علی آباد', nameEn: 'Hunza / Aliabad', provinceEn: 'GB', provinceUr: 'گلگت بلتستان', districtEn: 'Hunza', isTehsil: false, lat: 36.3167, lng: 74.6500, elevationMeters: 2150, highways: ['N-35 KKH Khunjerab Pass Rd'] },

  // ─────────────────────────────────────────────────────────────
  // AZAD JAMMU & KASHMIR (آزاد کشمیر)
  // ─────────────────────────────────────────────────────────────
  { id: 'muzaffarabad', nameUr: 'مظفر آباد', nameEn: 'Muzaffarabad', provinceEn: 'AJK', provinceUr: 'آزاد کشمیر', districtEn: 'Muzaffarabad', isTehsil: false, lat: 34.3700, lng: 73.4711, elevationMeters: 737, highways: ['Kohala-Muzaffarabad Rd', 'Neelum Valley Rd'] },
  { id: 'mirpur', nameUr: 'میرپور', nameEn: 'Mirpur', provinceEn: 'AJK', provinceUr: 'آزاد کشمیر', districtEn: 'Mirpur', isTehsil: false, lat: 33.1484, lng: 73.7519, elevationMeters: 450, highways: ['Mangla Dam Rd', 'Dina Link'] },
  { id: 'kotli', nameUr: 'کوٹلی', nameEn: 'Kotli', provinceEn: 'AJK', provinceUr: 'آزاد کشمیر', districtEn: 'Kotli', isTehsil: false, lat: 33.5156, lng: 73.9019, elevationMeters: 609, highways: ['Rawalpindi-Kotli Rd', 'Mirpur Link'] },
  { id: 'rawalakot', nameUr: 'راولا کوٹ', nameEn: 'Rawalakot', provinceEn: 'AJK', provinceUr: 'آزاد کشمیر', districtEn: 'Poonch', isTehsil: false, lat: 33.8583, lng: 73.7600, elevationMeters: 1615, highways: ['Kahuta-Rawalakot Rd', 'Azad Pattan Rd'] },
  { id: 'bhimber', nameUr: 'بھمبر', nameEn: 'Bhimber', provinceEn: 'AJK', provinceUr: 'آزاد کشمیر', districtEn: 'Bhimber', isTehsil: false, lat: 32.9744, lng: 74.0789, elevationMeters: 310, highways: ['Gujrat-Bhimber Rd', 'Barnala Link'] },
  { id: 'bagh', nameUr: 'باغ', nameEn: 'Bagh', provinceEn: 'AJK', provinceUr: 'آزاد کشمیر', districtEn: 'Bagh', isTehsil: false, lat: 33.9800, lng: 73.7750, elevationMeters: 1100, highways: ['Kohala-Bagh Rd'] }
];

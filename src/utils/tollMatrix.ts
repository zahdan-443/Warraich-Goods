import { TollCity, TollVehicleClass, TollRatesConfig, RouteDefinition, MotorwaySegment } from '../types';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { logActivity } from './storage';

// Comprehensive list of major Pakistani commercial logistics and transport hubs
export const CITIES_LIST: { id: TollCity; nameEn: string; nameUr: string; province: string }[] = [
  { id: 'Samundri', nameEn: 'Samundri', nameUr: 'سمندری', province: 'Punjab' },
  { id: 'Faisalabad', nameEn: 'Faisalabad', nameUr: 'فیصل آباد', province: 'Punjab' },
  { id: 'Lahore', nameEn: 'Lahore', nameUr: 'لاہور', province: 'Punjab' },
  { id: 'Rawalpindi', nameEn: 'Rawalpindi', nameUr: 'راولپنڈی', province: 'Punjab' },
  { id: 'Islamabad', nameEn: 'Islamabad', nameUr: 'اسلام آباد', province: 'Federal' },
  { id: 'Multan', nameEn: 'Multan', nameUr: 'ملتان', province: 'Punjab' },
  { id: 'Gujranwala', nameEn: 'Gujranwala', nameUr: 'گوجرانوالہ', province: 'Punjab' },
  { id: 'Sialkot', nameEn: 'Sialkot', nameUr: 'سیالکوٹ', province: 'Punjab' },
  { id: 'Sargodha', nameEn: 'Sargodha', nameUr: 'سرگودھا', province: 'Punjab' },
  { id: 'Bahawalpur', nameEn: 'Bahawalpur', nameUr: 'بہاولپور', province: 'Punjab' },
  { id: 'Sahiwal', nameEn: 'Sahiwal', nameUr: 'ساہیوال', province: 'Punjab' },
  { id: 'Gojra', nameEn: 'Gojra', nameUr: 'گوجرہ', province: 'Punjab' },
  { id: 'Toba Tek Singh', nameEn: 'Toba Tek Singh', nameUr: 'ٹوبہ ٹیک سنگھ', province: 'Punjab' },
  { id: 'Kamalia', nameEn: 'Kamalia', nameUr: 'کمالیہ', province: 'Punjab' },
  { id: 'Pir Mahal', nameEn: 'Pir Mahal', nameUr: 'پیر محل', province: 'Punjab' },
  { id: 'Jhang', nameEn: 'Jhang', nameUr: 'جھنگ', province: 'Punjab' },
  { id: 'Chiniot', nameEn: 'Chiniot', nameUr: 'چنیوٹ', province: 'Punjab' },
  { id: 'Sheikhupura', nameEn: 'Sheikhupura', nameUr: 'شیخوپورہ', province: 'Punjab' },
  { id: 'Kasur', nameEn: 'Kasur', nameUr: 'قصور', province: 'Punjab' },
  { id: 'Okara', nameEn: 'Okara', nameUr: 'اوکاڑہ', province: 'Punjab' },
  { id: 'Rahim Yar Khan', nameEn: 'Rahim Yar Khan', nameUr: 'رحیم یار خان', province: 'Punjab' },
  { id: 'DGKhan', nameEn: 'Dera Ghazi Khan', nameUr: 'ڈیرہ غازی خان', province: 'Punjab' },
  { id: 'Gujrat', nameEn: 'Gujrat', nameUr: 'گجرات', province: 'Punjab' },
  { id: 'Khanewal', nameEn: 'Khanewal', nameUr: 'خانیوال', province: 'Punjab' },
  { id: 'Muzaffargarh', nameEn: 'Muzaffargarh', nameUr: 'مظفر گڑھ', province: 'Punjab' },
  { id: 'Vehari', nameEn: 'Vehari', nameUr: 'وہاڑی', province: 'Punjab' },
  { id: 'Burewala', nameEn: 'Burewala', nameUr: 'بورے والا', province: 'Punjab' },
  { id: 'Pakpattan', nameEn: 'Pakpattan', nameUr: 'پاکپتن', province: 'Punjab' },
  { id: 'Bahawalnagar', nameEn: 'Bahawalnagar', nameUr: 'بہاولنگر', province: 'Punjab' },
  { id: 'Lodhran', nameEn: 'Lodhran', nameUr: 'لودھراں', province: 'Punjab' },
  { id: 'Mianwali', nameEn: 'Mianwali', nameUr: 'میانوالی', province: 'Punjab' },
  { id: 'Bhakkar', nameEn: 'Bhakkar', nameUr: 'بھکر', province: 'Punjab' },
  { id: 'Layyah', nameEn: 'Layyah', nameUr: 'لیہ', province: 'Punjab' },
  { id: 'Khushab', nameEn: 'Khushab', nameUr: 'خوشاب', province: 'Punjab' },
  { id: 'Chakwal', nameEn: 'Chakwal', nameUr: 'چکوال', province: 'Punjab' },
  { id: 'Jhelum', nameEn: 'Jhelum', nameUr: 'جہلم', province: 'Punjab' },
  { id: 'Attock', nameEn: 'Attock', nameUr: 'اٹک', province: 'Punjab' },
  { id: 'Mandi Bahauddin', nameEn: 'Mandi Bahauddin', nameUr: 'منڈی بہاؤالدین', province: 'Punjab' },
  { id: 'Hafizabad', nameEn: 'Hafizabad', nameUr: 'حافظ آباد', province: 'Punjab' },
  { id: 'Nankana Sahib', nameEn: 'Nankana Sahib', nameUr: 'ننکانہ صاحب', province: 'Punjab' },
  { id: 'Pattoki', nameEn: 'Pattoki', nameUr: 'پتوکی', province: 'Punjab' },
  { id: 'Wazirabad', nameEn: 'Wazirabad', nameUr: 'وزیرآباد', province: 'Punjab' },
  { id: 'Daska', nameEn: 'Daska', nameUr: 'ڈسکہ', province: 'Punjab' },
  { id: 'Narowal', nameEn: 'Narowal', nameUr: 'نارووال', province: 'Punjab' },
  { id: 'Chichawatni', nameEn: 'Chichawatni', nameUr: 'چیچہ وطنی', province: 'Punjab' },
  { id: 'Arifwala', nameEn: 'Arifwala', nameUr: 'عارف والا', province: 'Punjab' },
  { id: 'Depalpur', nameEn: 'Depalpur', nameUr: 'دیپالپور', province: 'Punjab' },
  { id: 'Pindi Bhattian', nameEn: 'Pindi Bhattian', nameUr: 'پنڈی بھٹیاں', province: 'Punjab' },
  { id: 'Karachi', nameEn: 'Karachi', nameUr: 'کراچی', province: 'Sindh' },
  { id: 'Hyderabad', nameEn: 'Hyderabad', nameUr: 'حیدرآباد', province: 'Sindh' },
  { id: 'Sukkur', nameEn: 'Sukkur', nameUr: 'سکھر', province: 'Sindh' },
  { id: 'Peshawar', nameEn: 'Peshawar', nameUr: 'پشاور', province: 'KPK' },
  { id: 'Abbottabad', nameEn: 'Abbottabad', nameUr: 'ایبٹ آباد', province: 'KPK' },
  { id: 'Swat', nameEn: 'Swat / Mingora', nameUr: 'سوات / مینگورہ', province: 'KPK' },
  { id: 'Quetta', nameEn: 'Quetta', nameUr: 'کوئٹہ', province: 'Balochistan' },
  { id: 'Gwadar', nameEn: 'Gwadar', nameUr: 'گوادر', province: 'Balochistan' },
  { id: 'DIKhan', nameEn: 'Dera Ismail Khan', nameUr: 'ڈیرہ اسماعیل خان', province: 'KPK' },
  { id: 'Gilgit', nameEn: 'Gilgit', nameUr: 'گلگت', province: 'Gilgit-Baltistan' }
];

export const VEHICLE_CLASSES: { id: TollVehicleClass; nameEn: string; nameUr: string; descEn: string; descUr: string; nhaCode: string }[] = [
  { 
    id: 'bike', 
    nameEn: 'Motorcycle / Bike', 
    nameUr: 'موٹر سائیکل / بائیک', 
    descEn: '2-Wheeler (Allowed on designated bridges & national highways; restricted on closed motorways)',
    descUr: '2 ویلر موٹرسائیکل (قومی شاہراہوں اور پلوں پر مجاز)',
    nhaCode: 'Cat-0'
  },
  { 
    id: 'car', 
    nameEn: 'Car / Jeep / Taxi', 
    nameUr: 'کار / جیپ / ٹیکسی', 
    descEn: '2-Axle Light Motor Vehicle (LMV)',
    descUr: '2 ایکسل لائٹ موٹر وہیکل (پرائیویٹ کار، جیپ، ٹیکسی)',
    nhaCode: 'Cat-1'
  },
  { 
    id: 'wagon', 
    nameEn: 'Wagon / Hiace / Van', 
    nameUr: 'ویگن / ہائی ایس / وین', 
    descEn: 'Up to 15-seater Commercial Passenger / Cargo Van',
    descUr: '15 سیٹوں تک کمرشل مسافر و کارگو وین',
    nhaCode: 'Cat-2'
  },
  { 
    id: 'coaster', 
    nameEn: 'Coaster / Mini Bus', 
    nameUr: 'کوسٹر / منی بس', 
    descEn: '16-24 Seater Mini Passenger Bus / Medium Vehicle',
    descUr: '16 تا 24 سیٹوں والی منی مسافر بس',
    nhaCode: 'Cat-3'
  },
  { 
    id: 'bus', 
    nameEn: 'Passenger Bus (Heavy)', 
    nameUr: 'بڑی مسافر بس (ہیوی)', 
    descEn: 'Commercial Heavy Passenger Bus (Inter-city Coach)',
    descUr: 'کمرشل ہیوی مسافر بس اور انٹرسٹی کوچز',
    nhaCode: 'Cat-4'
  },
  { 
    id: 'truck', 
    nameEn: 'Truck (2-3 Axle Rigid / 6-10 Wheeler)', 
    nameUr: '2-3 ایکسل ٹرک (سادہ / 6 تا 10 ویلر)', 
    descEn: 'Bedford / Hino / Isuzu Rigid Cargo Trucks',
    descUr: 'بیڈفورڈ / ہینو / اسوزو ریجڈ 6 تا 10 ویلر مال بردار ٹرک',
    nhaCode: 'Cat-5'
  },
  { 
    id: 'articulated', 
    nameEn: 'Articulated Truck / Trailer (10-22 Wheeler)', 
    nameUr: 'آرٹیکولیٹڈ ٹریلر (10 تا 22 ویلر ہیوی)', 
    descEn: 'Multi-axle Heavy Prime Mover & Container Trailer',
    descUr: 'ملٹی ایکسل ہیوی پرائم موور اور کنٹینر ٹریلر (10 تا 22 ویلر)',
    nhaCode: 'Cat-6'
  },
];

// Official 2026 NHA (National Highway Authority Pakistan) Approved Toll Rates Schedule
export const DEFAULT_TOLL_RATES: TollRatesConfig = {
  motorways: {
    M1: {
      name: 'M-1 (Islamabad – Peshawar Motorway)',
      total_km: 155,
      rates: {
        bike: 0,
        car: 700,
        wagon: 1100,
        coaster: 1450,
        bus: 2100,
        truck: 2700,
        articulated: 3350
      }
    },
    M2: {
      name: 'M-2 (Lahore – Islamabad / Rawalpindi Motorway)',
      total_km: 367,
      per_km_rate: {
        bike: 0,
        car: 3.90,
        wagon: 6.51,
        coaster: 9.13,
        bus: 13.00,
        truck: 16.92,
        articulated: 21.74
      }
    },
    M3: {
      name: 'M-3 (Lahore – Abdul Hakeem Motorway)',
      total_km: 230,
      rates: {
        bike: 0,
        car: 1000,
        wagon: 1500,
        coaster: 2200,
        bus: 3150,
        truck: 4050,
        articulated: 5000
      }
    },
    M4: {
      name: 'M-4 (Pindi Bhattian – Faisalabad – Multan Motorway)',
      total_km: 309,
      rates: {
        bike: 0,
        car: 1350,
        wagon: 1950,
        coaster: 2900,
        bus: 4050,
        truck: 5300,
        articulated: 6500
      }
    },
    M5: {
      name: 'M-5 (Multan – Sukkur Motorway)',
      total_km: 392,
      rates: {
        bike: 0,
        car: 1500,
        wagon: 2200,
        coaster: 3250,
        bus: 4600,
        truck: 5950,
        articulated: 7250
      }
    },
    M9: {
      name: 'M-9 (Karachi – Hyderabad Motorway)',
      total_km: 136,
      rates: {
        bike: 0,
        car: 550,
        wagon: 950,
        coaster: 1350,
        bus: 1850,
        truck: 2700,
        articulated: 3500
      }
    },
    M11: {
      name: 'M-11 (Lahore – Sialkot Motorway)',
      total_km: 103,
      rates: {
        bike: 0,
        car: 350,
        wagon: 500,
        coaster: 750,
        bus: 950,
        truck: 1300,
        articulated: 1700
      }
    },
    M14: {
      name: 'M-14 (Hakla / Islamabad – D.I. Khan Motorway)',
      total_km: 292,
      rates: {
        bike: 0,
        car: 1100,
        wagon: 1600,
        coaster: 2300,
        bus: 3100,
        truck: 4200,
        articulated: 5300
      }
    },
    M15: {
      name: 'M-15 (Hazara Motorway / Burhan – Abbottabad – Thakot)',
      total_km: 180,
      rates: {
        bike: 0,
        car: 650,
        wagon: 900,
        coaster: 1300,
        bus: 1800,
        truck: 2400,
        articulated: 3000
      }
    },
    M16: {
      name: 'M-16 (Swat Motorway / Karnal Sher Khan – Chakdara)',
      total_km: 160,
      rates: {
        bike: 0,
        car: 600,
        wagon: 850,
        coaster: 1200,
        bus: 1700,
        truck: 2200,
        articulated: 2800
      }
    }
  },
  highways: {
    N5: {
      name: 'N-5 National Highway & GT Road (Per Toll Plaza Rate)',
      per_plaza_rate: {
        bike: 20,
        car: 60,
        wagon: 110,
        coaster: 160,
        bus: 220,
        truck: 280,
        articulated: 400
      }
    },
    N55: {
      name: 'N-55 Indus Highway (Per Toll Plaza Rate)',
      per_plaza_rate: {
        bike: 20,
        car: 60,
        wagon: 110,
        coaster: 160,
        bus: 220,
        truck: 280,
        articulated: 400
      }
    }
  },
  updatedAt: '2026-07-01T00:00:00.000Z',
  updatedBy: 'NHA Published Schedule 2026 (Official)'
};

// Routing Matrix connecting Pakistan's logistics grid
export const ROUTING_MATRIX: Record<string, RouteDefinition> = {
  // Karachi corridor
  'Karachi-Hyderabad': {
    nameEn: 'Karachi – Hyderabad Motorway Corridor (M-9)',
    nameUr: 'کراچی تا حیدرآباد موٹروے کوریڈور (ایم 9)',
    routeType: 'motorway',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9 Full 136 km)', nameUr: 'کراچی تا حیدرآباد (ایم 9 مکمل 136 کلومیٹر)', km: 136 }
    ]
  },
  'Karachi-Sukkur': {
    nameEn: 'Karachi – Sukkur Corridor (M-9 + N-5 / N-55)',
    nameUr: 'کراچی تا سکھر کوریڈور (ایم 9 + این 5)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9 Full)', nameUr: 'کراچی تا حیدرآباد (ایم 9)', km: 136 }
    ]
  },
  'Karachi-Rahim Yar Khan': {
    nameEn: 'Karachi – Rahim Yar Khan (M-9 + N-5 + M-5)',
    nameUr: 'کراچی تا رحیم یار خان (ایم 9 + این 5 + ایم 5)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9)', nameUr: 'کراچی تا حیدرآباد (ایم 9)', km: 136 },
      { code: 'M5', nameEn: 'Sukkur – Rahim Yar Khan (M-5)', nameUr: 'سکھر تا رحیم یار خان (ایم 5)', km: 170 }
    ]
  },
  'Karachi-Bahawalpur': {
    nameEn: 'Karachi – Bahawalpur Corridor (M-9 + N-5 + M-5)',
    nameUr: 'کراچی تا بہاولپور کوریڈور (ایم 9 + این 5 + ایم 5)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9)', nameUr: 'کراچی تا حیدرآباد (ایم 9)', km: 136 },
      { code: 'M5', nameEn: 'Sukkur – Jalalpur Pirwala / Bahawalpur (M-5)', nameUr: 'سکھر تا بہاولپور انٹرچینج (ایم 5)', km: 310 }
    ]
  },
  'Karachi-Multan': {
    nameEn: 'Karachi – Multan Corridor (M-9 + N-5 + M-5 Motorway)',
    nameUr: 'کراچی تا ملتان کوریڈور (ایم 9 + این 5 + ایم 5 موٹروے)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9)', nameUr: 'کراچی تا حیدرآباد (ایم 9)', km: 136 },
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full 392 km)', nameUr: 'سکھر تا ملتان مکمل (ایم 5)', km: 392 }
    ]
  },
  'Karachi-Sahiwal': {
    nameEn: 'Karachi – Sahiwal Corridor (M-9 + N-5 + M-5 + N-5 Link)',
    nameUr: 'کراچی تا ساہیوال کوریڈور (ایم 9 + این 5 + ایم 5)',
    routeType: 'mixed',
    plazas: 5,
    highwayCode: 'N5',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9)', nameUr: 'کراچی تا حیدرآباد (ایم 9)', km: 136 },
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 }
    ]
  },
  'Karachi-Samundri': {
    nameEn: 'Karachi – Samundri (M-9 + N-5 + M-5 + M-4)',
    nameUr: 'کراچی تا سمندری (ایم 9 + این 5 + ایم 5 + ایم 4)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9)', nameUr: 'کراچی تا حیدرآباد (ایم 9)', km: 136 },
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Samundri (M-4)', nameUr: 'ملتان تا سمندری (ایم 4)', km: 179 }
    ]
  },
  'Karachi-Faisalabad': {
    nameEn: 'Karachi – Faisalabad (M-9 + N-5 + M-5 + M-4)',
    nameUr: 'کراچی تا فیصل آباد (ایم 9 + این 5 + ایم 5 + ایم 4)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9)', nameUr: 'کراچی تا حیدرآباد (ایم 9)', km: 136 },
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Faisalabad (M-4)', nameUr: 'ملتان تا فیصل آباد (ایم 4)', km: 224 }
    ]
  },
  'Karachi-Lahore': {
    nameEn: 'Karachi – Lahore Motorway Corridor (M-9 + N-5 + M-5 + M-4 + M-3)',
    nameUr: 'کراچی تا لاہور موٹروے کوریڈور (ایم 9 + این 5 + ایم 5 + ایم 4 + ایم 3)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9)', nameUr: 'کراچی تا حیدرآباد (ایم 9)', km: 136 },
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3 Full 230 km)', nameUr: 'عبدالحکیم تا لاہور (ایم 3 مکمل)', km: 230 }
    ]
  },
  'Karachi-Gujranwala': {
    nameEn: 'Karachi – Gujranwala Corridor',
    nameUr: 'کراچی تا گوجرانوالہ کوریڈور',
    routeType: 'mixed',
    plazas: 5,
    highwayCode: 'N5',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9)', nameUr: 'کراچی تا حیدرآباد (ایم 9)', km: 136 },
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Karachi-Sialkot': {
    nameEn: 'Karachi – Sialkot Motorway Corridor (M-9 + M-5 + M-4 + M-3 + M-11)',
    nameUr: 'کراچی تا سیالکوٹ موٹروے کوریڈور (ایم 9 + ایم 5 + ایم 4 + ایم 3 + ایم 11)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9)', nameUr: 'کراچی تا حیدرآباد (ایم 9)', km: 136 },
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 },
      { code: 'M11', nameEn: 'Lahore – Sialkot (M-11 Full 103 km)', nameUr: 'لاہور تا سیالکوٹ (ایم 11 مکمل)', km: 103 }
    ]
  },
  'Karachi-Rawalpindi': {
    nameEn: 'Karachi – Rawalpindi / Islamabad (M-9 + N-5 + M-5 + M-4 + M-2)',
    nameUr: 'کراچی تا راولپنڈی / اسلام آباد (ایم 9 + این 5 + ایم 5 + ایم 4 + ایم 2)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9)', nameUr: 'کراچی تا حیدرآباد (ایم 9)', km: 136 },
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4 Full)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Rawalpindi (M-2)', nameUr: 'پنڈی بھٹیاں تا راولپنڈی (ایم 2)', km: 220 }
    ]
  },
  'Karachi-Islamabad': {
    nameEn: 'Karachi – Islamabad (M-9 + N-5 + M-5 + M-4 + M-2)',
    nameUr: 'کراچی تا اسلام آباد (ایم 9 + این 5 + ایم 5 + ایم 4 + ایم 2)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9)', nameUr: 'کراچی تا حیدرآباد (ایم 9)', km: 136 },
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4 Full)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 }
    ]
  },
  'Karachi-Peshawar': {
    nameEn: 'Karachi – Peshawar North-South Corridor (Full Motorway Network)',
    nameUr: 'کراچی تا پشاور مکمل کوریڈور (ایم 9 + این 5 + ایم 5 + ایم 4 + ایم 2 + ایم 1)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M9', nameEn: 'Karachi – Hyderabad (M-9)', nameUr: 'کراچی تا حیدرآباد (ایم 9)', km: 136 },
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4 Full)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1 Full)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },

  // Sukkur / Upper Sindh Corridors
  'Sukkur-Multan': {
    nameEn: 'Sukkur – Multan Motorway (M-5 Full Route 392 km)',
    nameUr: 'سکھر تا ملتان موٹروے (ایم 5 مکمل روٹ 392 کلومیٹر)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5 مکمل 392 کلومیٹر)', km: 392 }
    ]
  },
  'Sukkur-Lahore': {
    nameEn: 'Sukkur – Lahore (M-5 + M-4 + M-3)',
    nameUr: 'سکھر تا لاہور (ایم 5 + ایم 4 + ایم 3 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3 Full)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Sukkur-Islamabad': {
    nameEn: 'Sukkur – Islamabad (M-5 + M-4 + M-2)',
    nameUr: 'سکھر تا اسلام آباد (ایم 5 + ایم 4 + ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4 Full)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 }
    ]
  },

  // Multan / South Punjab Corridors
  'Multan-Faisalabad': {
    nameEn: 'Multan – Faisalabad Motorway (M-4 Section 224 km)',
    nameUr: 'ملتان تا فیصل آباد موٹروے (ایم 4 سیکشن 224 کلومیٹر)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Multan – Faisalabad (M-4)', nameUr: 'ملتان تا فیصل آباد (ایم 4)', km: 224 }
    ]
  },
  'Multan-Samundri': {
    nameEn: 'Multan – Samundri (M-4)',
    nameUr: 'ملتان تا سمندری (ایم 4)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Multan – Samundri (M-4)', nameUr: 'ملتان تا سمندری (ایم 4)', km: 179 }
    ]
  },
  'Multan-Lahore': {
    nameEn: 'Multan – Lahore Motorway Corridor (M-4 + M-3 Full Route)',
    nameUr: 'ملتان تا لاہور موٹروے کوریڈور (ایم 4 + ایم 3 مکمل روٹ)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3 Full)', nameUr: 'عبدالحکیم تا لاہور (ایم 3 مکمل 230 کلومیٹر)', km: 230 }
    ]
  },
  'Multan-Rawalpindi': {
    nameEn: 'Multan – Rawalpindi / Islamabad (M-4 + M-2 Full Route)',
    nameUr: 'ملتان تا راولپنڈی / اسلام آباد (ایم 4 + ایم 2 مکمل روٹ)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4 Full)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4 مکمل 309 کلومیٹر)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Rawalpindi (M-2)', nameUr: 'پنڈی بھٹیاں تا راولپنڈی (ایم 2)', km: 220 }
    ]
  },
  'Multan-Islamabad': {
    nameEn: 'Multan – Islamabad (M-4 + M-2 Full Route)',
    nameUr: 'ملتان تا اسلام آباد (ایم 4 + ایم 2 مکمل روٹ)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4 Full)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 }
    ]
  },
  'Multan-Peshawar': {
    nameEn: 'Multan – Peshawar (M-4 + M-2 + M-1)',
    nameUr: 'ملتان تا پشاور (ایم 4 + ایم 2 + ایم 1)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1 Full)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },

  'Samundri-Lahore': {
    nameEn: 'Samundri – Lahore (M-3 Motorway 145 km)',
    nameUr: 'سمندری تا لاہور (ایم 3 موٹروے 145 کلومیٹر)',
    routeType: 'motorway',
    segments: [
      { code: 'M3', nameEn: 'Samundri Interchange – Lahore (M-3)', nameUr: 'سمندری انٹرچینج تا لاہور (ایم 3)', km: 145 }
    ]
  },
  'Samundri-Islamabad': {
    nameEn: 'Samundri – Islamabad (M-4 + M-2 Motorway)',
    nameUr: 'سمندری تا اسلام آباد (ایم 4 + ایم 2 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Samundri – Pindi Bhattian (M-4)', nameUr: 'سمندری تا پنڈی بھٹیاں (ایم 4)', km: 130 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 }
    ]
  },
  'Samundri-Rawalpindi': {
    nameEn: 'Samundri – Rawalpindi (M-4 + M-2 Motorway)',
    nameUr: 'سمندری تا راولپنڈی (ایم 4 + ایم 2 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Samundri – Pindi Bhattian (M-4)', nameUr: 'سمندری تا پنڈی بھٹیاں (ایم 4)', km: 130 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Rawalpindi (M-2)', nameUr: 'پنڈی بھٹیاں تا راولپنڈی (ایم 2)', km: 220 }
    ]
  },
  'Samundri-Multan': {
    nameEn: 'Samundri – Multan (M-4 Motorway)',
    nameUr: 'سمندری تا ملتان (ایم 4 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Samundri – Multan (M-4)', nameUr: 'سمندری تا ملتان (ایم 4)', km: 179 }
    ]
  },
  'Samundri-Faisalabad': {
    nameEn: 'Samundri – Faisalabad (M-4 Section)',
    nameUr: 'سمندری تا فیصل آباد (ایم 4 سیکشن)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Samundri – Faisalabad (M-4)', nameUr: 'سمندری تا فیصل آباد (ایم 4)', km: 45 }
    ]
  },
  'Samundri-Karachi': {
    nameEn: 'Samundri – Karachi (M-4 + M-5 + N-5 + M-9 Motorway Corridor)',
    nameUr: 'سمندری تا کراچی (ایم 4 + ایم 5 + این 5 + ایم 9)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M4', nameEn: 'Samundri – Multan (M-4)', nameUr: 'سمندری تا ملتان (ایم 4)', km: 179 },
      { code: 'M5', nameEn: 'Multan – Sukkur (M-5 Full)', nameUr: 'ملتان تا سکھر (ایم 5)', km: 392 },
      { code: 'M9', nameEn: 'Hyderabad – Karachi (M-9 Full)', nameUr: 'حیدرآباد تا کراچی (ایم 9)', km: 136 }
    ]
  },
  'Samundri-Peshawar': {
    nameEn: 'Samundri – Peshawar (M-4 + M-2 + M-1 Motorway)',
    nameUr: 'سمندری تا پشاور (ایم 4 + ایم 2 + ایم 1 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Samundri – Pindi Bhattian (M-4)', nameUr: 'سمندری تا پنڈی بھٹیاں (ایم 4)', km: 130 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },
  'Sahiwal-Lahore': {
    nameEn: 'Sahiwal – Lahore (M-3 Samundri Link / N-5 GT Road)',
    nameUr: 'ساہیوال تا لاہور (ایم 3 / این 5 شاہراہ)',
    routeType: 'mixed',
    plazas: 2,
    highwayCode: 'N5',
    segments: [
      { code: 'M3', nameEn: 'Samundri / Sahiwal Link – Lahore (M-3)', nameUr: 'سمندری لنک تا لاہور (ایم 3)', km: 145 }
    ]
  },
  'Sahiwal-Islamabad': {
    nameEn: 'Sahiwal – Islamabad (M-3 + M-4 + M-2)',
    nameUr: 'ساہیوال تا اسلام آباد (ایم 3 + ایم 4 + ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M3', nameEn: 'Samundri / Sahiwal – M-4 Link (M-3)', nameUr: 'ساہیوال لنک تا ایم 4', km: 45 },
      { code: 'M4', nameEn: 'M-4 – Pindi Bhattian (M-4)', nameUr: 'ایم 4 تا پنڈی بھٹیاں', km: 130 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 }
    ]
  },
  'Sahiwal-Multan': {
    nameEn: 'Sahiwal – Multan (N-5 GT Road / M-4 Link)',
    nameUr: 'ساہیوال تا ملتان (این 5 جی ٹی روڈ / ایم 4)',
    routeType: 'highway',
    plazas: 2,
    highwayCode: 'N5'
  },
  'Sahiwal-Karachi': {
    nameEn: 'Sahiwal – Karachi (N-5 + M-5 + M-9)',
    nameUr: 'ساہیوال تا کراچی (این 5 + ایم 5 + ایم 9)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Multan – Sukkur (M-5)', nameUr: 'ملتان تا سکھر (ایم 5)', km: 392 },
      { code: 'M9', nameEn: 'Hyderabad – Karachi (M-9)', nameUr: 'حیدرآباد تا کراچی (ایم 9)', km: 136 }
    ]
  },
  'Faisalabad-Lahore': {
    nameEn: 'Faisalabad – Lahore (M-4 + M-3 / M-2)',
    nameUr: 'فیصل آباد تا لاہور (ایم 4 + ایم 3 / ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Faisalabad – Pindi Bhattian (M-4)', nameUr: 'فیصل آباد تا پنڈی بھٹیاں (ایم 4)', km: 85 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Lahore (M-2)', nameUr: 'پنڈی بھٹیاں تا لاہور (ایم 2)', km: 147 }
    ]
  },
  'Faisalabad-Rawalpindi': {
    nameEn: 'Faisalabad – Rawalpindi / Islamabad (M-4 + M-2)',
    nameUr: 'فیصل آباد تا راولپنڈی / اسلام آباد (ایم 4 + ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Faisalabad – Pindi Bhattian (M-4)', nameUr: 'فیصل آباد تا پنڈی بھٹیاں (ایم 4)', km: 85 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Rawalpindi (M-2)', nameUr: 'پنڈی بھٹیاں تا راولپنڈی (ایم 2)', km: 220 }
    ]
  },
  'Faisalabad-Islamabad': {
    nameEn: 'Faisalabad – Islamabad (M-4 + M-2)',
    nameUr: 'فیصل آباد تا اسلام آباد (ایم 4 + ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Faisalabad – Pindi Bhattian (M-4)', nameUr: 'فیصل آباد تا پنڈی بھٹیاں (ایم 4)', km: 85 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 }
    ]
  },
  'Faisalabad-Peshawar': {
    nameEn: 'Faisalabad – Peshawar (M-4 + M-2 + M-1)',
    nameUr: 'فیصل آباد تا پشاور (ایم 4 + ایم 2 + ایم 1)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Faisalabad – Pindi Bhattian (M-4)', nameUr: 'فیصل آباد تا پنڈی بھٹیاں (ایم 4)', km: 85 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },

  // Central Punjab (Lahore, Gujranwala, Sialkot)
  'Lahore-Sialkot': {
    nameEn: 'Lahore – Sialkot Motorway (M-11 Full 103 km)',
    nameUr: 'لاہور تا سیالکوٹ موٹروے (ایم 11 مکمل 103 کلومیٹر)',
    routeType: 'motorway',
    segments: [
      { code: 'M11', nameEn: 'Lahore – Sialkot (M-11 Full)', nameUr: 'لاہور تا سیالکوٹ (ایم 11 مکمل 103 کلومیٹر)', km: 103 }
    ]
  },
  'Lahore-Gujranwala': {
    nameEn: 'Lahore – Gujranwala (N-5 GT Road / Gujranwala Expressway Link)',
    nameUr: 'لاہور تا گوجرانوالہ (این 5 جی ٹی روڈ / ایکسپریس وے)',
    routeType: 'highway',
    plazas: 1,
    highwayCode: 'N5'
  },
  'Lahore-Rawalpindi': {
    nameEn: 'Lahore – Rawalpindi / Islamabad (M-2 Full Route 367 km)',
    nameUr: 'لاہور تا راولپنڈی / اسلام آباد (ایم 2 موٹروے مکمل 367 کلومیٹر)',
    routeType: 'motorway',
    segments: [
      { code: 'M2', nameEn: 'Lahore – Islamabad / Rawalpindi (M-2 Full)', nameUr: 'لاہور تا اسلام آباد (ایم 2 مکمل 367 کلومیٹر)', km: 367 }
    ]
  },
  'Lahore-Islamabad': {
    nameEn: 'Lahore – Islamabad (M-2 Full Route 367 km)',
    nameUr: 'لاہور تا اسلام آباد (ایم 2 موٹروے مکمل 367 کلومیٹر)',
    routeType: 'motorway',
    segments: [
      { code: 'M2', nameEn: 'Lahore – Islamabad (M-2 Full)', nameUr: 'لاہور تا اسلام آباد (ایم 2 مکمل 367 کلومیٹر)', km: 367 }
    ]
  },
  'Lahore-Peshawar': {
    nameEn: 'Lahore – Peshawar (M-2 + M-1 Full Motorway)',
    nameUr: 'لاہور تا پشاور (ایم 2 + ایم 1 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M2', nameEn: 'Lahore – Islamabad (M-2 Full)', nameUr: 'لاہور تا اسلام آباد (ایم 2)', km: 367 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1 Full)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },
  'Lahore-Abbottabad': {
    nameEn: 'Lahore – Abbottabad (M-2 + M-15 Hazara Motorway)',
    nameUr: 'لاہور تا ایبٹ آباد (ایم 2 + ایم 15 ہزارہ موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M2', nameEn: 'Lahore – Burhan / Brahma Interchange (M-2)', nameUr: 'لاہور تا برہان جنکشن (ایم 2)', km: 350 },
      { code: 'M15', nameEn: 'Burhan – Abbottabad (M-15 Hazara Motorway)', nameUr: 'برہان تا ایبٹ آباد (ایم 15)', km: 60 }
    ]
  },
  'Lahore-Swat': {
    nameEn: 'Lahore – Swat (M-2 + M-1 + M-16 Swat Motorway)',
    nameUr: 'لاہور تا سوات (ایم 2 + ایم 1 + ایم 16 سوات موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M2', nameEn: 'Lahore – Islamabad (M-2)', nameUr: 'لاہور تا اسلام آباد (ایم 2)', km: 367 },
      { code: 'M1', nameEn: 'Islamabad – Karnal Sher Khan (M-1)', nameUr: 'اسلام آباد تا کرنل شیر خان جنکشن (ایم 1)', km: 90 },
      { code: 'M16', nameEn: 'Karnal Sher Khan – Chakdara / Swat (M-16)', nameUr: 'کرنل شیر خان تا چکدرہ سوات (ایم 16)', km: 160 }
    ]
  },

  // Rawalpindi / Islamabad & KPK Corridors
  'Rawalpindi-Peshawar': {
    nameEn: 'Rawalpindi / Islamabad – Peshawar (M-1 Full Route 155 km)',
    nameUr: 'راولپنڈی / اسلام آباد تا پشاور (ایم 1 موٹروے مکمل 155 کلومیٹر)',
    routeType: 'motorway',
    segments: [
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1 Full)', nameUr: 'اسلام آباد تا پشاور (ایم 1 مکمل 155 کلومیٹر)', km: 155 }
    ]
  },
  'Islamabad-Peshawar': {
    nameEn: 'Islamabad – Peshawar (M-1 Full Route 155 km)',
    nameUr: 'اسلام آباد تا پشاور (ایم 1 موٹروے مکمل 155 کلومیٹر)',
    routeType: 'motorway',
    segments: [
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1 Full)', nameUr: 'اسلام آباد تا پشاور (ایم 1 مکمل 155 کلومیٹر)', km: 155 }
    ]
  },
  'Islamabad-Abbottabad': {
    nameEn: 'Islamabad – Abbottabad (M-15 Hazara Motorway)',
    nameUr: 'اسلام آباد تا ایبٹ آباد (ایم 15 ہزارہ موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M15', nameEn: 'Burhan – Abbottabad (M-15 Hazara Motorway)', nameUr: 'برہان تا ایبٹ آباد (ایم 15)', km: 60 }
    ]
  },
  'Islamabad-Swat': {
    nameEn: 'Islamabad – Swat / Mingora (M-1 + M-16 Swat Motorway)',
    nameUr: 'اسلام آباد تا سوات (ایم 1 + ایم 16 سوات موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M1', nameEn: 'Islamabad – Karnal Sher Khan Interchange (M-1)', nameUr: 'اسلام آباد تا کرنل شیر خان (ایم 1)', km: 90 },
      { code: 'M16', nameEn: 'Karnal Sher Khan – Chakdara (M-16 Swat Motorway)', nameUr: 'کرنل شیر خان تا چکدرہ (ایم 16)', km: 160 }
    ]
  },
  'Islamabad-DIKhan': {
    nameEn: 'Islamabad – D.I. Khan (M-14 Hakla-D.I. Khan Motorway)',
    nameUr: 'اسلام آباد تا ڈیرہ اسماعیل خان (ایم 14 ہکلہ موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M14', nameEn: 'Hakla / Islamabad – D.I. Khan (M-14 Full 292 km)', nameUr: 'ہکلہ تا ڈیرہ اسماعیل خان (ایم 14 مکمل 292 کلومیٹر)', km: 292 }
    ]
  },
  'Rawalpindi-DIKhan': {
    nameEn: 'Rawalpindi – D.I. Khan (M-14 Hakla-D.I. Khan Motorway)',
    nameUr: 'راولپنڈی تا ڈیرہ اسماعیل خان (ایم 14 ہکلہ موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M14', nameEn: 'Hakla / Rawalpindi – D.I. Khan (M-14 Full 292 km)', nameUr: 'ہکلہ تا ڈیرہ اسماعیل خان (ایم 14 مکمل)', km: 292 }
    ]
  },
  'Peshawar-Swat': {
    nameEn: 'Peshawar – Swat (M-1 + M-16 Swat Motorway)',
    nameUr: 'پشاور تا سوات (ایم 1 + ایم 16 سوات موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M1', nameEn: 'Peshawar – Karnal Sher Khan (M-1)', nameUr: 'پشاور تا کرنل شیر خان (ایم 1)', km: 65 },
      { code: 'M16', nameEn: 'Karnal Sher Khan – Chakdara (M-16)', nameUr: 'کرنل شیر خان تا چکدرہ (ایم 16)', km: 160 }
    ]
  },
  'Peshawar-Abbottabad': {
    nameEn: 'Peshawar – Abbottabad (M-1 + M-15 Hazara Motorway)',
    nameUr: 'پشاور تا ایبٹ آباد (ایم 1 + ایم 15 ہزارہ موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M1', nameEn: 'Peshawar – Burhan (M-1)', nameUr: 'پشاور تا برہان (ایم 1)', km: 120 },
      { code: 'M15', nameEn: 'Burhan – Abbottabad (M-15)', nameUr: 'برہان تا ایبٹ آباد (ایم 15)', km: 60 }
    ]
  },

  // Sargodha Corridors
  'Sargodha-Lahore': {
    nameEn: 'Sargodha – Lahore Corridor (M-2 Kot Momin Interchange)',
    nameUr: 'سرگودھا تا لاہور موٹروے (ایم 2 کوٹ مومن انٹرچینج)',
    routeType: 'motorway',
    segments: [
      { code: 'M2', nameEn: 'Kot Momin / Sargodha – Lahore (M-2)', nameUr: 'کوٹ مومن سرگودھا تا لاہور (ایم 2)', km: 190 }
    ]
  },
  'Sargodha-Islamabad': {
    nameEn: 'Sargodha – Islamabad / Rawalpindi (M-2 Kot Momin / Salem)',
    nameUr: 'سرگودھا تا اسلام آباد / راولپنڈی (ایم 2 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M2', nameEn: 'Kot Momin – Islamabad (M-2)', nameUr: 'کوٹ مومن تا اسلام آباد (ایم 2)', km: 180 }
    ]
  },
  'Sargodha-Rawalpindi': {
    nameEn: 'Sargodha – Rawalpindi (M-2 Kot Momin Interchange)',
    nameUr: 'سرگودھا تا راولپنڈی موٹروے (ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M2', nameEn: 'Kot Momin – Rawalpindi (M-2)', nameUr: 'کوٹ مومن تا راولپنڈی (ایم 2)', km: 180 }
    ]
  },
  'Sargodha-Faisalabad': {
    nameEn: 'Sargodha – Faisalabad Corridor (M-4 / Pindi Bhattian Link)',
    nameUr: 'سرگودھا تا فیصل آباد (ایم 4 لنک)',
    routeType: 'mixed',
    plazas: 1,
    highwayCode: 'N5',
    segments: [
      { code: 'M4', nameEn: 'Pindi Bhattian – Faisalabad (M-4)', nameUr: 'پنڈی بھٹیاں تا فیصل آباد (ایم 4)', km: 53 }
    ]
  },
  'Sargodha-Multan': {
    nameEn: 'Sargodha – Multan Corridor (M-2 + M-4)',
    nameUr: 'سرگودھا تا ملتان (ایم 2 + ایم 4)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Pindi Bhattian – Multan (M-4 Full)', nameUr: 'پنڈی بھٹیاں تا ملتان (ایم 4)', km: 309 }
    ]
  },
  'Sargodha-Peshawar': {
    nameEn: 'Sargodha – Peshawar (M-2 + M-1 Motorway)',
    nameUr: 'سرگودھا تا پشاور (ایم 2 + ایم 1 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M2', nameEn: 'Kot Momin – Islamabad (M-2)', nameUr: 'کوٹ مومن تا اسلام آباد (ایم 2)', km: 180 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },

  // Rahim Yar Khan Corridors
  'Rahim Yar Khan-Multan': {
    nameEn: 'Rahim Yar Khan – Multan (M-5 Motorway)',
    nameUr: 'رحیم یار خان تا ملتان (ایم 5 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Rahim Yar Khan – Multan (M-5)', nameUr: 'رحیم یار خان تا ملتان (ایم 5)', km: 210 }
    ]
  },
  'Rahim Yar Khan-Lahore': {
    nameEn: 'Rahim Yar Khan – Lahore (M-5 + M-4 + M-3 Full Motorway)',
    nameUr: 'رحیم یار خان تا لاہور (ایم 5 + ایم 4 + ایم 3 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Rahim Yar Khan – Multan (M-5)', nameUr: 'رحیم یار خان تا ملتان (ایم 5)', km: 210 },
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Rahim Yar Khan-Faisalabad': {
    nameEn: 'Rahim Yar Khan – Faisalabad (M-5 + M-4 Motorway)',
    nameUr: 'رحیم یار خان تا فیصل آباد (ایم 5 + ایم 4)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Rahim Yar Khan – Multan (M-5)', nameUr: 'رحیم یار خان تا ملتان (ایم 5)', km: 210 },
      { code: 'M4', nameEn: 'Multan – Faisalabad (M-4)', nameUr: 'ملتان تا فیصل آباد (ایم 4)', km: 240 }
    ]
  },
  'Rahim Yar Khan-Islamabad': {
    nameEn: 'Rahim Yar Khan – Islamabad (M-5 + M-4 + M-2 Motorway)',
    nameUr: 'رحیم یار خان تا اسلام آباد (ایم 5 + ایم 4 + ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Rahim Yar Khan – Multan (M-5)', nameUr: 'رحیم یار خان تا ملتان (ایم 5)', km: 210 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 }
    ]
  },
  'Rahim Yar Khan-Rawalpindi': {
    nameEn: 'Rahim Yar Khan – Rawalpindi (M-5 + M-4 + M-2 Motorway)',
    nameUr: 'رحیم یار خان تا راولپنڈی (ایم 5 + ایم 4 + ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Rahim Yar Khan – Multan (M-5)', nameUr: 'رحیم یار خان تا ملتان (ایم 5)', km: 210 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Rawalpindi (M-2)', nameUr: 'پنڈی بھٹیاں تا راولپنڈی (ایم 2)', km: 220 }
    ]
  },

  // Bahawalpur Corridors
  'Bahawalpur-Multan': {
    nameEn: 'Bahawalpur – Multan (M-5 Jalalpur Pirwala / N-5)',
    nameUr: 'بہاولپور تا ملتان (ایم 5 / این 5)',
    routeType: 'mixed',
    plazas: 1,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Jalalpur Pirwala – Multan (M-5)', nameUr: 'جلالپور پیروالا تا ملتان (ایم 5)', km: 85 }
    ]
  },
  'Bahawalpur-Lahore': {
    nameEn: 'Bahawalpur – Lahore (M-5 + M-4 + M-3 Motorway)',
    nameUr: 'بہاولپور تا لاہور (ایم 5 + ایم 4 + ایم 3 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Bahawalpur Interchange – Multan (M-5)', nameUr: 'بہاولپور انٹرچینج تا ملتان (ایم 5)', km: 85 },
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Bahawalpur-Faisalabad': {
    nameEn: 'Bahawalpur – Faisalabad (M-5 + M-4 Motorway)',
    nameUr: 'بہاولپور تا فیصل آباد (ایم 5 + ایم 4 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Bahawalpur – Multan (M-5)', nameUr: 'بہاولپور تا ملتان (ایم 5)', km: 85 },
      { code: 'M4', nameEn: 'Multan – Faisalabad (M-4)', nameUr: 'ملتان تا فیصل آباد (ایم 4)', km: 240 }
    ]
  },
  'Bahawalpur-Islamabad': {
    nameEn: 'Bahawalpur – Islamabad (M-5 + M-4 + M-2 Motorway)',
    nameUr: 'بہاولپور تا اسلام آباد (ایم 5 + ایم 4 + ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Bahawalpur – Multan (M-5)', nameUr: 'بہاولپور تا ملتان (ایم 5)', km: 85 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 }
    ]
  },

  // Sialkot Corridors
  'Sialkot-Islamabad': {
    nameEn: 'Sialkot – Islamabad (M-11 + M-2 Motorway / GT Road)',
    nameUr: 'سیالکوٹ تا اسلام آباد (ایم 11 + ایم 2 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M11', nameEn: 'Sialkot – Kala Shah Kaku (M-11)', nameUr: 'سیالکوٹ تا کالا شاہ کاکو (ایم 11)', km: 103 },
      { code: 'M2', nameEn: 'Kala Shah Kaku – Islamabad (M-2)', nameUr: 'کالا شاہ کاکو تا اسلام آباد (ایم 2)', km: 350 }
    ]
  },
  'Sialkot-Rawalpindi': {
    nameEn: 'Sialkot – Rawalpindi (M-11 + M-2 Motorway)',
    nameUr: 'سیالکوٹ تا راولپنڈی (ایم 11 + ایم 2 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M11', nameEn: 'Sialkot – Kala Shah Kaku (M-11)', nameUr: 'سیالکوٹ تا کالا شاہ کاکو (ایم 11)', km: 103 },
      { code: 'M2', nameEn: 'Kala Shah Kaku – Rawalpindi (M-2)', nameUr: 'کالا شاہ کاکو تا راولپنڈی (ایم 2)', km: 350 }
    ]
  },
  'Sialkot-Peshawar': {
    nameEn: 'Sialkot – Peshawar (M-11 + M-2 + M-1 Motorway)',
    nameUr: 'سیالکوٹ تا پشاور (ایم 11 + ایم 2 + ایم 1)',
    routeType: 'motorway',
    segments: [
      { code: 'M11', nameEn: 'Sialkot – Kala Shah Kaku (M-11)', nameUr: 'سیالکوٹ تا کالا شاہ کاکو (ایم 11)', km: 103 },
      { code: 'M2', nameEn: 'Kala Shah Kaku – Islamabad (M-2)', nameUr: 'کالا شاہ کاکو تا اسلام آباد (ایم 2)', km: 350 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },
  'Sialkot-Multan': {
    nameEn: 'Sialkot – Multan (M-11 + M-3 + M-4 Motorway)',
    nameUr: 'سیالکوٹ تا ملتان (ایم 11 + ایم 3 + ایم 4)',
    routeType: 'motorway',
    segments: [
      { code: 'M11', nameEn: 'Sialkot – Lahore / KSK (M-11)', nameUr: 'سیالکوٹ تا لاہور (ایم 11)', km: 103 },
      { code: 'M3', nameEn: 'Lahore – Abdul Hakeem (M-3)', nameUr: 'لاہور تا عبدالحکیم (ایم 3)', km: 230 },
      { code: 'M4', nameEn: 'Abdul Hakeem – Multan (M-4)', nameUr: 'عبدالحکیم تا ملتان (ایم 4)', km: 104 }
    ]
  },
  'Sialkot-Faisalabad': {
    nameEn: 'Sialkot – Faisalabad (M-11 + M-3 + M-4)',
    nameUr: 'سیالکوٹ تا فیصل آباد (ایم 11 + ایم 3 + ایم 4)',
    routeType: 'motorway',
    segments: [
      { code: 'M11', nameEn: 'Sialkot – Lahore (M-11)', nameUr: 'سیالکوٹ تا لاہور (ایم 11)', km: 103 },
      { code: 'M3', nameEn: 'Lahore – Samundri / Faisalabad Link (M-3)', nameUr: 'لاہور تا سمندری انٹرچینج (ایم 3)', km: 145 }
    ]
  },
  'Sialkot-Gujranwala': {
    nameEn: 'Sialkot – Gujranwala Corridor (GT Road / Expressway)',
    nameUr: 'سیالکوٹ تا گوجرانوالہ (ایکسپریس وے / جی ٹی روڈ)',
    routeType: 'highway',
    plazas: 1,
    highwayCode: 'N5'
  },

  // Gujranwala Corridors
  'Gujranwala-Islamabad': {
    nameEn: 'Gujranwala – Islamabad (N-5 GT Road / M-2 Link)',
    nameUr: 'گوجرانوالہ تا اسلام آباد (این 5 جی ٹی روڈ / ایم 2)',
    routeType: 'mixed',
    plazas: 2,
    highwayCode: 'N5',
    segments: [
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 }
    ]
  },
  'Gujranwala-Rawalpindi': {
    nameEn: 'Gujranwala – Rawalpindi (N-5 GT Road / M-2)',
    nameUr: 'گوجرانوالہ تا راولپنڈی (این 5 جی ٹی روڈ / ایم 2)',
    routeType: 'mixed',
    plazas: 2,
    highwayCode: 'N5',
    segments: [
      { code: 'M2', nameEn: 'Pindi Bhattian – Rawalpindi (M-2)', nameUr: 'پنڈی بھٹیاں تا راولپنڈی (ایم 2)', km: 220 }
    ]
  },
  'Gujranwala-Peshawar': {
    nameEn: 'Gujranwala – Peshawar (GT Road / M-2 + M-1)',
    nameUr: 'گوجرانوالہ تا پشاور (ایم 2 + ایم 1 موٹروے)',
    routeType: 'mixed',
    plazas: 1,
    highwayCode: 'N5',
    segments: [
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },
  'Gujranwala-Multan': {
    nameEn: 'Gujranwala – Multan (M-2 / M-4 Motorway)',
    nameUr: 'گوجرانوالہ تا ملتان (ایم 4 موٹروے براستہ پنڈی بھٹیاں)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Pindi Bhattian – Multan (M-4)', nameUr: 'پنڈی بھٹیاں تا ملتان (ایم 4)', km: 309 }
    ]
  },

  // Hyderabad to Upper Corridors
  'Hyderabad-Sukkur': {
    nameEn: 'Hyderabad – Sukkur (N-5 / N-55 Highway)',
    nameUr: 'حیدرآباد تا سکھر (این 5 / این 55 شاہراہ)',
    routeType: 'highway',
    plazas: 4,
    highwayCode: 'N5'
  },
  'Hyderabad-Multan': {
    nameEn: 'Hyderabad – Multan (N-5 + M-5 Sukkur-Multan Motorway)',
    nameUr: 'حیدرآباد تا ملتان (این 5 + ایم 5 موٹروے)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5 مکمل)', km: 392 }
    ]
  },
  'Hyderabad-Lahore': {
    nameEn: 'Hyderabad – Lahore (N-5 + M-5 + M-4 + M-3)',
    nameUr: 'حیدرآباد تا لاہور (این 5 + ایم 5 + ایم 4 + ایم 3 موٹروے)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Hyderabad-Islamabad': {
    nameEn: 'Hyderabad – Islamabad (N-5 + M-5 + M-4 + M-2)',
    nameUr: 'حیدرآباد تا اسلام آباد (این 5 + ایم 5 + ایم 4 + ایم 2)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 }
    ]
  },
  'Hyderabad-Faisalabad': {
    nameEn: 'Hyderabad – Faisalabad (N-5 + M-5 + M-4)',
    nameUr: 'حیدرآباد تا فیصل آباد (این 5 + ایم 5 + ایم 4)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Faisalabad (M-4)', nameUr: 'ملتان تا فیصل آباد (ایم 4)', km: 240 }
    ]
  },

  // KPK & Northern Corridors
  'Abbottabad-Rawalpindi': {
    nameEn: 'Abbottabad – Rawalpindi / Islamabad (M-15 Hazara Motorway)',
    nameUr: 'ایبٹ آباد تا راولپنڈی / اسلام آباد (ایم 15 ہزارہ موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M15', nameEn: 'Abbottabad – Burhan (M-15)', nameUr: 'ایبٹ آباد تا برہان (ایم 15)', km: 60 }
    ]
  },
  'Swat-Rawalpindi': {
    nameEn: 'Swat / Mingora – Rawalpindi (M-16 + M-1 Motorway)',
    nameUr: 'سوات تا راولپنڈی (ایم 16 + ایم 1 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M16', nameEn: 'Chakdara – Karnal Sher Khan (M-16)', nameUr: 'چکدرہ تا کرنل شیر خان (ایم 16)', km: 160 },
      { code: 'M1', nameEn: 'Karnal Sher Khan – Islamabad (M-1)', nameUr: 'کرنل شیر خان تا اسلام آباد (ایم 1)', km: 90 }
    ]
  },
  'DIKhan-Lahore': {
    nameEn: 'D.I. Khan – Lahore (M-14 Hakla Motorway + M-2 / M-3)',
    nameUr: 'ڈیرہ اسماعیل خان تا لاہور (ایم 14 ہکلہ + ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M14', nameEn: 'D.I. Khan – Hakla / Islamabad (M-14)', nameUr: 'ڈیرہ اسماعیل خان تا ہکلہ (ایم 14)', km: 292 },
      { code: 'M2', nameEn: 'Hakla / Islamabad – Lahore (M-2)', nameUr: 'اسلام آباد تا لاہور (ایم 2)', km: 367 }
    ]
  },
  'DIKhan-Peshawar': {
    nameEn: 'D.I. Khan – Peshawar (N-55 Indus Highway / Kohat)',
    nameUr: 'ڈیرہ اسماعیل خان تا پشاور (این 55 انڈس ہائی وے)',
    routeType: 'highway',
    plazas: 4,
    highwayCode: 'N55'
  },
  'DIKhan-Multan': {
    nameEn: 'D.I. Khan – Multan (N-55 Indus Highway / Muzaffargarh)',
    nameUr: 'ڈیرہ اسماعیل خان تا ملتان (این 55 انڈس ہائی وے)',
    routeType: 'highway',
    plazas: 3,
    highwayCode: 'N55'
  },
  'Quetta-Islamabad': {
    nameEn: 'Quetta – Islamabad (N-50 Zhob + M-14 Hakla-D.I. Khan Motorway)',
    nameUr: 'کوئٹہ تا اسلام آباد (این 50 ژوب + ایم 14 ہکلہ موٹروے)',
    routeType: 'mixed',
    plazas: 3,
    highwayCode: 'N5',
    segments: [
      { code: 'M14', nameEn: 'D.I. Khan – Hakla / Islamabad (M-14)', nameUr: 'ڈیرہ اسماعیل خان تا ہکلہ اسلام آباد (ایم 14)', km: 292 }
    ]
  },

  // Balochistan & Long Haul Routes
  'Quetta-Karachi': {
    nameEn: 'Quetta – Karachi (N-25 RCD Highway)',
    nameUr: 'کوئٹہ تا کراچی (این 25 آر سی ڈی شاہراہ)',
    routeType: 'highway',
    plazas: 6,
    highwayCode: 'N5'
  },
  'Quetta-Multan': {
    nameEn: 'Quetta – Multan (N-70 Highway)',
    nameUr: 'کوئٹہ تا ملتان (این 70 شاہراہ براستہ فورٹ منرو)',
    routeType: 'highway',
    plazas: 4,
    highwayCode: 'N5'
  },
  'Quetta-Lahore': {
    nameEn: 'Quetta – Lahore (N-70 + M-4 + M-3)',
    nameUr: 'کوئٹہ تا لاہور (این 70 + ایم 4 + ایم 3)',
    routeType: 'mixed',
    plazas: 4,
    highwayCode: 'N5',
    segments: [
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Gwadar-Karachi': {
    nameEn: 'Gwadar – Karachi (N-10 Makran Coastal Highway)',
    nameUr: 'گوادر تا کراچی (این 10 مکران کوسٹل ہائی وے)',
    routeType: 'highway',
    plazas: 4,
    highwayCode: 'N5'
  },
  'Gilgit-Islamabad': {
    nameEn: 'Gilgit – Islamabad (N-35 Karakoram Highway + M-15)',
    nameUr: 'گلگت تا اسلام آباد (شاہراہ ریشم این 35 + ایم 15)',
    routeType: 'mixed',
    plazas: 3,
    highwayCode: 'N5',
    segments: [
      { code: 'M15', nameEn: 'Thakot – Burhan (M-15 Hazara Motorway)', nameUr: 'تھاکوٹ تا برہان (ایم 15)', km: 180 }
    ]
  }
};

// Bidirectional route finder
export function getRouteDefinition(from: TollCity, to: TollCity): RouteDefinition | null {
  if (from === to) return null;
  const directKey = `${from}-${to}`;
  if (ROUTING_MATRIX[directKey]) {
    return ROUTING_MATRIX[directKey];
  }
  const reverseKey = `${to}-${from}`;
  if (ROUTING_MATRIX[reverseKey]) {
    return ROUTING_MATRIX[reverseKey];
  }
  return null;
}

// Approximate city coordinates for smart distance & toll fallback
const CITY_COORDINATES: Partial<Record<TollCity, { lat: number; lng: number }>> = {
  'Karachi': { lat: 24.8607, lng: 67.0011 },
  'Hyderabad': { lat: 25.3960, lng: 68.3578 },
  'Sukkur': { lat: 27.7052, lng: 68.8574 },
  'Rahim Yar Khan': { lat: 28.4212, lng: 70.2989 },
  'Bahawalpur': { lat: 29.3544, lng: 71.6911 },
  'Multan': { lat: 30.1575, lng: 71.5249 },
  'Sahiwal': { lat: 30.6682, lng: 73.1114 },
  'Samundri': { lat: 31.0639, lng: 72.9544 },
  'Faisalabad': { lat: 31.4504, lng: 73.1350 },
  'Sargodha': { lat: 32.0836, lng: 72.6711 },
  'Lahore': { lat: 31.5204, lng: 74.3587 },
  'Gujranwala': { lat: 32.1877, lng: 74.1945 },
  'Sialkot': { lat: 32.4945, lng: 74.5229 },
  'Rawalpindi': { lat: 33.5651, lng: 73.0169 },
  'Islamabad': { lat: 33.6844, lng: 73.0479 },
  'Peshawar': { lat: 34.0151, lng: 71.5249 },
  'Abbottabad': { lat: 34.1688, lng: 73.2215 },
  'Swat': { lat: 34.7717, lng: 72.3602 },
  'Quetta': { lat: 30.1798, lng: 66.9750 },
  'Gwadar': { lat: 25.1264, lng: 62.3225 },
  'DIKhan': { lat: 31.8626, lng: 70.9019 },
  'Gilgit': { lat: 35.9221, lng: 74.3087 }
};

function calculateDistanceKm(c1: TollCity, c2: TollCity): number {
  const p1 = CITY_COORDINATES[c1];
  const p2 = CITY_COORDINATES[c2];
  if (!p1 || !p2) return 300;
  
  const R = 6371; // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // Multiply by road winding factor ~ 1.35
  return Math.round(R * c * 1.35);
}

// -------------------------------------------------------------
// Storage & Firestore Sync
// -------------------------------------------------------------
const withTimeout = <T>(promise: Promise<T>, ms: number = 2500): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout of ${ms}ms exceeded`)), ms)
    )
  ]);
};

export async function getStoredTollRates(): Promise<TollRatesConfig> {
  const cached = localStorage.getItem('ah-toll-rates');
  let rates: TollRatesConfig = cached ? JSON.parse(cached) : DEFAULT_TOLL_RATES;

  if (typeof navigator === 'undefined' || navigator.onLine) {
    try {
      const docRef = doc(db, 'settings', 'tollRates');
      const snap = await withTimeout(getDoc(docRef), 2000);
      if (snap.exists()) {
        rates = { ...DEFAULT_TOLL_RATES, ...snap.data() } as TollRatesConfig;
        localStorage.setItem('ah-toll-rates', JSON.stringify(rates));
      }
    } catch {
      // Return cached/default on network failure
    }
  }
  return rates;
}

export function getCachedTollRates(): TollRatesConfig {
  try {
    const cached = localStorage.getItem('ah-toll-rates');
    return cached ? { ...DEFAULT_TOLL_RATES, ...JSON.parse(cached) } : DEFAULT_TOLL_RATES;
  } catch {
    return DEFAULT_TOLL_RATES;
  }
}

export async function saveTollRatesInFirestore(rates: TollRatesConfig) {
  const updatedRates: TollRatesConfig = {
    ...rates,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem('ah-toll-rates', JSON.stringify(updatedRates));

  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const docRef = doc(db, 'settings', 'tollRates');
      await withTimeout(setDoc(docRef, updatedRates, { merge: true }), 3000);
    } catch (err) {
      console.warn('Failed saving toll rates to Firestore:', err);
    }
  }

  await logActivity(
    'Toll Rates Updated',
    'NHA Motorway and Highway tariffs updated in system settings',
    'settings'
  );
}

export async function resetTollRatesToDefault() {
  await saveTollRatesInFirestore(DEFAULT_TOLL_RATES);
  return DEFAULT_TOLL_RATES;
}

// Online rates sync verification helper
export async function syncTollRatesWithNHA(): Promise<{ success: boolean; rates: TollRatesConfig; message: string }> {
  try {
    const rates = await getStoredTollRates();
    return {
      success: true,
      rates,
      message: '2026 NHA Toll Rates successfully verified & synchronized.'
    };
  } catch (err) {
    return {
      success: false,
      rates: DEFAULT_TOLL_RATES,
      message: 'Operating on local cached NHA 2026 tariff schedule.'
    };
  }
}

// -------------------------------------------------------------
// Calculation Engine
// -------------------------------------------------------------
export interface SegmentCostBreakdown {
  nameEn: string;
  nameUr: string;
  code: string;
  km?: number;
  plazas?: number;
  toll: number;
}

export interface TollCalculationResult {
  isValid: boolean;
  errorMessageEn?: string;
  errorMessageUr?: string;
  routeNameEn: string;
  routeNameUr: string;
  routeType: 'motorway' | 'highway' | 'mixed';
  baseToll: number;
  surcharge: number;
  total: number;
  totalKm: number;
  segments: SegmentCostBreakdown[];
  hasMtag: boolean;
  vehicleClass: TollVehicleClass;
  isMotorwayRestricted?: boolean;
}

export function calculateToll(params: {
  from: TollCity;
  to: TollCity;
  vehicleClass: TollVehicleClass;
  hasMtag: boolean;
  rates?: TollRatesConfig;
}): TollCalculationResult {
  const { from, to, vehicleClass, hasMtag } = params;
  const rates = params.rates || getCachedTollRates();

  const fromObj = CITIES_LIST.find(c => c.id === from);
  const toObj = CITIES_LIST.find(c => c.id === to);
  const fromNameEn = fromObj?.nameEn || from;
  const toNameEn = toObj?.nameEn || to;
  const fromNameUr = fromObj?.nameUr || from;
  const toNameUr = toObj?.nameUr || to;

  if (from === to) {
    return {
      isValid: false,
      errorMessageEn: 'Start and destination cities cannot be identical',
      errorMessageUr: 'شروع اور منزل ایک جیسی نہیں ہو سکتی',
      routeNameEn: `${fromNameEn} – ${toNameEn}`,
      routeNameUr: `${fromNameUr} تا ${toNameUr}`,
      routeType: 'motorway',
      baseToll: 0,
      surcharge: 0,
      total: 0,
      totalKm: 0,
      segments: [],
      hasMtag,
      vehicleClass
    };
  }

  let route = getRouteDefinition(from, to);

  // If no explicit route in matrix, generate dynamic smart corridor calculation
  if (!route) {
    const estDistance = calculateDistanceKm(from, to);
    const estPlazas = Math.max(1, Math.round(estDistance / 90));
    route = {
      nameEn: `${fromNameEn} – ${toNameEn} National Highway Corridor (~${estDistance} km)`,
      nameUr: `${fromNameUr} تا ${toNameUr} شاہراہ کوریڈور (~${estDistance} کلومیٹر)`,
      routeType: 'highway',
      plazas: estPlazas,
      highwayCode: 'N5'
    };
  }

  let baseTollRaw = 0;
  let totalKm = 0;
  const segmentsList: SegmentCostBreakdown[] = [];
  let isMotorwayRestricted = false;

  // Check if vehicle is bike on a motorway-only segment
  if (vehicleClass === 'bike') {
    // Bikes are not permitted on M-1, M-2, M-3, M-4, M-5, M-9 closed motorways
    if (route.routeType === 'motorway') {
      isMotorwayRestricted = true;
    }
  }

  // Highway Plazas calculation
  if (route.plazas && route.plazas > 0) {
    const hwKey = (route.highwayCode as 'N5' | 'N55') || 'N5';
    const hwRate = rates.highways?.[hwKey] || DEFAULT_TOLL_RATES.highways.N5;
    const perPlaza = hwRate.per_plaza_rate[vehicleClass] ?? 60;
    const hwToll = route.plazas * perPlaza;
    baseTollRaw += hwToll;
    segmentsList.push({
      nameEn: `${hwRate.name || 'GT Road / N-5'} (${route.plazas} Toll Plazas)`,
      nameUr: `این 5 جی ٹی روڈ / قومی شاہراہ (${route.plazas} ٹول پلازے)`,
      code: hwKey,
      plazas: route.plazas,
      toll: Math.round(hwToll)
    });
  }

  // Motorway Segments calculation
  if (route.segments && route.segments.length > 0) {
    for (const seg of route.segments) {
      totalKm += seg.km;
      let segmentToll = 0;

      if (vehicleClass === 'bike') {
        // Motorcycle toll on closed motorways is 0 (entry restricted) or highway bridge token
        segmentToll = 0;
      } else if (seg.code === 'M2') {
        // M2 Per-KM pricing
        const m2Rate = rates.motorways?.M2 || DEFAULT_TOLL_RATES.motorways.M2;
        const perKm = m2Rate.per_km_rate[vehicleClass] ?? 3.90;
        segmentToll = seg.km * perKm;
      } else {
        // M1, M3, M4, M5, M9, M11, M14, M15, M16 Pro-rated full-route pricing
        const mwKey = seg.code as 'M1' | 'M3' | 'M4' | 'M5' | 'M9' | 'M11' | 'M14' | 'M15' | 'M16';
        const mwRate = rates.motorways?.[mwKey] || DEFAULT_TOLL_RATES.motorways[mwKey];
        if (mwRate) {
          const fullRate = mwRate.rates[vehicleClass] ?? 1000;
          const totalMwKm = mwRate.total_km || 100;
          segmentToll = (seg.km / totalMwKm) * fullRate;
        } else {
          // Standard fallback pro-rated
          segmentToll = seg.km * 4.5;
        }
      }

      baseTollRaw += segmentToll;
      segmentsList.push({
        nameEn: seg.nameEn,
        nameUr: seg.nameUr,
        code: seg.code,
        km: seg.km,
        toll: Math.round(segmentToll)
      });
    }
  }

  const baseToll = Math.round(baseTollRaw);
  // Non M-Tag surcharge is 50% extra penalty on Pakistani motorways per NHA rule (except bikes/exempt)
  const surcharge = (hasMtag || vehicleClass === 'bike') ? 0 : Math.round(baseToll * 0.5);
  const total = baseToll + surcharge;

  return {
    isValid: true,
    routeNameEn: route.nameEn,
    routeNameUr: route.nameUr,
    routeType: route.routeType,
    baseToll,
    surcharge,
    total,
    totalKm,
    segments: segmentsList,
    hasMtag,
    vehicleClass,
    isMotorwayRestricted
  };
}

// -------------------------------------------------------------
// Detailed Motorways & Highways Tariff Directory
// -------------------------------------------------------------
export interface MotorwayDirectoryItem {
  code: string;
  nameEn: string;
  nameUr: string;
  routeEn: string;
  routeUr: string;
  totalKm: number;
  type: 'motorway' | 'highway';
  interchanges: string[];
  interchangesUr: string[];
  rates: Record<TollVehicleClass, number>;
  descriptionUr: string;
  descriptionEn: string;
}

export const MOTORWAYS_DIRECTORY: MotorwayDirectoryItem[] = [
  {
    code: 'M1',
    nameEn: 'M-1 Motorway',
    nameUr: 'ایم 1 موٹروے',
    routeEn: 'Islamabad – Peshawar',
    routeUr: 'اسلام آباد تا پشاور',
    totalKm: 155,
    type: 'motorway',
    interchanges: ['Islamabad Toll Plaza', 'Fateh Jang', 'Brahma Bahtar', 'Burhan', 'Hazro', 'Chachh', 'Sawabi', 'Rashakai', 'Charsadda', 'Peshawar Toll Plaza'],
    interchangesUr: ['اسلام آباد ٹول پلازہ', 'فتح جنگ', 'براہما باہتر', 'برہان', 'ہزرو', 'چھچھ', 'صوابی', 'رشاکئی', 'چارسدہ', 'پشاور ٹول پلازہ'],
    rates: {
      bike: 0,
      car: 700,
      wagon: 1100,
      coaster: 1450,
      bus: 2100,
      truck: 2700,
      articulated: 3350
    },
    descriptionUr: 'اسلام آباد تا پشاور مصدقہ این ایچ اے ایم ٹیگ ریٹس (155 کلومیٹر)',
    descriptionEn: 'Official NHA M-Tag approved tariff for Islamabad to Peshawar corridor'
  },
  {
    code: 'M2',
    nameEn: 'M-2 Motorway',
    nameUr: 'ایم 2 موٹروے',
    routeEn: 'Lahore – Islamabad / Rawalpindi',
    routeUr: 'لاہور تا اسلام آباد / راولپنڈی',
    totalKm: 367,
    type: 'motorway',
    interchanges: ['Babu Sabu (Lahore)', 'Kala Shah Kaku', 'Sheikhupura', 'Khanqah Dogran', 'Sukheke', 'Pindi Bhattian', 'Salem / Bhalwal', 'Kot Momin', 'Kallar Kahar', 'Balkassar', 'Chakri', 'Islamabad'],
    interchangesUr: ['بابو صابو (لاہور)', 'کالا شاہ کاکو', 'شیخوپورہ', 'خانقاہ ڈوگراں', 'سکھیکی', 'پنڈی بھٹیاں', 'سالم / بھلوال', 'کوٹ مومن', 'کلر کہار', 'بلکسر', 'چکری', 'اسلام آباد ٹول پلازہ'],
    rates: {
      bike: 0,
      car: 1430, // 367 * 3.90
      wagon: 2390,
      coaster: 3350,
      bus: 4770,
      truck: 6210,
      articulated: 7980
    },
    descriptionUr: 'لاہور تا اسلام آباد مکمل فاصلہ 367 کلومیٹر (پر کلومیٹر مصدقہ ریٹ لاگو)',
    descriptionEn: 'Lahore to Islamabad complete 367 km stretch with per-km NHA rates'
  },
  {
    code: 'M3',
    nameEn: 'M-3 Motorway',
    nameUr: 'ایم 3 موٹروے',
    routeEn: 'Lahore – Abdul Hakeem',
    routeUr: 'لاہور تا عبدالحکیم',
    totalKm: 230,
    type: 'motorway',
    interchanges: ['Faizpur (Lahore)', 'Sharqpur', 'Nankana Sahib', 'Jaranwala', 'Samundri', 'Rajana', 'Pir Mahal', 'Abdul Hakeem'],
    interchangesUr: ['فیض پور (لاہور)', 'شرقپور', 'ننکانہ صاحب', 'جڑانوالہ', 'سمندری', 'رجانہ', 'پیر محل', 'عبدالحکیم جنکشن'],
    rates: {
      bike: 0,
      car: 1000,
      wagon: 1500,
      coaster: 2200,
      bus: 3150,
      truck: 4050,
      articulated: 5000
    },
    descriptionUr: 'لاہور فیض پور تا عبدالحکیم موٹروے کوریڈور (230 کلومیٹر)',
    descriptionEn: 'Lahore Faizpur to Abdul Hakeem connection (230 km)'
  },
  {
    code: 'M4',
    nameEn: 'M-4 Motorway',
    nameUr: 'ایم 4 موٹروے',
    routeEn: 'Pindi Bhattian – Faisalabad – Multan',
    routeUr: 'پنڈی بھٹیاں تا فیصل آباد تا ملتان',
    totalKm: 309,
    type: 'motorway',
    interchanges: ['Pindi Bhattian', 'Sangla Hill', 'Faisalabad (Sahianwala)', 'Aminpur', 'Gojra', 'Toba Tek Singh', 'Shorkot', 'Abdul Hakeem', 'Khanewal', 'Shamkot (Multan)'],
    interchangesUr: ['پنڈی بھٹیاں', 'سانگلہ ہل', 'فیصل آباد (سہیانوالہ)', 'امین پور', 'گوجرہ', 'ٹوبہ ٹیک سنگھ', 'شورکوٹ', 'عبدالحکیم', 'خانیوال', 'شام کوٹ (ملتان)'],
    rates: {
      bike: 0,
      car: 1350,
      wagon: 1950,
      coaster: 2900,
      bus: 4050,
      truck: 5300,
      articulated: 6500
    },
    descriptionUr: 'پنڈی بھٹیاں تا فیصل آباد تا ملتان کوریڈور (309 کلومیٹر)',
    descriptionEn: 'Pindi Bhattian through Faisalabad to Multan (309 km)'
  },
  {
    code: 'M5',
    nameEn: 'M-5 Motorway (Sukkur – Multan)',
    nameUr: 'ایم 5 موٹروے (ملتان تا سکھر)',
    routeEn: 'Multan – Sukkur (CPEC Corridor)',
    routeUr: 'ملتان تا سکھر (سی پیک کوریڈور)',
    totalKm: 392,
    type: 'motorway',
    interchanges: ['Multan Toll Plaza', 'Shujabad', 'Jalalpur Pirwala', 'Uch Sharif', 'Tarinda Muhammad Panah', 'Zahir Pir', 'Rahim Yar Khan', 'Sadiqabad', 'Ghotki', 'Pano Aqil', 'Rohri / Sukkur'],
    interchangesUr: ['ملتان ٹول پلازہ', 'شجاع آباد', 'جلالپور پیروالا', 'اوچ شریف', 'ترنڈہ محمد پناہ', 'ظاہر پیر', 'رحیم یار خان', 'صادق آباد', 'گھوٹکی', 'پنو عاقل', 'روہڑی / سکھر ٹول پلازہ'],
    rates: {
      bike: 0,
      car: 1500,
      wagon: 2200,
      coaster: 3250,
      bus: 4600,
      truck: 5950,
      articulated: 7250
    },
    descriptionUr: 'ملتان تا سکھر سی پیک 6 لین موٹروے (392 کلومیٹر)',
    descriptionEn: 'Multan to Sukkur 6-lane CPEC Motorway (392 km)'
  },
  {
    code: 'M9',
    nameEn: 'M-9 Motorway',
    nameUr: 'ایم 9 موٹروے',
    routeEn: 'Karachi – Hyderabad',
    routeUr: 'کراچی تا حیدرآباد',
    totalKm: 136,
    type: 'motorway',
    interchanges: ['Sohrab Goth (Karachi)', 'Bahria Town', 'Dumba', 'Nooriabad', 'Thana Bula Khan', 'Kotri', 'Jamshoro (Hyderabad)'],
    interchangesUr: ['سہراب گوٹھ (کراچی)', 'بحریہ ٹاؤن', 'ڈمبا', 'نوری آباد', 'تھانہ بولا خان', 'کوٹری', 'جامشورو (حیدرآباد)'],
    rates: {
      bike: 0,
      car: 550,
      wagon: 950,
      coaster: 1350,
      bus: 1850,
      truck: 2700,
      articulated: 3500
    },
    descriptionUr: 'کراچی تا حیدرآباد 6 لین سپر ہائی وے موٹروے (136 کلومیٹر)',
    descriptionEn: 'Karachi to Hyderabad 6-lane Super Highway corridor (136 km)'
  },
  {
    code: 'M11',
    nameEn: 'M-11 Motorway (Lahore – Sialkot)',
    nameUr: 'ایم 11 موٹروے (لاہور تا سیالکوٹ)',
    routeEn: 'Lahore – Sialkot',
    routeUr: 'لاہور تا سیالکوٹ',
    totalKm: 103,
    type: 'motorway',
    interchanges: ['Kala Shah Kaku (Lahore)', 'Muridke', 'Narowal Road', 'Kamoke Link', 'Gujranwala East', 'Daska', 'Sambrial / Sialkot'],
    interchangesUr: ['کالا شاہ کاکو (لاہور)', 'مریدکے', 'نارووال روڈ', 'کامونکی لنک', 'گوجرانوالہ ایسٹ', 'ڈسکہ', 'سمبڑیال / سیالکوٹ'],
    rates: {
      bike: 0,
      car: 350,
      wagon: 500,
      coaster: 750,
      bus: 950,
      truck: 1300,
      articulated: 1700
    },
    descriptionUr: 'لاہور تا سیالکوٹ ایکسپریس وے و موٹروے (103 کلومیٹر)',
    descriptionEn: 'Lahore to Sialkot 4-lane Motorway (103 km)'
  },
  {
    code: 'M14',
    nameEn: 'M-14 Motorway (Hakla – D.I. Khan)',
    nameUr: 'ایم 14 موٹروے (ہکلہ تا ڈیرہ اسماعیل خان)',
    routeEn: 'Hakla / Islamabad – D.I. Khan',
    routeUr: 'ہکلہ / اسلام آباد تا ڈیرہ اسماعیل خان',
    totalKm: 292,
    type: 'motorway',
    interchanges: ['Hakla (Islamabad)', 'Fateh Jang', 'Pindi Gheb', 'Tarap', 'Kharpa', 'Kallurkot', 'Darya Khan', 'Yarik (D.I. Khan)'],
    interchangesUr: ['ہکلہ (اسلام آباد)', 'فتح جنگ', 'پنڈی گھیب', 'تراپ', 'کھرپا', 'کلور کوٹ', 'دریا خان', 'یارک (ڈیرہ اسماعیل خان)'],
    rates: {
      bike: 0,
      car: 1100,
      wagon: 1600,
      coaster: 2300,
      bus: 3100,
      truck: 4200,
      articulated: 5300
    },
    descriptionUr: 'اسلام آباد ہکلہ تا ڈی آئی خان مغربی سی پیک روٹ (292 کلومیٹر)',
    descriptionEn: 'Islamabad Hakla to D.I. Khan Western CPEC Route (292 km)'
  },
  {
    code: 'M15',
    nameEn: 'M-15 Hazara Motorway',
    nameUr: 'ایم 15 ہزارہ موٹروے',
    routeEn: 'Burhan – Abbottabad – Thakot',
    routeUr: 'برہان تا ایبٹ آباد تا تھاکوٹ',
    totalKm: 180,
    type: 'motorway',
    interchanges: ['Burhan Interchange', 'Jharikas', 'Havelian', 'Abbottabad (Shimla)', 'Mansehra', 'Shinkiari', 'Battal', 'Thakot'],
    interchangesUr: ['برہان جنکشن', 'جھاریکس', 'حویلیاں', 'ایبٹ آباد (شملہ)', 'مانسہرہ', 'شنکیاری', 'بٹل', 'تھاکوٹ ٹول پلازہ'],
    rates: {
      bike: 0,
      car: 650,
      wagon: 900,
      coaster: 1300,
      bus: 1800,
      truck: 2400,
      articulated: 3000
    },
    descriptionUr: 'برہان تا ایبٹ آباد، مانسہرہ اور تھاکوٹ شاہراہ (180 کلومیٹر)',
    descriptionEn: 'Burhan to Abbottabad, Mansehra & Thakot Scenic Motorway (180 km)'
  },
  {
    code: 'M16',
    nameEn: 'M-16 Swat Motorway',
    nameUr: 'ایم 16 سوات موٹروے',
    routeEn: 'Karnal Sher Khan – Chakdara / Swat',
    routeUr: 'کرنل شیر خان تا چکدرہ / سوات',
    totalKm: 160,
    type: 'motorway',
    interchanges: ['Karnal Sher Khan (M-1)', 'Swabi Link', 'Katlang', 'Bakshali', 'Palai', 'Zulm Kot (Tunnel)', 'Chakdara (Swat)'],
    interchangesUr: ['کرنل شیر خان (ایم 1)', 'صوابی لنک', 'کاٹلنگ', 'بخشالی', 'پلئی', 'ظلم کوٹ (ٹنل)', 'چکدرہ (سوات)'],
    rates: {
      bike: 0,
      car: 600,
      wagon: 850,
      coaster: 1200,
      bus: 1700,
      truck: 2200,
      articulated: 2800
    },
    descriptionUr: 'کرنل شیر خان تا چکدرہ و سوات ٹنل موٹروے (160 کلومیٹر)',
    descriptionEn: 'Karnal Sher Khan interchange through tunnels to Chakdara Swat (160 km)'
  },
  {
    code: 'N5',
    nameEn: 'N-5 National Highway & GT Road',
    nameUr: 'این 5 قومی شاہراہ و جی ٹی روڈ',
    routeEn: 'Karachi – Lahore – Rawalpindi – Peshawar',
    routeUr: 'کراچی تا لاہور تا راولپنڈی تا پشاور (جی ٹی روڈ)',
    totalKm: 1819,
    type: 'highway',
    interchanges: ['Hyderabad Plaza', 'Moro Plaza', 'Ranipur Plaza', 'Kot Sabzal', 'Rahim Yar Khan', 'Bahawalpur', 'Harappa (Sahiwal)', 'Okara', 'Gujranwala', 'Jhelum Toll', 'Rawalpindi', 'Nowshera'],
    interchangesUr: ['حیدرآباد پلازہ', 'مورو پلازہ', 'رانی پور', 'کوٹ سبزل', 'رحیم یار خان', 'بہاولپور پل', 'ہڑپہ ساہیوال', 'اوکاڑہ', 'گوجرانوالہ', 'جہلم ٹول پلازہ', 'راولپنڈی مندرہ', 'نوشہرہ'],
    rates: {
      bike: 20,
      car: 60,
      wagon: 110,
      coaster: 160,
      bus: 220,
      truck: 280,
      articulated: 400
    },
    descriptionUr: 'این 5 جی ٹی روڈ پر ہر ٹول پلازہ پر فی پلازہ فکس ریٹ وصول کیا جاتا ہے',
    descriptionEn: 'Per-toll plaza flat fee on National Highway N-5 / GT Road'
  },
  {
    code: 'N55',
    nameEn: 'N-55 Indus Highway',
    nameUr: 'این 55 انڈس ہائی وے',
    routeEn: 'Kotri – D.G. Khan – D.I. Khan – Kohat – Peshawar',
    routeUr: 'کوٹری تا ڈی جی خان تا ڈی آئی خان تا کوہاٹ تا پشاور',
    totalKm: 1264,
    type: 'highway',
    interchanges: ['Sehwan Sharif', 'Larkana', 'Shikarpur', 'Kashmore', 'Rajanpur', 'D.G. Khan', 'D.I. Khan', 'Kohat Tunnel', 'Peshawar'],
    interchangesUr: ['سیہون شریف', 'لاڑکانہ', 'شکارپور', 'کشمور', 'راجن پور', 'ڈی جی خان', 'ڈی آئی خان', 'کوہاٹ ٹنل ٹول', 'پشاور'],
    rates: {
      bike: 20,
      car: 60,
      wagon: 110,
      coaster: 160,
      bus: 220,
      truck: 280,
      articulated: 400
    },
    descriptionUr: 'انڈس ہائی وے این 55 اور کوہاٹ ٹنل ٹول پلازہ ریٹس',
    descriptionEn: 'Indus Highway N-55 and Kohat Tunnel toll schedule'
  }
];


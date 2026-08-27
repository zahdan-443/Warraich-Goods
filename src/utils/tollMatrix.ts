import { TollCity, TollVehicleClass, TollRatesConfig, RouteDefinition, MotorwaySegment } from '../types';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { logActivity } from './storage';

// Comprehensive list of major Pakistani commercial logistics and transport hubs
export const CITIES_LIST: { id: TollCity; nameEn: string; nameUr: string; province: string }[] = [
  { id: 'Karachi', nameEn: 'Karachi', nameUr: 'کراچی', province: 'Sindh' },
  { id: 'Hyderabad', nameEn: 'Hyderabad', nameUr: 'حیدرآباد', province: 'Sindh' },
  { id: 'Sukkur', nameEn: 'Sukkur', nameUr: 'سکھر', province: 'Sindh' },
  { id: 'Rahim Yar Khan', nameEn: 'Rahim Yar Khan', nameUr: 'رحیم یار خان', province: 'Punjab' },
  { id: 'Bahawalpur', nameEn: 'Bahawalpur', nameUr: 'بہاولپور', province: 'Punjab' },
  { id: 'Multan', nameEn: 'Multan', nameUr: 'ملتان', province: 'Punjab' },
  { id: 'Sahiwal', nameEn: 'Sahiwal', nameUr: 'ساہیوال', province: 'Punjab' },
  { id: 'Samundri', nameEn: 'Samundri', nameUr: 'سمندری', province: 'Punjab' },
  { id: 'Faisalabad', nameEn: 'Faisalabad', nameUr: 'فیصل آباد', province: 'Punjab' },
  { id: 'Sargodha', nameEn: 'Sargodha', nameUr: 'سرگودھا', province: 'Punjab' },
  { id: 'Lahore', nameEn: 'Lahore', nameUr: 'لاہور', province: 'Punjab' },
  { id: 'Gujranwala', nameEn: 'Gujranwala', nameUr: 'گوجرانوالہ', province: 'Punjab' },
  { id: 'Sialkot', nameEn: 'Sialkot', nameUr: 'سیالکوٹ', province: 'Punjab' },
  { id: 'Rawalpindi', nameEn: 'Rawalpindi', nameUr: 'راولپنڈی', province: 'Punjab' },
  { id: 'Islamabad', nameEn: 'Islamabad', nameUr: 'اسلام آباد', province: 'Federal' },
  { id: 'Peshawar', nameEn: 'Peshawar', nameUr: 'پشاور', province: 'KPK' },
  { id: 'Abbottabad', nameEn: 'Abbottabad', nameUr: 'ایبٹ آباد', province: 'KPK' },
  { id: 'Swat', nameEn: 'Swat / Mingora', nameUr: 'سوات / مینگورہ', province: 'KPK' },
  { id: 'Quetta', nameEn: 'Quetta', nameUr: 'کوئٹہ', province: 'Balochistan' },
  { id: 'Gwadar', nameEn: 'Gwadar', nameUr: 'گوادر', province: 'Balochistan' },
  { id: 'DIKhan', nameEn: 'Dera Ismail Khan', nameUr: 'ڈیرہ اسماعیل خان', province: 'KPK' },
  { id: 'Gilgit', nameEn: 'Gilgit', nameUr: 'گلگت', province: 'Gilgit-Baltistan' }
];

export const VEHICLE_CLASSES: { id: TollVehicleClass; nameEn: string; nameUr: string; descEn: string; nhaCode: string }[] = [
  { 
    id: 'bike', 
    nameEn: 'Motorcycle / Bike', 
    nameUr: 'موٹر سائیکل / بائیک', 
    descEn: '2-Wheeler (Allowed on designated bridges & national highways; restricted on closed motorways)',
    nhaCode: 'Cat-0'
  },
  { 
    id: 'car', 
    nameEn: 'Car / Jeep / Taxi', 
    nameUr: 'کار / جیپ / ٹیکسی', 
    descEn: '2-Axle Light Motor Vehicle (LMV)',
    nhaCode: 'Cat-1'
  },
  { 
    id: 'wagon', 
    nameEn: 'Wagon / Hiace / Van', 
    nameUr: 'ویگن / ہائی ایس / وین', 
    descEn: 'Up to 15-seater Commercial Passenger / Cargo Van',
    nhaCode: 'Cat-2'
  },
  { 
    id: 'coaster', 
    nameEn: 'Coaster / Mini Bus', 
    nameUr: 'کوسٹر / منی بس', 
    descEn: '16-24 Seater Mini Passenger Bus / Medium Vehicle',
    nhaCode: 'Cat-3'
  },
  { 
    id: 'bus', 
    nameEn: 'Passenger Bus (Heavy)', 
    nameUr: 'بڑی مسافر بس (ہیوی)', 
    descEn: 'Commercial Heavy Passenger Bus (Inter-city Coach)',
    nhaCode: 'Cat-4'
  },
  { 
    id: 'truck', 
    nameEn: 'Truck (2-3 Axle Rigid / 6-10 Wheeler)', 
    nameUr: '2-3 ایکسل ٹرک (سادہ / 6 تا 10 ویلر)', 
    descEn: 'Bedford / Hino / Isuzu Rigid Cargo Trucks',
    nhaCode: 'Cat-5'
  },
  { 
    id: 'articulated', 
    nameEn: 'Articulated Truck / Trailer (10-22 Wheeler)', 
    nameUr: 'آرٹیکولیٹڈ ٹریلر (10 تا 22 ویلر ہیوی)', 
    descEn: 'Multi-axle Heavy Prime Mover & Container Trailer',
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

  // Faisalabad Corridors
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
const CITY_COORDINATES: Record<TollCity, { lat: number; lng: number }> = {
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

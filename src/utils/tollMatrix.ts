import { TollCity, TollVehicleClass, TollRatesConfig, RouteDefinition, MotorwaySegment } from '../types';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { logActivity } from './storage';

export const CITIES_LIST: { id: TollCity; nameEn: string; nameUr: string }[] = [
  { id: 'Karachi', nameEn: 'Karachi', nameUr: 'کراچی' },
  { id: 'Sukkur', nameEn: 'Sukkur', nameUr: 'سکھر' },
  { id: 'Rahim Yar Khan', nameEn: 'Rahim Yar Khan', nameUr: 'رحیم یار خان' },
  { id: 'Multan', nameEn: 'Multan', nameUr: 'ملتان' },
  { id: 'Samundri', nameEn: 'Samundri', nameUr: 'سمندری' },
  { id: 'Faisalabad', nameEn: 'Faisalabad', nameUr: 'فیصل آباد' },
  { id: 'Lahore', nameEn: 'Lahore', nameUr: 'لاہور' },
  { id: 'Gujranwala', nameEn: 'Gujranwala', nameUr: 'گوجرانوالہ' },
  { id: 'Rawalpindi', nameEn: 'Rawalpindi', nameUr: 'راولپنڈی' },
  { id: 'Peshawar', nameEn: 'Peshawar', nameUr: 'پشاور' },
];

export const VEHICLE_CLASSES: { id: TollVehicleClass; nameEn: string; nameUr: string; descEn: string }[] = [
  { id: 'car', nameEn: 'Car / Jeep', nameUr: 'کار / جیپ', descEn: '2-Axle Light Motor Vehicle' },
  { id: 'wagon', nameEn: 'Wagon / Van', nameUr: 'ویگن / وین', descEn: 'Up to 15-seater Commercial Wagon' },
  { id: 'bus', nameEn: 'Bus / Coaster', nameUr: 'مسافر بس / کوسٹر', descEn: 'Commercial Heavy Passenger Bus' },
  { id: 'truck', nameEn: 'Truck (2-3 Axle Rigid)', nameUr: 'ٹرک (2-3 ایکسل سادہ)', descEn: 'Rigid Bedford / Hino Cargo Truck' },
  { id: 'articulated', nameEn: 'Articulated Truck (Trailer)', nameUr: 'آرٹیکولیٹڈ ٹرک / ٹریلر', descEn: 'Multi-axle 10-22 Wheeler Trailer' },
];

// Seed default toll rates as of ~July 2026 (NHA tariffs)
export const DEFAULT_TOLL_RATES: TollRatesConfig = {
  motorways: {
    M1: {
      name: 'M1 (Islamabad – Peshawar)',
      total_km: 155,
      rates: {
        car: 700,
        wagon: 980,
        bus: 1750,
        truck: 2300,
        articulated: 3150
      }
    },
    M2: {
      name: 'M2 (Lahore – Islamabad / Rawalpindi)',
      total_km: 367,
      per_km_rate: {
        car: 3.98,
        wagon: 5.57,
        bus: 9.95,
        truck: 13.13,
        articulated: 17.91
      }
    },
    M3: {
      name: 'M3 (Lahore – Abdul Hakeem)',
      total_km: 230,
      rates: {
        car: 1000,
        wagon: 1400,
        bus: 2500,
        truck: 3300,
        articulated: 4500
      }
    },
    M4: {
      name: 'M4 (Pindi Bhattian – Faisalabad – Multan)',
      total_km: 309,
      rates: {
        car: 1350,
        wagon: 1890,
        bus: 3375,
        truck: 4455,
        articulated: 6075
      }
    },
    M5: {
      name: 'M5 (Multan – Sukkur)',
      total_km: 392,
      rates: {
        car: 1500,
        wagon: 2100,
        bus: 3750,
        truck: 4950,
        articulated: 6750
      }
    }
  },
  highways: {
    N5: {
      name: 'N-5 GT Road & National Highway (Per Plaza Rate)',
      per_plaza_rate: {
        car: 60,
        wagon: 100,
        bus: 200,
        truck: 250,
        articulated: 350
      }
    }
  },
  updatedAt: '2026-07-01T00:00:00.000Z',
  updatedBy: 'NHA Published Schedule (Default)'
};

// Static Routing Matrix connecting all 10 cities across Pakistan motorways & highways
export const ROUTING_MATRIX: Record<string, RouteDefinition> = {
  // Karachi corridor
  'Karachi-Sukkur': {
    nameEn: 'Karachi – Sukkur Corridor (N-5)',
    nameUr: 'کراچی تا سکھر کوریڈور (این 5)',
    routeType: 'highway',
    plazas: 5,
    highwayCode: 'N5'
  },
  'Karachi-Rahim Yar Khan': {
    nameEn: 'Karachi – Rahim Yar Khan (N-5 + M-5)',
    nameUr: 'کراچی تا رحیم یار خان (این 5 + ایم 5)',
    routeType: 'mixed',
    plazas: 5,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Rahim Yar Khan', nameUr: 'سکھر تا رحیم یار خان (ایم 5)', km: 170 }
    ]
  },
  'Karachi-Multan': {
    nameEn: 'Karachi – Multan Corridor (N-5 + M-5 Motorway)',
    nameUr: 'کراچی تا ملتان کوریڈور (این 5 + ایم 5 موٹروے)',
    routeType: 'mixed',
    plazas: 5,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان مکمل (ایم 5)', km: 392 }
    ]
  },
  'Karachi-Samundri': {
    nameEn: 'Karachi – Samundri (N-5 + M-5 + M-4)',
    nameUr: 'کراچی تا سمندری (این 5 + ایم 5 + ایم 4)',
    routeType: 'mixed',
    plazas: 5,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Samundri (M-4)', nameUr: 'ملتان تا سمندری (ایم 4)', km: 179 }
    ]
  },
  'Karachi-Faisalabad': {
    nameEn: 'Karachi – Faisalabad (N-5 + M-5 + M-4)',
    nameUr: 'کراچی تا فیصل آباد (این 5 + ایم 5 + ایم 4)',
    routeType: 'mixed',
    plazas: 5,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Faisalabad (M-4)', nameUr: 'ملتان تا فیصل آباد (ایم 4)', km: 224 }
    ]
  },
  'Karachi-Lahore': {
    nameEn: 'Karachi – Lahore Motorway Corridor (N-5 + M-5 + M-4 + M-3)',
    nameUr: 'کراچی تا لاہور موٹروے کوریڈور (این 5 + ایم 5 + ایم 4 + ایم 3)',
    routeType: 'mixed',
    plazas: 5,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3 Full)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Karachi-Gujranwala': {
    nameEn: 'Karachi – Gujranwala Corridor',
    nameUr: 'کراچی تا گوجرانوالہ کوریڈور',
    routeType: 'mixed',
    plazas: 6,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Karachi-Rawalpindi': {
    nameEn: 'Karachi – Rawalpindi / Islamabad (N-5 + M-5 + M-4 + M-2)',
    nameUr: 'کراچی تا راولپنڈی / اسلام آباد (این 5 + ایم 5 + ایم 4 + ایم 2)',
    routeType: 'mixed',
    plazas: 5,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4 Full)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Rawalpindi (M-2)', nameUr: 'پنڈی بھٹیاں تا راولپنڈی (ایم 2)', km: 220 }
    ]
  },
  'Karachi-Peshawar': {
    nameEn: 'Karachi – Peshawar North-South Corridor (Full Motorway Network)',
    nameUr: 'کراچی تا پشاور مکمل کوریڈور (این 5 + ایم 5 + ایم 4 + ایم 2 + ایم 1)',
    routeType: 'mixed',
    plazas: 5,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4 Full)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1 Full)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },

  // Sukkur corridor
  'Sukkur-Rahim Yar Khan': {
    nameEn: 'Sukkur – Rahim Yar Khan (M-5 Motorway)',
    nameUr: 'سکھر تا رحیم یار خان (ایم 5 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Rahim Yar Khan Segment', nameUr: 'سکھر تا رحیم یار خان ٹکڑا (ایم 5)', km: 170 }
    ]
  },
  'Sukkur-Multan': {
    nameEn: 'Sukkur – Multan Motorway (M-5 Full Route)',
    nameUr: 'سکھر تا ملتان موٹروے (ایم 5 مکمل روٹ)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'M-5 Sukkur – Multan (Full 392 km)', nameUr: 'ایم 5 سکھر تا ملتان (392 کلومیٹر)', km: 392 }
    ]
  },
  'Sukkur-Samundri': {
    nameEn: 'Sukkur – Samundri (M-5 + M-4)',
    nameUr: 'سکھر تا سمندری (ایم 5 + ایم 4)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Samundri (M-4)', nameUr: 'ملتان تا سمندری (ایم 4)', km: 179 }
    ]
  },
  'Sukkur-Faisalabad': {
    nameEn: 'Sukkur – Faisalabad (M-5 + M-4)',
    nameUr: 'سکھر تا فیصل آباد (ایم 5 + ایم 4)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Faisalabad (M-4)', nameUr: 'ملتان تا فیصل آباد (ایم 4)', km: 224 }
    ]
  },
  'Sukkur-Lahore': {
    nameEn: 'Sukkur – Lahore (M-5 + M-4 + M-3)',
    nameUr: 'سکھر تا لاہور (ایم 5 + ایم 4 + ایم 3)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3 Full)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Sukkur-Gujranwala': {
    nameEn: 'Sukkur – Gujranwala (M-5 + M-4 + M-3 + N-5)',
    nameUr: 'سکھر تا گوجرانوالہ (ایم 5 + ایم 4 + ایم 3 + این 5)',
    routeType: 'mixed',
    plazas: 1,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3 Full)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Sukkur-Rawalpindi': {
    nameEn: 'Sukkur – Rawalpindi / Islamabad (M-5 + M-4 + M-2)',
    nameUr: 'سکھر تا راولپنڈی / اسلام آباد (ایم 5 + ایم 4 + ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4 Full)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Rawalpindi (M-2)', nameUr: 'پنڈی بھٹیاں تا راولپنڈی (ایم 2)', km: 220 }
    ]
  },
  'Sukkur-Peshawar': {
    nameEn: 'Sukkur – Peshawar (M-5 + M-4 + M-2 + M-1)',
    nameUr: 'سکھر تا پشاور (ایم 5 + ایم 4 + ایم 2 + ایم 1)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Sukkur – Multan (M-5 Full)', nameUr: 'سکھر تا ملتان (ایم 5)', km: 392 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4 Full)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1 Full)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },

  // Rahim Yar Khan corridor
  'Rahim Yar Khan-Multan': {
    nameEn: 'Rahim Yar Khan – Multan (M-5 Motorway)',
    nameUr: 'رحیم یار خان تا ملتان (ایم 5 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Rahim Yar Khan – Multan Segment', nameUr: 'رحیم یار خان تا ملتان (ایم 5)', km: 222 }
    ]
  },
  'Rahim Yar Khan-Samundri': {
    nameEn: 'Rahim Yar Khan – Samundri (M-5 + M-4)',
    nameUr: 'رحیم یار خان تا سمندری (ایم 5 + ایم 4)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Rahim Yar Khan – Multan (M-5)', nameUr: 'رحیم یار خان تا ملتان (ایم 5)', km: 222 },
      { code: 'M4', nameEn: 'Multan – Samundri (M-4)', nameUr: 'ملتان تا سمندری (ایم 4)', km: 179 }
    ]
  },
  'Rahim Yar Khan-Faisalabad': {
    nameEn: 'Rahim Yar Khan – Faisalabad (M-5 + M-4)',
    nameUr: 'رحیم یار خان تا فیصل آباد (ایم 5 + ایم 4)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Rahim Yar Khan – Multan (M-5)', nameUr: 'رحیم یار خان تا ملتان (ایم 5)', km: 222 },
      { code: 'M4', nameEn: 'Multan – Faisalabad (M-4)', nameUr: 'ملتان تا فیصل آباد (ایم 4)', km: 224 }
    ]
  },
  'Rahim Yar Khan-Lahore': {
    nameEn: 'Rahim Yar Khan – Lahore (M-5 + M-4 + M-3)',
    nameUr: 'رحیم یار خان تا لاہور (ایم 5 + ایم 4 + ایم 3)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Rahim Yar Khan – Multan (M-5)', nameUr: 'رحیم یار خان تا ملتان (ایم 5)', km: 222 },
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3 Full)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Rahim Yar Khan-Gujranwala': {
    nameEn: 'Rahim Yar Khan – Gujranwala (M-5 + M-4 + M-3 + N-5)',
    nameUr: 'رحیم یار خان تا گوجرانوالہ (ایم 5 + ایم 4 + ایم 3 + این 5)',
    routeType: 'mixed',
    plazas: 1,
    highwayCode: 'N5',
    segments: [
      { code: 'M5', nameEn: 'Rahim Yar Khan – Multan (M-5)', nameUr: 'رحیم یار خان تا ملتان (ایم 5)', km: 222 },
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Rahim Yar Khan-Rawalpindi': {
    nameEn: 'Rahim Yar Khan – Rawalpindi (M-5 + M-4 + M-2)',
    nameUr: 'رحیم یار خان تا راولپنڈی (ایم 5 + ایم 4 + ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Rahim Yar Khan – Multan (M-5)', nameUr: 'رحیم یار خان تا ملتان (ایم 5)', km: 222 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Rawalpindi (M-2)', nameUr: 'پنڈی بھٹیاں تا راولپنڈی (ایم 2)', km: 220 }
    ]
  },
  'Rahim Yar Khan-Peshawar': {
    nameEn: 'Rahim Yar Khan – Peshawar (M-5 + M-4 + M-2 + M-1)',
    nameUr: 'رحیم یار خان تا پشاور (ایم 5 + ایم 4 + ایم 2 + ایم 1)',
    routeType: 'motorway',
    segments: [
      { code: 'M5', nameEn: 'Rahim Yar Khan – Multan (M-5)', nameUr: 'رحیم یار خان تا ملتان (ایم 5)', km: 222 },
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },

  // Multan corridor
  'Multan-Samundri': {
    nameEn: 'Multan – Samundri (M-4 Motorway)',
    nameUr: 'ملتان تا سمندری (ایم 4 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Multan – Samundri Segment', nameUr: 'ملتان تا سمندری ٹکڑا (ایم 4)', km: 179 }
    ]
  },
  'Multan-Faisalabad': {
    nameEn: 'Multan – Faisalabad (M-4 Motorway)',
    nameUr: 'ملتان تا فیصل آباد (ایم 4 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Multan – Faisalabad Segment', nameUr: 'ملتان تا فیصل آباد ٹکڑا (ایم 4)', km: 224 }
    ]
  },
  'Multan-Lahore': {
    nameEn: 'Multan – Lahore (M-4 + M-3 Motorway)',
    nameUr: 'ملتان تا لاہور (ایم 4 + ایم 3 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3 Full)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Multan-Gujranwala': {
    nameEn: 'Multan – Gujranwala (M-4 + M-3 + N-5)',
    nameUr: 'ملتان تا گوجرانوالہ (ایم 4 + ایم 3 + این 5)',
    routeType: 'mixed',
    plazas: 1,
    highwayCode: 'N5',
    segments: [
      { code: 'M4', nameEn: 'Multan – Abdul Hakeem (M-4)', nameUr: 'ملتان تا عبدالحکیم (ایم 4)', km: 104 },
      { code: 'M3', nameEn: 'Abdul Hakeem – Lahore (M-3)', nameUr: 'عبدالحکیم تا لاہور (ایم 3)', km: 230 }
    ]
  },
  'Multan-Rawalpindi': {
    nameEn: 'Multan – Rawalpindi / Islamabad (M-4 + M-2)',
    nameUr: 'ملتان تا راولپنڈی / اسلام آباد (ایم 4 + ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4 Full)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Rawalpindi (M-2)', nameUr: 'پنڈی بھٹیاں تا راولپنڈی (ایم 2)', km: 220 }
    ]
  },
  'Multan-Peshawar': {
    nameEn: 'Multan – Peshawar (M-4 + M-2 + M-1)',
    nameUr: 'ملتان تا پشاور (ایم 4 + ایم 2 + ایم 1)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Multan – Pindi Bhattian (M-4 Full)', nameUr: 'ملتان تا پنڈی بھٹیاں (ایم 4)', km: 309 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1 Full)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },

  // Samundri (Warraich Goods Head Office) corridor
  'Samundri-Faisalabad': {
    nameEn: 'Samundri – Faisalabad (M-4 Link)',
    nameUr: 'سمندری تا فیصل آباد (ایم 4 لنک)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Samundri Interchange – Faisalabad (M-4)', nameUr: 'سمندری انٹرچینج تا فیصل آباد (ایم 4)', km: 45 }
    ]
  },
  'Samundri-Lahore': {
    nameEn: 'Samundri – Lahore (M-4 / Rajana Link + M-3)',
    nameUr: 'سمندری تا لاہور (ایم 4 / رجانہ لنک + ایم 3)',
    routeType: 'motorway',
    segments: [
      { code: 'M3', nameEn: 'Rajana / Samundri Link – Lahore (M-3)', nameUr: 'سمندری / رجانہ تا لاہور (ایم 3)', km: 180 }
    ]
  },
  'Samundri-Gujranwala': {
    nameEn: 'Samundri – Gujranwala (M-3 + N-5)',
    nameUr: 'سمندری تا گوجرانوالہ (ایم 3 + این 5)',
    routeType: 'mixed',
    plazas: 1,
    highwayCode: 'N5',
    segments: [
      { code: 'M3', nameEn: 'Samundri Link – Lahore (M-3)', nameUr: 'سمندری تا لاہور (ایم 3)', km: 180 }
    ]
  },
  'Samundri-Rawalpindi': {
    nameEn: 'Samundri – Rawalpindi / Islamabad (M-4 + M-2)',
    nameUr: 'سمندری تا راولپنڈی / اسلام آباد (ایم 4 + ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Samundri – Pindi Bhattian (M-4)', nameUr: 'سمندری تا پنڈی بھٹیاں (ایم 4)', km: 130 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Rawalpindi (M-2)', nameUr: 'پنڈی بھٹیاں تا راولپنڈی (ایم 2)', km: 220 }
    ]
  },
  'Samundri-Peshawar': {
    nameEn: 'Samundri – Peshawar (M-4 + M-2 + M-1)',
    nameUr: 'سمندری تا پشاور (ایم 4 + ایم 2 + ایم 1)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Samundri – Pindi Bhattian (M-4)', nameUr: 'سمندری تا پنڈی بھٹیاں (ایم 4)', km: 130 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },

  // Faisalabad corridor
  'Faisalabad-Lahore': {
    nameEn: 'Faisalabad – Lahore (M-4 + M-3 / M-2)',
    nameUr: 'فیصل آباد تا لاہور (ایم 4 + ایم 3 / ایم 2)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Faisalabad – M-3 Junction (M-4)', nameUr: 'فیصل آباد تا ایم 3 جنکشن (ایم 4)', km: 40 },
      { code: 'M3', nameEn: 'M-3 Junction – Lahore (M-3)', nameUr: 'ایم 3 جنکشن تا لاہور (ایم 3)', km: 105 }
    ]
  },
  'Faisalabad-Gujranwala': {
    nameEn: 'Faisalabad – Gujranwala (M-4 + M-2 + N-5)',
    nameUr: 'فیصل آباد تا گوجرانوالہ (ایم 4 + ایم 2 + این 5)',
    routeType: 'mixed',
    plazas: 1,
    highwayCode: 'N5',
    segments: [
      { code: 'M4', nameEn: 'Faisalabad – Pindi Bhattian (M-4)', nameUr: 'فیصل آباد تا پنڈی بھٹیاں (ایم 4)', km: 85 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Sheikhupura/Kot Abdul Malik (M-2)', nameUr: 'پنڈی بھٹیاں تا شیخوپورہ (ایم 2)', km: 90 }
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
  'Faisalabad-Peshawar': {
    nameEn: 'Faisalabad – Peshawar (M-4 + M-2 + M-1)',
    nameUr: 'فیصل آباد تا پشاور (ایم 4 + ایم 2 + ایم 1)',
    routeType: 'motorway',
    segments: [
      { code: 'M4', nameEn: 'Faisalabad – Pindi Bhattian (M-4)', nameUr: 'فیصل آباد تا پنڈی بھٹیاں (ایم 4)', km: 85 },
      { code: 'M2', nameEn: 'Pindi Bhattian – Islamabad (M-2)', nameUr: 'پنڈی بھٹیاں تا اسلام آباد (ایم 2)', km: 220 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1 Full)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },

  // Lahore corridor
  'Lahore-Gujranwala': {
    nameEn: 'Lahore – Gujranwala (N-5 GT Road / Sialkot Motorway Link)',
    nameUr: 'لاہور تا گوجرانوالہ (این 5 جی ٹی روڈ)',
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
  'Lahore-Peshawar': {
    nameEn: 'Lahore – Peshawar (M-2 + M-1 Full Motorway)',
    nameUr: 'لاہور تا پشاور (ایم 2 + ایم 1 موٹروے)',
    routeType: 'motorway',
    segments: [
      { code: 'M2', nameEn: 'Lahore – Islamabad (M-2 Full)', nameUr: 'لاہور تا اسلام آباد (ایم 2)', km: 367 },
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1 Full)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },

  // Gujranwala corridor
  'Gujranwala-Rawalpindi': {
    nameEn: 'Gujranwala – Rawalpindi (N-5 GT Road)',
    nameUr: 'گوجرانوالہ تا راولپنڈی (این 5 جی ٹی روڈ)',
    routeType: 'highway',
    plazas: 3,
    highwayCode: 'N5'
  },
  'Gujranwala-Peshawar': {
    nameEn: 'Gujranwala – Peshawar (N-5 + M-1)',
    nameUr: 'گوجرانوالہ تا پشاور (این 5 + ایم 1)',
    routeType: 'mixed',
    plazas: 3,
    highwayCode: 'N5',
    segments: [
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1 Full)', nameUr: 'اسلام آباد تا پشاور (ایم 1)', km: 155 }
    ]
  },

  // Rawalpindi corridor
  'Rawalpindi-Peshawar': {
    nameEn: 'Rawalpindi / Islamabad – Peshawar (M-1 Full Route 155 km)',
    nameUr: 'راولپنڈی / اسلام آباد تا پشاور (ایم 1 موٹروے مکمل 155 کلومیٹر)',
    routeType: 'motorway',
    segments: [
      { code: 'M1', nameEn: 'Islamabad – Peshawar (M-1 Full)', nameUr: 'اسلام آباد تا پشاور (ایم 1 مکمل 155 کلومیٹر)', km: 155 }
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

  if (from === to) {
    return {
      isValid: false,
      errorMessageEn: 'Start and destination cities cannot be identical',
      errorMessageUr: 'شروع اور منزل ایک جیسی نہیں ہو سکتی',
      routeNameEn: `${from} – ${to}`,
      routeNameUr: `${from} تا ${to}`,
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

  const route = getRouteDefinition(from, to);

  if (!route) {
    return {
      isValid: false,
      errorMessageEn: `Direct motorway routing not found between ${from} and ${to}`,
      errorMessageUr: `${from} اور ${to} کے درمیان براہ راست موٹروے روٹ موجود نہیں`,
      routeNameEn: `${from} – ${to}`,
      routeNameUr: `${from} تا ${to}`,
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

  let baseTollRaw = 0;
  let totalKm = 0;
  const segmentsList: SegmentCostBreakdown[] = [];

  // Highway Plazas calculation
  if (route.plazas && route.plazas > 0) {
    const hwKey = (route.highwayCode as 'N5') || 'N5';
    const hwRate = rates.highways?.[hwKey] || DEFAULT_TOLL_RATES.highways.N5;
    const perPlaza = hwRate.per_plaza_rate[vehicleClass] || 60;
    const hwToll = route.plazas * perPlaza;
    baseTollRaw += hwToll;
    segmentsList.push({
      nameEn: `${hwRate.name || 'GT Road / N-5'} (${route.plazas} Toll Plazas)`,
      nameUr: `جی ٹی روڈ این 5 (${route.plazas} ٹول پلازے)`,
      code: 'N5',
      plazas: route.plazas,
      toll: Math.round(hwToll)
    });
  }

  // Motorway Segments calculation
  if (route.segments && route.segments.length > 0) {
    for (const seg of route.segments) {
      totalKm += seg.km;
      let segmentToll = 0;

      if (seg.code === 'M2') {
        // M2 Per-KM pricing
        const m2Rate = rates.motorways?.M2 || DEFAULT_TOLL_RATES.motorways.M2;
        const perKm = m2Rate.per_km_rate[vehicleClass] || 3.98;
        segmentToll = seg.km * perKm;
      } else {
        // M1, M3, M4, M5 Pro-rated full-route pricing
        const mwKey = seg.code as 'M1' | 'M3' | 'M4' | 'M5';
        const mwRate = rates.motorways?.[mwKey] || DEFAULT_TOLL_RATES.motorways[mwKey];
        const fullRate = mwRate.rates[vehicleClass] || 1000;
        const totalMwKm = mwRate.total_km || 100;
        segmentToll = (seg.km / totalMwKm) * fullRate;
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
  const surcharge = hasMtag ? 0 : Math.round(baseToll * 0.5);
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
    vehicleClass
  };
}

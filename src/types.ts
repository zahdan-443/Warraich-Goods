export type Language = 'en' | 'ur';
export type FuelType = 'diesel' | 'petrol' | 'cng';
export type ActiveTab = 'home' | 'calculator' | 'vehicle' | 'drivers' | 'routes' | 'fuel' | 'verify' | 'bilty' | 'vehicleAccount';
export type CalcSubTab = 'calc' | 'history' | 'summary';

export interface CustomExpense {
  id: string;
  label: string;
  amount: number;
}

export interface FreightIncome {
  id: string;
  label: string;
  amount: number;
}

export interface VehicleExpenseRecord {
  id: number;
  date: string;
  vehicleNo: string;
  incomes?: FreightIncome[];
  totalIncome?: number;
  netProfit?: number;
  diesel: number;
  toll: number;
  challan: number;
  rotiKharcha: number;
  chowkidara: number;
  gariKaam: number;
  driverCommission: number;
  customExpenses: CustomExpense[];
  total: number;
  notes?: string;
}

export interface Trip {
  id: number;
  name: string;
  fuelType: string;
  fuelTypeRaw: FuelType;
  dist: number;
  consumed: string;
  fuelCost: number;
  toll: number;
  loading: number;
  driver: number;
  other: number;
  total: number;
  totalIncome?: number;
  netProfit?: number;
  incomes?: FreightIncome[];
  isReturn: boolean;
  date: string;
  time: string;
  month: string;
}

export interface Vehicle {
  id: number;
  reg: string;
  model: string;
  mileage: number;
  owner: string;
  capacity: number;
}

export interface Driver {
  id: number;
  name: string;
  phone: string;
  license: string;
  lictype: string;
  cnic: string;
}

export interface RoutePreset {
  id: number;
  from: string;
  to: string;
  dist: number;
  toll: number;
}

export interface FuelLogItem {
  id: number;
  date: string;
  diesel?: number;
  petrol?: number;
  cng?: number;
}

export interface BiltyRecord {
  id: number;
  biltyNo: string;
  vehicleNo: string;
  date: string;
  driverName: string;
  mobileNo: string;
  sendingCity: string;
  receivingCity: string;
  senderName: string;
  senderMobile: string;
  receiverName: string;
  receiverMobile: string;
  senderCnic: string;
  qty: string;
  itemDescription: string;
  weight: string;
  total: number;
  advance: number;
  payable: number;
  consignor?: string;
  consignee?: string;
  receivedBy?: string;
}

export type UserRole = 'owner' | 'driver' | 'accountant';

export interface CompanyProfile {
  nameUr: string;
  nameEn: string;
  ownerName: string;
  phoneNumbers: string;
  headOfficeUr: string;
  headOfficeEn: string;
  ntn: string;
  taglineUr: string;
  logoUrl?: string;
  updatedAt?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  uid: string;
  email: string;
  action: string;
  details: string;
  category?: 'auth' | 'bilty' | 'settings' | 'fleet' | 'export';
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  lastLogin?: string;
  isBiltyAuthorized?: boolean;
}

export interface ContactItem {
  name: string;
  phone: string;
  type: 'Customer' | 'Driver';
  lastUsed: string;
}

export interface OfflineAction {
  id: number;
  type: 'trip' | 'vehicle' | 'driver' | 'fuel';
  data: any;
  timestamp: string;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  time: string;
  unread: boolean;
  type: 'fuel' | 'fleet' | 'tax' | 'system';
}

export type TollCity = 
  | 'Karachi'
  | 'Sukkur'
  | 'Rahim Yar Khan'
  | 'Multan'
  | 'Samundri'
  | 'Faisalabad'
  | 'Lahore'
  | 'Gujranwala'
  | 'Rawalpindi'
  | 'Peshawar';

export type TollVehicleClass = 'car' | 'wagon' | 'bus' | 'truck' | 'articulated';

export interface MotorwayRate {
  name: string;
  total_km: number;
  rates: {
    car: number;
    wagon: number;
    bus: number;
    truck: number;
    articulated: number;
  };
}

export interface M2Rate {
  name: string;
  total_km: number;
  per_km_rate: {
    car: number;
    wagon: number;
    bus: number;
    truck: number;
    articulated: number;
  };
}

export interface HighwayRate {
  name: string;
  per_plaza_rate: {
    car: number;
    wagon: number;
    bus: number;
    truck: number;
    articulated: number;
  };
}

export interface TollRatesConfig {
  motorways: {
    M1: MotorwayRate;
    M2: M2Rate;
    M3: MotorwayRate;
    M4: MotorwayRate;
    M5: MotorwayRate;
  };
  highways: {
    N5: HighwayRate;
  };
  updatedAt?: string;
  updatedBy?: string;
}

export interface MotorwaySegment {
  code: 'M1' | 'M2' | 'M3' | 'M4' | 'M5';
  nameEn: string;
  nameUr: string;
  km: number;
}

export interface RouteDefinition {
  nameEn: string;
  nameUr: string;
  routeType: 'motorway' | 'highway' | 'mixed';
  plazas?: number;
  highwayCode?: string;
  segments?: MotorwaySegment[];
}

export const DICTIONARY = {
  en: {
    appTitle: "Warraich",
    appTitleHighlight: "Goods",
    appSub: "Road Freight Toolkit",
    nav: {
      home: "Dashboard",
      calculator: "Trip Cost",
      vehicle: "Vehicles",
      drivers: "Drivers",
      routes: "Routes",
      fuel: "Fuel Log",
      verify: "Gov Verify",
      bilty: "Bilty"
    },
    heroTitle: "Built for Punjab Road Freight",
    heroHighlight: "Safar",
    heroDesc: "Trip calculations, driver directories, fleet profiles, preset routes & Punjab Government verification portals — beautifully orchestrated.",
    stats: {
      trips: "Trips Logged",
      vehicles: "Active Fleet",
      drivers: "Registered Drivers"
    },
    quickAccess: "Quick Operations",
    recentTrips: "Recent Safar Logs",
    noTrips: "No trip records saved yet. Launch the Trip Cost calculator to estimate freight expenses.",
    calc: {
      title: "Trip Cost Estimator",
      calculateTab: "Estimate",
      historyTab: "Safar History",
      summaryTab: "Analytics",
      fuelDetails: "Fuel Parameters",
      fuelPrice: "Fuel Price (PKR / L)",
      mileage: "Expected Mileage (km / L)",
      distance: "Route Distance (km)",
      routeExtras: "Freight Add-ons",
      toll: "Toll & Motorway (PKR)",
      loading: "Loading / Unloading Labor",
      driverAllowance: "Driver Kharcha / Allowance",
      otherCosts: "Miscellaneous Challan / Repair",
      returnTrip: "Round Trip (Return)",
      returnTripSub: "Automatically doubles route distance",
      calcBtn: "Calculate Total Freight Cost",
      resetBtn: "Reset Fields",
      breakdown: "Expense Breakdown",
      fuelUsed: "Est. Consumption",
      totalCost: "Total Freight Cost",
      saveTrip: "Record to Diary",
      whatsappShare: "Share via WhatsApp",
      emptyHistory: "No saved trip logs found in your diary.",
      clearAll: "Erase All Records",
      monthlySummary: "Monthly Overview",
      totalKM: "Total Distance",
      totalSpent: "Total Expenditure",
      avgPerTrip: "Average Freight Cost",
      last6Months: "Recent Expenditure Trend"
    },
    fleet: {
      title: "Fleet Directory",
      addBtn: "Add New Vehicle",
      empty: "No trucks or trailers registered in your active fleet.",
      regNo: "Registration No. (e.g. LHR-7860)",
      model: "Make / Model (e.g. Hino 500 Master)",
      mileage: "Avg Mileage (km / L)",
      owner: "Owner Name",
      capacity: "Payload Capacity (Tons)",
      useMileage: "Apply Mileage"
    },
    drivers: {
      title: "Driver Directory",
      addBtn: "Register Driver",
      empty: "No driver profiles added to directory.",
      fullName: "Full Name",
      phone: "WhatsApp / Phone",
      licenseNo: "DLIMS License No.",
      licenseType: "License Category",
      cnic: "CNIC No.",
      callBtn: "WhatsApp"
    },
    routes: {
      title: "Preset Freight Routes",
      addBtn: "New Preset Route",
      subtitle: "Tap any saved corridor to instantly populate calculator metrics",
      empty: "No preset freight corridors saved.",
      from: "Origin City",
      to: "Destination City",
      distance: "Corridor Length (km)",
      toll: "Average Toll (PKR)",
      applyBtn: "Load Route"
    },
    fuel: {
      title: "Fuel Price Tracker",
      logTitle: "Log Today's Market Rate",
      saveBtn: "Update Market Rates",
      trendTitle: "Historic Price Diary",
      empty: "No market rates logged yet."
    },
    verify: {
      title: "Government Verification Portals",
      subtitle: "Direct access to official Excise, DLIMS, and Safe City portals",
      officialBadge: "Official Gov Portal",
      openBtn: "Launch Portal",
      mtmis: {
        title: "Vehicle Tax & Ownership",
        sub: "Excise & Taxation Punjab (MTMIS)",
        s1: "Launch the official MTMIS Punjab web portal",
        s2: "Input complete vehicle registration alphanumeric plate",
        s3: "Verify token tax clearance, owner identity, and chassis status"
      },
      dlims: {
        title: "Driving License Status",
        sub: "DLIMS Punjab Police",
        s1: "Open the DLIMS Punjab license verification page",
        s2: "Provide driver CNIC or driving license serial number",
        s3: "Check license expiry date and authorized vehicle categories (HTV/LTV)"
      },
      challan: {
        title: "E-Challan & Camera Violations",
        sub: "Punjab Safe Cities Authority (PSCA)",
        s1: "Access PSCA E-Challan official portal",
        s2: "Enter vehicle number plate or owner CNIC",
        s3: "Review pending traffic citations and generate payment PSID"
      }
    },
    modals: {
      saveTripTitle: "Record Safar to Diary",
      tripNameLbl: "Safar Identifier",
      tripNamePlace: "e.g. Faisalabad to Rawalpindi Wheat",
      cancel: "Discard",
      confirm: "Save Record"
    },
    bilty: {
      title: "Bilty Generator",
      subtitle: "Create and manage freight receipts with QR verification",
      createTab: "Create Bilty",
      searchTab: "Search Bilty",
      biltyNo: "Bilty No",
      vehicleNo: "Vehicle No",
      date: "Date",
      driverName: "Driver Name",
      mobileNo: "Mobile No",
      sendingCity: "Origin City (From)",
      receivingCity: "Destination City (To)",
      senderName: "Sender Name (Consignor)",
      senderMobile: "Sender Mobile",
      receiverName: "Receiver Name (Consignee)",
      receiverMobile: "Receiver Mobile",
      senderCnic: "CNIC No.",
      consignor: "Consignor (Sender)",
      consignee: "Consignee (Receiver)",
      receivedBy: "Received By",
      qty: "Qty",
      itemDescription: "Item Description",
      weight: "Weight (KG)",
      total: "Total Fare (Rs)",
      advance: "Advance Fare (Rs)",
      payable: "Remaining Fare (Rs)",
      generateBtn: "Generate Bilty",
      downloadBtn: "Download PDF",
      searchPlaceholder: "Enter Bilty No (AH-0001)",
      searchBtn: "Search",
      noResult: "No bilty found with this number.",
      empty: "No bilty records saved yet.",
      preview: "Bilty Receipt",
      terms: "Goods carried entirely at owner's risk. Company not responsible for loss due to natural calamities, fire, riots, or acts beyond control. Freight must be paid before unloading. Do not hand over goods without original bilty.",
      idCardNo: "ID Card No",
      driverSign: "Driver Signature",
      noGoodsWithoutBilty: "Do not release goods without Bilty",
      pdfNote: "This is a computer generated bilty receipt."
    },
    tollCalc: {
      title: "Motorway & Highway Toll Calculator",
      subtitle: "Estimate NHA toll tax, motorway segments, and M-Tag charges across Pakistan",
      fromCity: "Origin City (From)",
      toCity: "Destination City (To)",
      vehicleClass: "Vehicle Class",
      activeMtag: "Active M-Tag Account",
      mtagSub: "M-Tag users avoid the 50% non-electronic toll surcharge",
      calcBtn: "Get Toll Estimate",
      sameCityError: "Start and destination cities cannot be identical",
      routeName: "Travel Corridor",
      baseToll: "Base Toll",
      surcharge: "Non-M-Tag Surcharge",
      totalToll: "Total Required Amount",
      rateSource: "NHA Tariff Database",
      onlineLive: "Live Firestore Rates",
      offlineCached: "Offline Cached Rates",
      segments: "Motorway Segments & Toll Plazas",
      approxNote: "Toll amounts are based on NHA tariffs (revised 2026). Rates can be adjusted by the Owner in the Control Panel.",
      applyToTrip: "Apply to Trip Calculator",
      copied: "Toll breakdown copied to clipboard!"
    }
  },
  ur: {
    appTitle: "وڑائچ",
    appTitleHighlight: "گڈز",
    appSub: "روڈ فریٹ ٹول کٹ",
    nav: {
      home: "ڈیش بورڈ",
      calculator: "سفر خرچ",
      vehicle: "گاڑیاں",
      drivers: "ڈرائیور",
      routes: "راستے",
      fuel: "ایندھن لاگ",
      verify: "تصدیق",
      bilty: "بلٹی"
    },
    heroTitle: "پنجاب کے ٹرانسپورٹرز کے لیے",
    heroHighlight: "سفر",
    heroDesc: "سفر کے اخراجات کا حساب، ڈرائیور ڈائریکٹری، فلیٹ پروفائلز، راستے اور پنجاب حکومت کے تصدیقی پورٹلز — ایک خوبصورت انداز میں۔",
    stats: {
      trips: "محفوظ سفر",
      vehicles: "فعال گاڑیاں",
      drivers: "رجسٹرڈ ڈرائیور"
    },
    quickAccess: "فوری رسائی",
    recentTrips: "حالیہ سفر کا ریکارڈ",
    noTrips: "ابھی کوئی سفر محفوظ نہیں۔ سفر خرچ کیلکولیٹر استعمال کریں۔",
    calc: {
      title: "سفر خرچ کیلکولیٹر",
      calculateTab: "حساب کریں",
      historyTab: "ریکارڈ",
      summaryTab: "تجزیہ",
      fuelDetails: "ایندھن کی تفصیل",
      fuelPrice: "ایندھن قیمت (روپے / لیٹر)",
      mileage: "مائلیج (کلومیٹر / لیٹر)",
      distance: "سفر کا فاصلہ (کلومیٹر)",
      routeExtras: "اضافی اخراجات",
      toll: "ٹول اور موٹروے ٹیکس (روپے)",
      loading: "لوڈنگ / ان لوڈنگ مزدوری",
      driverAllowance: "ڈرائیور الاؤنس / خرچہ",
      otherCosts: "دیگر اخراجات / مرمت",
      returnTrip: "واپسی کا سفر (دوگنا)",
      returnTripSub: "فاصلہ خودکار طور پر دوگنا ہو جائے گا",
      calcBtn: "کل اخراجات کا حساب کریں",
      resetBtn: "دوبارہ شروع کریں",
      breakdown: "خرچ کی تفصیل",
      fuelUsed: "ایندھن کا استعمال",
      totalCost: "کل سفر خرچ",
      saveTrip: "ڈائری میں محفوظ کریں",
      whatsappShare: "واٹس ایپ پر بھیجیں",
      emptyHistory: "آپ کی ڈائری میں کوئی محفوظ سفر نہیں ملا۔",
      clearAll: "تمام ریکارڈ حذف کریں",
      monthlySummary: "ماہانہ جائزہ",
      totalKM: "کل فاصلہ",
      totalSpent: "کل خرچ",
      avgPerTrip: "فی سفر اوسط خرچ",
      last6Months: "گزشتہ 6 ماہ کا رجحان"
    },
    fleet: {
      title: "گاڑیوں کا ریکارڈ",
      addBtn: "نئی گاڑی شامل کریں",
      empty: "آپ کے فلیٹ میں کوئی گاڑی درج نہیں۔",
      regNo: "رجسٹریشن نمبر (مثلاً LHR-7860)",
      model: "گاڑی کی قسم / ماڈل (مثلاً Hino 500)",
      mileage: "اوسط مائلیج (کلومیٹر / لیٹر)",
      owner: "مالک کا نام",
      capacity: "وزن اٹھانے کی گنجائش (ٹن)",
      useMileage: "مائلیج لگائیں"
    },
    drivers: {
      title: "ڈرائیور ڈائریکٹری",
      addBtn: "ڈرائیور درج کریں",
      empty: "ڈائریکٹری میں کوئی ڈرائیور شامل نہیں۔",
      fullName: "پورا نام",
      phone: "واٹس ایپ / فون نمبر",
      licenseNo: "لائسنس نمبر",
      licenseType: "لائسنس کی قسم",
      cnic: "شناختی کارڈ نمبر",
      callBtn: "واٹس ایپ"
    },
    routes: {
      title: "محفوظ راستے",
      addBtn: "نیا راستہ شامل کریں",
      subtitle: "کسی بھی راستے پر کلک کریں تو فاصلہ اور ٹول خودکار بھر جائے گا",
      empty: "کوئی محفوظ راستہ موجود نہیں۔",
      from: "روانگی کا شہر",
      to: "منزل کا شہر",
      distance: "فاصلہ (کلومیٹر)",
      toll: "اوسط ٹول ٹیکس (روپے)",
      applyBtn: "راستہ لوڈ کریں"
    },
    fuel: {
      title: "ایندھن قیمت ٹریکر",
      logTitle: "آج کا مارکیٹ ریٹ درج کریں",
      saveBtn: "ریٹ محفوظ کریں",
      trendTitle: "قیمتوں کی تاریخ",
      empty: "کوئی ریٹ محفوظ نہیں کیا گیا۔"
    },
    verify: {
      title: "سرکاری تصدیقی پورٹلز",
      subtitle: "ایکسائز، ڈرائیونگ لائسنس اور سیف سٹی پورٹلز تک براہ راست رسائی",
      officialBadge: "سرکاری پورٹل",
      openBtn: "پورٹل کھولیں",
      mtmis: {
        title: "گاڑی کی ملکیت اور ٹیکس تصدیق",
        sub: "محکمہ ایکسائز اینڈ ٹیکسیشن پنجاب (MTMIS)",
        s1: "MTMIS پنجاب کا سرکاری ویب پورٹل کھولیں",
        s2: "گاڑی کا مکمل رجسٹریشن نمبر درج کریں",
        s3: "ٹوکن ٹیکس، مالک کا نام اور چیسس نمبر تصدیق کریں"
      },
      dlims: {
        title: "ڈرائیونگ لائسنس کی تصدیق",
        sub: "DLIMS پنجاب پولیس",
        s1: "DLIMS پنجاب کی ویب سائٹ کھولیں",
        s2: "ڈرائیور کا شناختی کارڈ یا لائسنس نمبر درج کریں",
        s3: "لائسنس کی میعاد اور مجاز کیٹگری (HTV/LTV) چیک کریں"
      },
      challan: {
        title: "ای چالان اور کیمرہ خلاف ورزی",
        sub: "پنجاب سیف سٹیز اتھارٹی (PSCA)",
        s1: "PSCA ای چالان پورٹل پر جائیں",
        s2: "گاڑی کا نمبر یا مالک کا شناختی کارڈ لکھیں",
        s3: "باقی چالان دیکھیں اور ادائیگی کے لیے PSID حاصل کریں"
      }
    },
    modals: {
      saveTripTitle: "سفر ڈائری میں محفوظ کریں",
      tripNameLbl: "سفر کا نام / پہچان",
      tripNamePlace: "مثلاً لاہور سے کراچی (چاول)",
      cancel: "منسوخ",
      confirm: "محفوظ کریں"
    },
    bilty: {
      title: "بلٹی جنریٹر",
      subtitle: "QR تصدیق کے ساتھ بلٹی رسیدیں بنائیں اور محفوظ کریں",
      createTab: "نئی بلٹی",
      searchTab: "بلٹی تلاش کریں",
      biltyNo: "بلٹی نمبر",
      vehicleNo: "گاڑی نمبر",
      date: "تاریخ",
      driverName: "ڈرائیور کا نام",
      mobileNo: "ڈرائیور موبائل",
      sendingCity: "روانگی شہر (از)",
      receivingCity: "منزل شہر (تا)",
      senderName: "بھیجنے والے کا نام",
      senderMobile: "بھیجنے والے کا موبائل",
      receiverName: "وصول کنندہ کا نام",
      receiverMobile: "وصول کنندہ کا موبائل",
      senderCnic: "شناختی کارڈ نمبر (CNIC)",
      consignor: "بھیجنے والا",
      consignee: "وصول کنندہ",
      receivedBy: "لینے والا",
      qty: "تعداد",
      itemDescription: "تفصیل مال",
      weight: "وزن (کلوگرام)",
      total: "کل کرایہ (روپے)",
      advance: "پیشگی کرایہ (روپے)",
      payable: "باقی کرایہ (روپے)",
      generateBtn: "بلٹی بنائیں",
      downloadBtn: "PDF ڈاؤن لوڈ کریں",
      searchPlaceholder: "بلٹی نمبر درج کریں (AH-0001)",
      searchBtn: "تلاش کریں",
      noResult: "اس نمبر کی کوئی بلٹی نہیں ملی۔",
      empty: "ابھی کوئی بلٹی محفوظ نہیں۔",
      preview: "بلٹی رسید",
      terms: "شرائط و ضوابط مطابق کاغذ بلٹی",
      termsHeading: "شرائط و ضوابط",
      companyTitle: "وڑائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)",
      ownerName: "زاہدان نصر وڑائچ",
      ownerMobile1: "0300-5370443",
      ownerMobile2: "0339-5370443",
      termsList: [
        "بیوپاری کو چاہیے کہ مال وصول کرتے وقت اچھی طرح ملاحظہ کرے۔",
        "مال کو گاڑی میں بحفاظت لوڈ کرنے اور منزل پر ان لوڈ کرنے کی مکمل ذمہ داری اور لیبر کا خرچ متعلقہ پارٹی کا ہوگا۔",
        "فل ٹرک لوڈ کی صورت میں اگر روانگی کے وقت لگائی گئی سیل یا ترپال منزل پر درست حالت میں ہے، تو راستے میں مال کی کسی ڈیمیج کی کمپنی ذمہ دار نہ ہوگی۔",
        "انڈوں، تیل، گھی، مربہ جات و دیگر مال کے رسنے، ضائع ہونے یا لیک ہونے کی کمپنی ذمہ دار نہ ہوگی۔ محفوظ اور معیاری پیکنگ بھیجنے والے کی ذمہ داری ہے۔ راستے میں سڑک کی خرابی، جھٹکوں، اتفاقیہ حادثہ یا موسم (گرمی/ دھند) کی وجہ سے انڈوں یا دیگر سامان کی ٹوٹ پھوٹ یا خرابی کی ٹرانسپورٹ کمپنی ہرگز ذمہ دار نہیں ہوگی۔",
        "قدرتی آفات، دھند، ہڑتال، ٹریفک جام یا سڑک بند ہونے کی وجہ سے گاڑی لیٹ ہونے پر مال کے خراب ہونے یا مارکیٹ ریٹ گرنے کا ٹیم کلیم قبول نہیں کرے گی۔",
        "بلٹی پر لکھے گئے مال سے ہٹ کر کوئی غیر قانونی چیز نکلنے، یا مقررہ حد سے زیادہ وزن ہونے پر اضافی کرایہ، تمام تر قانونی ذمہ داری، جرمانہ (چالان) اور گاڑی بند ہونے کا نقصان بلنگ کروانے والی پارٹی ادا کرے گی۔",
        "منزل پر پہنچنے کے 24 گھنٹے کے اندر گاڑی خالی کرنا لازمی ہے۔ اس کے بعد روزانہ کے حساب سے ڈیمرج وصول کیا جائے گا۔",
        "جس مال کے ہمراہ بیوپاری یا اس کا نمائندہ خود موجود ہوگا، اس مال کے کسی قسم کے نقصان کی کمپنی ذمہ دار نہ ہوگی۔",
        "کسی بھی تنازعے یا کلیم کی صورت میں حتمی فیصلہ ٹرانسپورٹ کمپنی کے دفتر میں باہمی رضامندی سے طے کیا جائے گا۔"
      ],
      idCardNo: "شناختی کارڈ نمبر",
      driverSign: "دستخط ڈرائیور",
      clerkSign: "دستخط بلنگ کلرک",
      noGoodsWithoutBilty: "بغیر بلٹی مال ہرگز نہ دیں۔",
      overloadNote: "اورلوڈ، چالان، جرمانہ وخرچہ بدمعہ بیوپاری ہوگا",
      addressNote: "3 کلومیٹر مین رجانہ روڈ بالمقابل رائس پیلس، کمالیہ",
      pdfNote: "یہ کمپیوٹر سے تیار کردہ باضابطہ بلٹی سند ہے۔"
    },
    tollCalc: {
      title: "موٹروے و ہائی وے ٹول ٹیکس کیلکولیٹر",
      subtitle: "این ایچ اے کے مصدقہ ٹول ٹیکس، موٹروے روٹس اور ایم ٹیگ چارجز کا تخمینہ",
      fromCity: "روانگی کا شہر (از)",
      toCity: "منزل کا شہر (تا)",
      vehicleClass: "گاڑی کی کیٹگری",
      activeMtag: "فعال ایم ٹیگ (M-Tag)",
      mtagSub: "ایم ٹیگ گاڑیوں پر 50 فیصد اضافی نان ایم ٹیگ سرچارج لاگو نہیں ہوتا",
      calcBtn: "ٹول ٹیکس کا تخمینہ لگائیں",
      sameCityError: "شروع اور منزل ایک جیسی نہیں ہو سکتی",
      routeName: "سفری کوریڈور",
      baseToll: "بنیادی ٹول ٹیکس",
      surcharge: "نان ایم ٹیگ اضافی سرچارج",
      totalToll: "کل واجب الادا رقم",
      rateSource: "این ایچ اے ٹول شیڈول",
      onlineLive: "لائیو کلاؤڈ ریٹس",
      offlineCached: "آف لائن / پہلے سے محفوظ ریٹس",
      segments: "موٹروے کے حصے اور ٹول پلازے",
      approxNote: "ٹول کی رقوم این ایچ اے 2026ء کے نرخوں کے مطابق ہیں۔ اونر کنٹرول پینل سے کسی بھی وقت ریٹس تبدیل کیے جا سکتے ہیں۔",
      applyToTrip: "سفر خرچ کیلکولیٹر میں لگائیں",
      copied: "ٹول تفصیلات کاپی ہو گئیں!"
    }
  }
};

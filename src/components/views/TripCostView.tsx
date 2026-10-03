import React, { useState, useEffect } from 'react';
import { DICTIONARY, FuelType, Language, Trip, RoutePreset } from '../../types';
import { PublicImage } from '../../assets/dashboardIcons';
import { 
  Calculator, 
  RotateCcw, 
  Share2, 
  CheckCircle2, 
  BookmarkPlus, 
  FileDown, 
  ArrowLeft, 
  Navigation, 
  MapPin,
  Zap,
  Wallet,
  ArrowLeftRight,
  Clock,
  Info,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { fetchOSRMRouteDistance, PAKISTAN_CITIES } from '../../utils/mapRoutes';
import { getLogoBase64, sharePdfFileOrWhatsApp, escapeHtml, sanitizeHtml } from '../../utils/pdfHelper';
import { validateFinancialNumber, validateTripFinancials } from '../../utils/calculator';
import { getStoredFuelPrices, fetchLiveFuelPrices, FuelPricesData } from '../../utils/fuelPrice';
import { getRouteComparisonOptions, RouteComparisonResult, RouteOptionComparison } from '../../utils/routeComparison';
import { getStoredRoutes } from '../../utils/storage';

interface TripCostViewProps {
  lang: Language;
  trips: Trip[];
  routes?: RoutePreset[];
  onSaveTrip: (tripData: Omit<Trip, 'id' | 'name'>, tripName: string) => void;
  onDeleteTrip: (id: number) => void;
  onClearAllTrips: () => void;
  initialMileage?: number;
  onNavigate?: (tab: any) => void;
}

export const TripCostView: React.FC<TripCostViewProps> = ({
  lang,
  trips,
  routes,
  onSaveTrip,
  onDeleteTrip,
  onClearAllTrips,
  initialMileage,
  onNavigate
}) => {
  const isUrdu = lang === 'ur';

  // Screen View Mode: 'input' or 'result'
  const [viewMode, setViewMode] = useState<'input' | 'result'>('input');
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<boolean>(false);

  // Input States (Strict 1-box per line sequence)
  const initialFuel = getStoredFuelPrices();
  const [originCity, setOriginCity] = useState<string>('Samundri');
  const [destCity, setDestCity] = useState<string>('Lahore');
  const [distance, setDistance] = useState<string>('195');
  const [liveDieselBenchmark, setLiveDieselBenchmark] = useState<string>(initialFuel.diesel);
  const [fuelPrice, setFuelPrice] = useState<string>(initialFuel.diesel);
  const [mileage, setMileage] = useState<string>(initialMileage ? initialMileage.toString() : '7');
  const [combinedExpenses, setCombinedExpenses] = useState<string>('3200'); // Driver + Toll + Other
  const [isReturn, setIsReturn] = useState<boolean>(false);
  const [isRouteLoading, setIsRouteLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Feature B: Route Comparison States
  const [showRouteComparison, setShowRouteComparison] = useState<boolean>(false);
  const [comparisonResult, setComparisonResult] = useState<RouteComparisonResult | null>(null);
  const [isLoadingComparison, setIsLoadingComparison] = useState<boolean>(false);
  const [selectedComparisonRouteId, setSelectedComparisonRouteId] = useState<string | null>(null);

  // Result Calculation Object
  const [lastCalc, setLastCalc] = useState<Omit<Trip, 'id' | 'name'> & {
    origin?: string;
    dest?: string;
    fuelRateVal?: number;
    mileageVal?: number;
    combinedExpensesVal?: number;
  } | null>(null);

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Fetch fuel prices and toll calculator prefill
  useEffect(() => {
    fetchLiveFuelPrices(false).then((data) => {
      setLiveDieselBenchmark(data.diesel);
      setFuelPrice(prev => {
        const pNum = parseFloat(prev);
        if (!pNum || pNum < 340 || prev === '311.47') {
          return data.diesel;
        }
        return prev;
      });
    });

    const handleGlobalUpdate = (e: any) => {
      if (e.detail?.diesel) {
        setLiveDieselBenchmark(e.detail.diesel);
        setFuelPrice(prev => {
          const pNum = parseFloat(prev);
          if (!pNum || pNum < 340 || prev === '311.47') {
            return e.detail.diesel;
          }
          return prev;
        });
      }
    };

    window.addEventListener('fuelPricesUpdated', handleGlobalUpdate);
    return () => window.removeEventListener('fuelPricesUpdated', handleGlobalUpdate);
  }, []);

  useEffect(() => {

    try {
      const prefillStr = localStorage.getItem('ah-prefill-toll-calc');
      if (prefillStr) {
        const prefill = JSON.parse(prefillStr);
        if (prefill.tollAmount) {
          setCombinedExpenses(String(prefill.tollAmount));
        }
        if (prefill.fromCity) {
          const match = PAKISTAN_CITIES.find(
            c => c.nameEn.toLowerCase() === prefill.fromCity.toLowerCase() || 
                 c.nameUr === prefill.fromCity || 
                 prefill.fromCity.toLowerCase().includes(c.nameEn.toLowerCase()) || 
                 prefill.fromCity.includes(c.nameUr)
          );
          if (match) {
            setOriginCity(match.nameEn);
          }
        }
        if (prefill.toCity) {
          const match = PAKISTAN_CITIES.find(
            c => c.nameEn.toLowerCase() === prefill.toCity.toLowerCase() || 
                 c.nameUr === prefill.toCity || 
                 prefill.toCity.toLowerCase().includes(c.nameEn.toLowerCase()) || 
                 prefill.toCity.includes(c.nameUr)
          );
          if (match) {
            setDestCity(match.nameEn);
          }
        }
        localStorage.removeItem('ah-prefill-toll-calc');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (initialMileage !== undefined) {
      setMileage(initialMileage.toString());
    }
  }, [initialMileage]);

  // Auto-calculate distance using Free OpenStreetMap OSRM API whenever cities change
  useEffect(() => {
    let isMounted = true;
    if (originCity && destCity && originCity !== destCity) {
      setIsRouteLoading(true);
      fetchOSRMRouteDistance(originCity, destCity).then((distKm) => {
        if (isMounted && distKm !== null && distKm > 0) {
          setDistance(distKm.toString());
        }
        if (isMounted) setIsRouteLoading(false);
      });
    }
    return () => {
      isMounted = false;
    };
  }, [originCity, destCity]);

  // Feature B: Auto-fetch route comparison options when enabled or when cities/parameters change
  useEffect(() => {
    let isMounted = true;
    if (showRouteComparison && originCity && destCity && originCity !== destCity) {
      setIsLoadingComparison(true);
      const fPriceNum = parseFloat(fuelPrice) || 340;
      const mileageNum = parseFloat(mileage) || 7;
      const activeRoutes = routes && routes.length > 0 ? routes : getStoredRoutes();

      getRouteComparisonOptions({
        origin: originCity,
        dest: destCity,
        fuelPrice: fPriceNum,
        mileage: mileageNum,
        vehicleClass: 'truck',
        customRoutes: activeRoutes
      })
        .then((res) => {
          if (isMounted) {
            setComparisonResult(res);
            setIsLoadingComparison(false);
          }
        })
        .catch(() => {
          if (isMounted) setIsLoadingComparison(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [originCity, destCity, fuelPrice, mileage, showRouteComparison, routes]);

  const handleSelectRouteOption = (route: RouteOptionComparison) => {
    setSelectedComparisonRouteId(route.id);
    setDistance(route.distanceKm.toString());
    if (route.tollCost >= 0) {
      setCombinedExpenses(route.tollCost.toString());
    }
  };

  // Back button listener: Return from Result mode to Input mode
  useEffect(() => {
    const handleBackButton = (e: Event) => {
      if (viewMode === 'result') {
        e.preventDefault();
        setViewMode('input');
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {}
      }
    };
    window.addEventListener('app-back-button', handleBackButton);
    return () => window.removeEventListener('app-back-button', handleBackButton);
  }, [viewMode]);

  const formatCityDisplay = (cityName: string) => {
    const match = PAKISTAN_CITIES.find(
      c => c.nameEn.toLowerCase() === cityName.toLowerCase() || 
           c.nameUr === cityName || 
           (c.id && c.id.toLowerCase() === cityName.toLowerCase())
    );
    if (!match) return cityName;
    return isUrdu ? `${match.nameUr} (${match.nameEn})` : `${match.nameEn} (${match.nameUr})`;
  };

  // Calculate & Navigate to Dedicated Result Screen
  const handleCalculate = () => {
    const fuelVal = validateFinancialNumber(fuelPrice, 'Fuel Rate', { allowZero: false });
    const mileageVal = validateFinancialNumber(mileage, 'Mileage', { allowZero: false });
    const distVal = validateFinancialNumber(distance, 'Distance', { allowZero: false });
    const expVal = validateFinancialNumber(combinedExpenses, 'Other Expenses', { allowZero: true });

    if (!fuelVal.isValid || !mileageVal.isValid || !distVal.isValid || !expVal.isValid) {
      setError(
        isUrdu
          ? 'براہ کرم فیول ریٹ، ایوریج اور فاصلہ درست اور مثبت درج کریں۔'
          : fuelVal.error || mileageVal.error || distVal.error || expVal.error || 'Please enter valid positive numbers.'
      );
      return;
    }
    setError(null);
    setPdfError(null);

    const p = fuelVal.value;
    const m = mileageVal.value;
    const d = distVal.value;
    const exp = expVal.value;

    if (!m || m <= 0) return;

    const effDist = isReturn ? d * 2 : d;
    const consumedL = effDist / m;
    const fuelCostVal = consumedL * p;
    const totalCostVal = fuelCostVal + exp;

    const tripFinCheck = validateTripFinancials({
      dist: effDist,
      fuelCost: Math.round(fuelCostVal),
      toll: Math.round(exp),
      loading: 0,
      driver: 0,
      other: 0,
      total: Math.round(totalCostVal)
    });

    const calcObj = {
      fuelType: 'Diesel 🛢️',
      fuelTypeRaw: 'diesel' as FuelType,
      dist: effDist,
      consumed: consumedL.toFixed(2),
      fuelCost: Math.round(fuelCostVal),
      toll: Math.round(exp),
      loading: 0,
      driver: 0,
      other: 0,
      total: tripFinCheck.computedTotal,
      isReturn,
      date: new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
      month: new Date().toLocaleString('default', { month: 'short', year: '2-digit' }),
      origin: formatCityDisplay(originCity),
      dest: formatCityDisplay(destCity),
      fuelRateVal: p,
      mileageVal: m,
      combinedExpensesVal: exp
    };

    setLastCalc(calcObj);
    setSaveSuccess(false);
    setViewMode('result');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleReset = () => {
    setOriginCity('Samundri');
    setDestCity('Lahore');
    setDistance('195');
    setFuelPrice(liveDieselBenchmark);
    setMileage('7');
    setCombinedExpenses('3200');
    setIsReturn(false);
    setError(null);
    setPdfError(null);
    setLastCalc(null);
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {}
  };

  const handleSaveToDiary = () => {
    if (!lastCalc) return;
    const tripName = `${lastCalc.origin || 'سفر'} تا ${lastCalc.dest || 'منزل'}`;
    onSaveTrip(lastCalc, tripName);
    setSaveSuccess(true);
  };

  const generateTripCostPdf = async (): Promise<{ pdf: jsPDF; pdfBlob: Blob; fileName: string } | null> => {
    if (!lastCalc) return null;
    let container: HTMLDivElement | null = null;
    try {
      const logoDataUrl = await getLogoBase64();

      container = document.createElement('div');
      container.setAttribute('data-pdf-container', 'true');
      container.style.position = 'fixed';
      container.style.top = '0px';
      container.style.left = '0px';
      container.style.width = '794px';
      container.style.backgroundColor = '#ffffff';
      container.style.padding = '36px 40px';
      container.style.color = '#1f2937';
      container.style.fontFamily = "'Noto Nastaliq Urdu', 'Noto Sans Arabic', 'Segoe UI', Arial, sans-serif";
      container.style.direction = 'rtl';
      container.style.boxSizing = 'border-box';
      container.style.border = '3px solid #8b9d77';
      container.style.opacity = '0.01';
      container.style.zIndex = '-9999';

      const fmt = (n: number) => 'Rs ' + n.toLocaleString('en-US');

      const logoHtml = logoDataUrl
        ? `<img src="${logoDataUrl}" alt="Driver Dost Logistics Official Emblem" width="76" height="76" style="width: 76px; height: 76px; object-fit: contain; border-radius: 50%; border: 3px solid #c59b27; padding: 2px; background: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.08);" />`
        : `<div style="width: 76px; height: 76px; border-radius: 50%; border: 3px solid #c59b27; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.08); text-align: center;">
            <span style="font-size: 24px; line-height: 1;">🚚</span>
            <span style="font-size: 8px; font-weight: 900; color: #4a4a35; font-family: sans-serif; letter-spacing: 0.5px; margin-top: 2px;">DRIVER DOST</span>
          </div>`;

      const safeOrigin = escapeHtml(lastCalc.origin || '');
      const safeDest = escapeHtml(lastCalc.dest || '');
      const safeDist = escapeHtml(lastCalc.dist);
      const safeFuelRate = escapeHtml(lastCalc.fuelRateVal);
      const safeMileage = escapeHtml(lastCalc.mileageVal);
      const safeConsumed = escapeHtml(lastCalc.consumed);
      const safeDate = escapeHtml(lastCalc.date || new Date().toLocaleDateString('en-PK'));
      const safeTime = escapeHtml(lastCalc.time || new Date().toLocaleTimeString('en-PK'));

      container.innerHTML = sanitizeHtml(`
        <div style="border-bottom: 3px solid #8b9d77; padding-bottom: 16px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: flex-start; direction: rtl;">
          <div style="flex: 1; text-align: right;">
            <div style="margin: 0; font-size: 26px; color: #4a4a35; font-weight: 900; font-family: inherit;">ڈرائیور دوست - ٹرانسپورٹ و سفر ڈائری (Driver Dost)</div>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #8b9d77; font-weight: bold;">سفری کرایہ، فیول کھپت اور اخراجات کا تفصیلی تخمینہ (Trip Cost Summary)</p>
            
            <div style="margin-top: 10px; background: #fafaf5; border: 1.5px solid #e0e0d0; padding: 8px 14px; border-radius: 10px; font-size: 12px; line-height: 1.6; display: inline-block;">
              <div style="color: #275e23; font-weight: bold;">ڈرائیور دوست روڈ لاجسٹکس و روٹ سسٹم</div>
              <div style="direction: ltr; text-align: right; font-weight: 800; color: #222; font-family: sans-serif;">Smart Freight & Trip Logger Pakistan</div>
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; margin-right: 15px;">
            ${logoHtml}
            <div style="text-align: center; font-size: 11px; color: #555; font-family: sans-serif; direction: ltr;">
              <div><strong>Date:</strong> ${safeDate}</div>
            </div>
          </div>
        </div>

        <div style="background: #fdfbf7; border: 1.5px solid #ecece0; padding: 14px 18px; border-radius: 14px; margin-bottom: 22px; font-size: 15px; direction: rtl; text-align: right;">
          <div style="margin-bottom: 6px;">
            <strong style="color: #4a4a35;">از (روانگی):</strong> <span style="font-weight: bold; color: #222;">${safeOrigin}</span> 
            &nbsp; ➔ &nbsp; 
            <strong style="color: #4a4a35;">تا (منزل):</strong> <span style="font-weight: bold; color: #222;">${safeDest}</span>
          </div>
          <div style="font-size: 13px; color: #666;">
            <strong>کل روٹ فاصلہ:</strong> ${safeDist} کلومیٹر ${lastCalc.isReturn ? '(راؤنڈ ٹرپ دگنا فاصلہ)' : ''}
          </div>
        </div>

        <h2 style="font-size: 18px; color: #4a4a35; border-bottom: 2px solid #8b9d77; padding-bottom: 8px; margin-bottom: 16px; text-align: right;">
          📊 سفری اخراجات کی مکمل تفصیلات (Cost Breakdown)
        </h2>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 25px; direction: rtl;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 11px 8px; color: #4b5563; font-weight: bold; text-align: right;">ڈیزل ریٹ:</td>
            <td style="padding: 11px 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">PKR ${safeFuelRate} / Ltr</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 11px 8px; color: #4b5563; font-weight: bold; text-align: right;">گاڑی کی ایوریج:</td>
            <td style="padding: 11px 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${safeMileage} KM / Ltr</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 11px 8px; color: #4b5563; font-weight: bold; text-align: right;">ڈیزل کھپت (Fuel Consumed):</td>
            <td style="padding: 11px 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${safeConsumed} Liters</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 11px 8px; color: #4b5563; font-weight: bold; text-align: right;">ڈیزل کا کل خرچہ:</td>
            <td style="padding: 11px 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${fmt(lastCalc.fuelCost)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 11px 8px; color: #4b5563; font-weight: bold; text-align: right;">ڈرائیور، ٹول پلازہ و دیگر سفری اخراجات:</td>
            <td style="padding: 11px 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${fmt(lastCalc.combinedExpensesVal || 0)}</td>
          </tr>
        </table>

        <div style="background: #8b9d77; color: #ffffff; border-radius: 16px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; direction: rtl;">
          <div style="font-size: 18px; font-weight: bold; text-align: right;">کل متوقع سفری خرچہ (Total Freight Cost):</div>
          <div style="font-size: 28px; font-weight: 900; font-family: sans-serif; direction: ltr;">PKR ${lastCalc.total.toLocaleString('en-US')}</div>
        </div>

        <div style="border-top: 1.5px solid #d1d5db; padding-top: 16px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; color: #6b7280; line-height: 1.6; direction: rtl;">
          <div style="text-align: right;">
            <div style="font-weight: bold; color: #374151;">ڈرائیور دوست - روڈ لاجسٹکس و فلیٹ سسٹم</div>
            <div style="font-style: italic;">یہ کمپیوٹر سے تیار کردہ تصدیق شدہ سفری رسید ہے۔</div>
          </div>
          <div style="text-align: left; direction: ltr; font-family: sans-serif; font-size: 11px;">
            <div><strong>Verified By:</strong> Driver Dost System</div>
            <div><strong>Time:</strong> ${safeTime}</div>
          </div>
        </div>
      `);

      document.body.appendChild(container);

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        windowWidth: 1024,
        windowHeight: 1200,
        onclone: (clonedDoc) => {
          clonedDoc.documentElement.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.backgroundColor = '#ffffff';
          const clonedEl = clonedDoc.querySelector('[data-pdf-container="true"]') as HTMLElement;
          if (clonedEl) {
            clonedEl.style.position = 'static';
            clonedEl.style.opacity = '1';
            clonedEl.style.visibility = 'visible';
            clonedEl.style.width = '794px';
            clonedEl.style.backgroundColor = '#ffffff';
          }
        }
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, Math.min(pdfHeight, 297), undefined, 'FAST');

      const fileName = `Driver_Dost_Trip_Cost_${Date.now()}.pdf`;
      const pdfBlob = pdf.output('blob');
      return { pdf, pdfBlob, fileName };
    } catch (err) {
      console.error('PDF export error:', err);
      return null;
    } finally {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };

  const buildWhatsAppMsg = () => {
    if (!lastCalc) return '';
    const fmt = (n: number) => 'Rs ' + (Number(n) || 0).toLocaleString();
    return `🚚 *وارائچ گڈز ٹرانسپورٹ کمپنی*\n` +
      `📋 *سفری لاگت اور اخراجات کا تخمینہ*\n` +
      `─────────────────────\n` +
      `📍 *روانگی (از):* ${lastCalc.origin}\n` +
      `🏁 *منزل (تا):* ${lastCalc.dest}\n` +
      `🛣️ *روٹ فاصلہ:* ${lastCalc.dist} KM ${lastCalc.isReturn ? '(راؤنڈ ٹرپ دگنا فاصلہ)' : ''}\n` +
      `⛽ *ڈیزل ریٹ:* Rs ${lastCalc.fuelRateVal} / Ltr (ایوریج: ${lastCalc.mileageVal} KM/L)\n` +
      `🛢️ *ڈیزل کھپت:* ${lastCalc.consumed} لٹر\n` +
      `💵 *ڈیزل کا کل خرچہ:* ${fmt(lastCalc.fuelCost)}\n` +
      `🛣️ *ٹول، ڈرائیور و دیگر اخراجات:* ${fmt(lastCalc.combinedExpensesVal || 0)}\n` +
      `─────────────────────\n` +
      `💰 *کل متوقع سفری اخراجات:* ${fmt(lastCalc.total)}\n` +
      `📅 *تاریخ:* ${lastCalc.date || new Date().toLocaleDateString('ur-PK')}\n` +
      `─────────────────────\n` +
      `📱 *ڈرائیور دوست — سمارٹ ٹرانسپورٹ سسٹم*`;
  };

  const handleQuickWhatsAppText = () => {
    const msg = buildWhatsAppMsg();
    if (!msg) return;
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(msg);
      }
    } catch {}

    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 3000);

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    try {
      window.open(url, '_blank');
    } catch {
      window.location.href = url;
    }
  };

  const handleWhatsAppShare = async () => {
    if (!lastCalc) return;
    const msg = buildWhatsAppMsg();

    try {
      const result = await generateTripCostPdf();
      if (result) {
        await sharePdfFileOrWhatsApp({
          pdfBlob: result.pdfBlob,
          fileName: result.fileName,
          title: `سفر خرچہ رپورٹ - ${lastCalc.origin} تا ${lastCalc.dest}`,
          textSummary: msg,
        });
        return;
      }
    } catch (e) {
      console.warn('Trip PDF share fallback:', e);
    }

    try {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
    } catch {
      window.location.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`;
    }
  };

  const handleExportPDF = async () => {
    if (!lastCalc || isExportingPdf) return;
    setIsExportingPdf(true);
    setPdfError(null);
    try {
      const result = await generateTripCostPdf();
      if (result) {
        result.pdf.save(result.fileName);
      } else {
        setPdfError(isUrdu ? 'پی ڈی ایف بنانے میں مسئلہ آیا، دوبارہ کوشش کریں۔' : 'Could not generate PDF receipt. Please retry.');
      }
    } catch (err) {
      console.error('PDF export error:', err);
      setPdfError(isUrdu ? 'پی ڈی ایف بنانے میں مسئلہ آیا، دوبارہ کوشش کریں۔' : 'Failed to generate PDF receipt.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // RENDER SCREEN 1: INPUT FORM (Smooth Scrollable, Generous Spacing & High Visibility)
  // ════════════════════════════════════════════════════════════
  if (viewMode === 'input') {
    return (
      <div 
        className={`w-full max-w-xl mx-auto flex flex-col p-3.5 sm:p-6 pb-48 sm:pb-40 md:pb-20 font-sans ${isUrdu ? 'dir-rtl' : 'dir-ltr'}`} 
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        {/* Top Header with Trip Icon */}
        <div className="w-full flex items-center justify-between pb-3 shrink-0 border-b border-[#e0e0d2]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white border border-[#ecece0] p-0.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              <PublicImage
                fileName="trip-icon.png"
                alt="Trip Expense and Freight Calculation Tool"
                width={40}
                height={40}
                className="w-full h-full object-cover rounded-xl"
                fallbackIcon={<Calculator className="w-5 h-5 text-[#8b9d77]" />}
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-[#4a4a35] leading-tight">
                {isUrdu ? 'سفر اخراجات کیلکولیٹر' : 'Trip Expense Calculator'}
              </h1>
              <p className="text-[11px] text-[#8e8e75]">
                {isUrdu ? 'کرایہ، ڈیزل و اخراجات کا تخمینہ' : 'Freight, Fuel & Expense Estimate'}
              </p>
            </div>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="p-2 bg-white border border-[#ecece0] hover:bg-[#eaeae0] text-[#4a4a35] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <ArrowLeft className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
              <span>{isUrdu ? 'ڈیش بورڈ' : 'Dashboard'}</span>
            </button>
          )}
        </div>

        {/* 7 Inputs - Smooth scrollable sequence with generous spacing */}
        <div className="w-full flex-1 flex flex-col space-y-3 sm:space-y-3.5 py-4">
          
          {/* Field 1: Origin City / از (روانگی - ڈراپ ڈاؤن) */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex flex-col justify-center">
            <label className="block text-xs sm:text-sm font-black text-[#383827] mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#8b9d77]" />
              <span>{isUrdu ? 'از (روانگی - ڈراپ ڈاؤن)' : 'From City (Origin)'}</span>
            </label>
            <select
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-sm sm:text-base font-black text-[#2b2b1f] focus:border-[#8b9d77] focus:outline-none cursor-pointer shadow-2xs"
            >
              {PAKISTAN_CITIES.map((c) => (
                <option key={c.nameEn} value={c.nameEn}>
                  {isUrdu ? `${c.nameUr} (${c.nameEn})` : `${c.nameEn} (${c.nameUr})`}
                </option>
              ))}
            </select>
          </div>

          {/* Field 2: Destination City / تا (منزل - ڈراپ ڈاؤن) */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex flex-col justify-center">
            <label className="block text-xs sm:text-sm font-black text-[#383827] mb-1.5 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-[#8b9d77]" />
              <span>{isUrdu ? 'تا (منزل - ڈراپ ڈاؤن)' : 'To City (Destination)'}</span>
            </label>
            <select
              value={destCity}
              onChange={(e) => setDestCity(e.target.value)}
              className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-2 text-sm sm:text-base font-black text-[#2b2b1f] focus:border-[#8b9d77] focus:outline-none cursor-pointer shadow-2xs"
            >
              {PAKISTAN_CITIES.map((c) => (
                <option key={c.nameEn} value={c.nameEn}>
                  {isUrdu ? `${c.nameUr} (${c.nameEn})` : `${c.nameEn} (${c.nameUr})`}
                </option>
              ))}
            </select>
          </div>

          {/* FEATURE B: Cheapest vs Fastest Route Comparison Toggle & Cards */}
          <div className="bg-[#fdfbf7] p-3 sm:p-3.5 rounded-2xl border border-[#ecece0] shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[#8b9d77]/20 flex items-center justify-center text-[#4a5e38]">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#4a4a35]">
                    {isUrdu ? 'روٹ موازنہ (کم خرچ بمقابلہ تیز ترین)' : 'Route Comparison (Cheapest vs Fastest)'}
                  </h3>
                  <p className="text-[10px] text-[#8e8e75]">
                    {isUrdu ? 'ٹول ٹیکس، فاصلہ و فیول لاگت کا موازنہ' : 'Compare toll, distance & fuel trade-off'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowRouteComparison(!showRouteComparison)}
                className={`px-3.5 py-2 min-h-[40px] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 ${
                  showRouteComparison
                    ? 'bg-[#4a5e38] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-[#4a4a35] border border-[#d5d5c5]'
                }`}
              >
                <span>{showRouteComparison ? (isUrdu ? 'موازنہ فعال' : 'Active') : (isUrdu ? 'موازنہ دیکھیں' : 'Compare Routes')}</span>
                {showRouteComparison ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Expanded Route Comparison Cards */}
            {showRouteComparison && (
              <div className="space-y-3 pt-2 border-t border-[#ecece0] animate-in fade-in duration-150">
                {isLoadingComparison ? (
                  <div className="py-6 text-center text-xs text-[#8e8e75] font-bold animate-pulse flex items-center justify-center gap-2">
                    <Clock className="w-4 h-4 text-[#8b9d77]" />
                    <span>{isUrdu ? 'روٹس اور لاگت کا موازنہ کیا جا رہا ہے...' : 'Analyzing route trade-offs & toll matrix...'}</span>
                  </div>
                ) : comparisonResult && comparisonResult.hasMultipleRoutes ? (
                  /* Multiple Viable Routes: Side-by-Side Cards (Fastest vs Cheapest) */
                  <div className="space-y-2">
                    <p className="text-[11px] text-[#5a5a40]">
                      {isUrdu
                        ? 'نیچے دیے گئے کارڈ پر کلک کریں تاکہ وہ فاصلہ اور ٹول کیلکولیٹر میں لاگو ہو سکے:'
                        : 'Tap a route card to apply its distance and toll to the calculator:'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Fastest Route Card */}
                      {comparisonResult.fastestRoute && (
                        <div
                          onClick={() => handleSelectRouteOption(comparisonResult.fastestRoute!)}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                            selectedComparisonRouteId === comparisonResult.fastestRoute.id
                              ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                              : 'bg-white border-[#d5d5c5] hover:border-[#8b9d77]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-600" />
                                <span>{isUrdu ? 'تیز ترین روٹ' : 'Fastest Route'}</span>
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-700">
                                {isUrdu ? comparisonResult.fastestRoute.estimatedTimeFormattedUr : comparisonResult.fastestRoute.estimatedTimeFormattedEn}
                              </span>
                            </div>

                            <h4 className="font-bold text-xs text-[#2b2b1f] line-clamp-1">
                              {isUrdu ? comparisonResult.fastestRoute.nameUr : comparisonResult.fastestRoute.nameEn}
                            </h4>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 py-1.5 px-2 bg-[#fdfbf7] rounded-xl border border-[#ecece0] text-[11px]">
                            <div>
                              <span className="text-[10px] text-[#8e8e75] block">{isUrdu ? 'فاصلہ' : 'Distance'}</span>
                              <span className="font-mono font-bold text-[#4a4a35]">{comparisonResult.fastestRoute.distanceKm} KM</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#8e8e75] block">{isUrdu ? 'ٹول ٹیکس' : 'Toll Cost'}</span>
                              <span className="font-mono font-bold text-[#4a4a35]">Rs {comparisonResult.fastestRoute.tollCost.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#8e8e75] block">{isUrdu ? 'ڈیزل لاگت' : 'Fuel Cost'}</span>
                              <span className="font-mono font-bold text-[#4a4a35]">Rs {comparisonResult.fastestRoute.fuelCost.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#8e8e75] block">{isUrdu ? 'کل لاگت' : 'Total Cost'}</span>
                              <span className="font-mono font-bold text-emerald-700">Rs {comparisonResult.fastestRoute.totalTripCost.toLocaleString()}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`w-full py-2 min-h-[38px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-98 cursor-pointer ${
                              selectedComparisonRouteId === comparisonResult.fastestRoute.id
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-[#f0f0e4] hover:bg-[#8b9d77] hover:text-white text-[#4a4a35]'
                            }`}
                          >
                            {selectedComparisonRouteId === comparisonResult.fastestRoute.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{isUrdu ? 'منتخب شدہ' : 'Selected'}</span>
                              </>
                            ) : (
                              <span>{isUrdu ? 'یہ روٹ منتخب کریں' : 'Select This Route'}</span>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Cheapest Route Card */}
                      {comparisonResult.cheapestRoute && (
                        <div
                          onClick={() => handleSelectRouteOption(comparisonResult.cheapestRoute!)}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                            selectedComparisonRouteId === comparisonResult.cheapestRoute.id
                              ? 'bg-emerald-50/80 border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                              : 'bg-white border-[#d5d5c5] hover:border-[#8b9d77]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                                <Wallet className="w-3 h-3 text-emerald-700" />
                                <span>{isUrdu ? 'سب سے کم خرچ روٹ' : 'Cheapest Route'}</span>
                              </span>
                              <span className="font-mono text-xs font-bold text-slate-700">
                                {isUrdu ? comparisonResult.cheapestRoute.estimatedTimeFormattedUr : comparisonResult.cheapestRoute.estimatedTimeFormattedEn}
                              </span>
                            </div>

                            <h4 className="font-bold text-xs text-[#2b2b1f] line-clamp-1">
                              {isUrdu ? comparisonResult.cheapestRoute.nameUr : comparisonResult.cheapestRoute.nameEn}
                            </h4>
                          </div>

                          <div className="grid grid-cols-2 gap-1.5 py-1.5 px-2 bg-[#fdfbf7] rounded-xl border border-[#ecece0] text-[11px]">
                            <div>
                              <span className="text-[10px] text-[#8e8e75] block">{isUrdu ? 'فاصلہ' : 'Distance'}</span>
                              <span className="font-mono font-bold text-[#4a4a35]">{comparisonResult.cheapestRoute.distanceKm} KM</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#8e8e75] block">{isUrdu ? 'ٹول ٹیکس' : 'Toll Cost'}</span>
                              <span className="font-mono font-bold text-[#4a4a35]">Rs {comparisonResult.cheapestRoute.tollCost.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#8e8e75] block">{isUrdu ? 'ڈیزل لاگت' : 'Fuel Cost'}</span>
                              <span className="font-mono font-bold text-[#4a4a35]">Rs {comparisonResult.cheapestRoute.fuelCost.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-[#8e8e75] block">{isUrdu ? 'کل لاگت' : 'Total Cost'}</span>
                              <span className="font-mono font-bold text-emerald-700">Rs {comparisonResult.cheapestRoute.totalTripCost.toLocaleString()}</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`w-full py-2 min-h-[38px] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-98 cursor-pointer ${
                              selectedComparisonRouteId === comparisonResult.cheapestRoute.id
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-[#f0f0e4] hover:bg-[#8b9d77] hover:text-white text-[#4a4a35]'
                            }`}
                          >
                            {selectedComparisonRouteId === comparisonResult.cheapestRoute.id ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{isUrdu ? 'منتخب شدہ' : 'Selected'}</span>
                              </>
                            ) : (
                              <span>{isUrdu ? 'یہ روٹ منتخب کریں' : 'Select This Route'}</span>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Single Route Available: Show Single Route Card & Requirement 4 Notice */
                  <div className="space-y-2.5">
                    {comparisonResult && comparisonResult.routes[0] && (
                      <div 
                        onClick={() => handleSelectRouteOption(comparisonResult.routes[0])}
                        className="p-3.5 rounded-2xl bg-white border border-[#ecece0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs cursor-pointer hover:border-[#8b9d77]"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8b9d77]/20 text-[#4a5e38]">
                              {isUrdu ? 'دستیاب واحد روٹ' : 'Current Active Route'}
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-700">
                              {comparisonResult.routes[0].distanceKm} KM • {isUrdu ? comparisonResult.routes[0].estimatedTimeFormattedUr : comparisonResult.routes[0].estimatedTimeFormattedEn}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-[#2b2b1f]">
                            {isUrdu ? comparisonResult.routes[0].nameUr : comparisonResult.routes[0].nameEn}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-right text-[11px] font-mono font-bold text-emerald-800">
                            Rs {comparisonResult.routes[0].totalTripCost.toLocaleString()}
                          </div>
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-xl bg-[#4a5e38] text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            {isUrdu ? 'لاگو کریں' : 'Apply'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Requirement 4 Notice: Inform user route comparison isn't possible yet without additional route data */}
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2 leading-relaxed">
                      <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                      <div>
                        <p className="font-semibold">
                          {isUrdu ? 'متبادل روٹ موازنہ نوٹس:' : 'Route Comparison Notice:'}
                        </p>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          {isUrdu
                            ? (comparisonResult?.informationalNoticeUr || 'اس شہر کے جوڑے کے لیے فی الوقت صرف ایک روٹ ڈیٹا دستیاب ہے۔ متبادل روٹ ڈیٹا کے بغیر موازنہ ممکن نہیں۔')
                            : (comparisonResult?.informationalNoticeEn || 'Only one route currently exists in the dataset for this city pair. Alternate route comparison requires additional route data.')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Field 3: Route Distance / روٹ فاصلہ (کلومیٹر) */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex flex-col justify-center">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs sm:text-sm font-black text-[#383827]">
                {isUrdu ? 'روٹ فاصلہ (کلومیٹر)' : 'Route Distance (Kilometers)'}
              </label>
              {isRouteLoading && (
                <span className="text-xs text-[#8b9d77] font-black animate-pulse">
                  {isUrdu ? 'نقشہ لوڈ ہو رہا ہے...' : 'Fetching OSRM route...'}
                </span>
              )}
            </div>
            <div className="flex items-center bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-1.5 focus-within:border-[#8b9d77] transition-all shadow-2xs">
              <input
                type="number"
                inputMode="decimal"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                onFocus={(e) => e.target.select()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                placeholder="180"
                className="flex-1 bg-transparent text-left font-mono font-black text-sm sm:text-base text-[#2b2b1f] focus:outline-none dir-ltr pr-2 min-w-0"
              />
              <span className="text-xs font-mono font-black text-[#4a5a3a] bg-[#e6e6d8] px-2 py-0.5 rounded-lg shrink-0 select-none">
                KM
              </span>
            </div>
            {/* Quick distance preset chips */}
            <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
              <span className="text-[10px] text-[#8e8e75] font-bold">{isUrdu ? 'فوری فاصلہ:' : 'Quick:'}</span>
              {[25, 50, 100, 200].map((delta) => (
                <button
                  key={delta}
                  type="button"
                  onClick={() => {
                    const current = parseFloat(distance) || 0;
                    setDistance(String(current + delta));
                  }}
                  className="px-2 py-0.5 bg-[#f0f0e4] hover:bg-[#e2e2d5] active:scale-95 text-[#4a4a35] rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer border border-[#d5d5c5]"
                >
                  +{delta} KM
                </button>
              ))}
            </div>
          </div>

          {/* Field 4: Fuel Rate / ڈیزل ریٹ (روپے / لٹر) */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex flex-col justify-center">
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <label className="block text-xs sm:text-sm font-black text-[#383827]">
                {isUrdu ? 'ڈیزل ریٹ (روپے / لٹر)' : 'Diesel Rate (PKR / Liter)'}
              </label>
              <button
                type="button"
                onClick={() => setFuelPrice(liveDieselBenchmark)}
                className="text-[10px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg px-2 py-0.5 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                title={isUrdu ? 'سرکاری لائیو ریٹ لگائیں' : 'Apply Live Rate'}
              >
                <span>{isUrdu ? `سرکاری ریٹ: Rs. ${liveDieselBenchmark}` : `Live: Rs. ${liveDieselBenchmark}`}</span>
              </button>
            </div>
            <div className="flex items-center bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-1.5 focus-within:border-[#8b9d77] transition-all shadow-2xs">
              <input
                type="number"
                inputMode="decimal"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(e.target.value)}
                onFocus={(e) => e.target.select()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                placeholder={liveDieselBenchmark}
                className="flex-1 bg-transparent text-left font-mono font-black text-sm sm:text-base text-[#2b2b1f] focus:outline-none dir-ltr pr-2 min-w-0"
              />
              <span className="text-xs font-mono font-black text-[#4a5a3a] bg-[#e6e6d8] px-2 py-0.5 rounded-lg shrink-0 select-none">
                PKR
              </span>
            </div>
          </div>

          {/* Field 5: Mileage / گاڑی کی ایوریج (کلومیٹر / لٹر) */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex flex-col justify-center">
            <label className="block text-xs sm:text-sm font-black text-[#383827] mb-1.5">
              {isUrdu ? 'گاڑی کی ایوریج (کلومیٹر / لٹر)' : 'Vehicle Mileage Average (KM / L)'}
            </label>
            <div className="flex items-center bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-1.5 focus-within:border-[#8b9d77] transition-all shadow-2xs">
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                onFocus={(e) => e.target.select()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                placeholder="7.0"
                className="flex-1 bg-transparent text-left font-mono font-black text-sm sm:text-base text-[#2b2b1f] focus:outline-none dir-ltr pr-2 min-w-0"
              />
              <span className="text-xs font-mono font-black text-[#4a5a3a] bg-[#e6e6d8] px-2 py-0.5 rounded-lg shrink-0 select-none">
                KM/L
              </span>
            </div>
          </div>

          {/* Field 6: Combined Expenses / ڈرائیور، ٹول و دیگر اخراجات (روپے) */}
          <div className="bg-white p-3 sm:p-3.5 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex flex-col justify-center">
            <label className="block text-xs sm:text-sm font-black text-[#383827] mb-1.5">
              {isUrdu ? 'ڈرائیور، ٹول و دیگر اخراجات (روپے)' : 'Driver, Toll & Misc Expenses (PKR)'}
            </label>
            <div className="flex items-center bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-1.5 focus-within:border-[#8b9d77] transition-all shadow-2xs">
              <input
                type="number"
                inputMode="decimal"
                value={combinedExpenses}
                onChange={(e) => setCombinedExpenses(e.target.value)}
                onFocus={(e) => e.target.select()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                placeholder="3200"
                className="flex-1 bg-transparent text-left font-mono font-black text-sm sm:text-base text-[#2b2b1f] focus:outline-none dir-ltr pr-2 min-w-0"
              />
              <span className="text-xs font-mono font-black text-[#4a5a3a] bg-[#e6e6d8] px-2 py-0.5 rounded-lg shrink-0 select-none">
                PKR
              </span>
            </div>
            {/* Quick expense preset chips */}
            <div className="flex items-center gap-1.5 pt-1.5 flex-wrap">
              <span className="text-[10px] text-[#8e8e75] font-bold">{isUrdu ? 'فوری خرچہ:' : 'Quick:'}</span>
              {[500, 1000, 2000, 3000, 5000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    const current = parseFloat(combinedExpenses) || 0;
                    setCombinedExpenses(String(current + amt));
                  }}
                  className="px-2 py-0.5 bg-[#f0f0e4] hover:bg-[#e2e2d5] active:scale-95 text-[#4a4a35] rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer border border-[#d5d5c5]"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>

          {/* Field 7: Round Trip / واپسی کا چکر (دگنا فاصلہ) */}
          <label className="bg-white p-3 sm:p-3.5 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex items-center justify-between cursor-pointer active:bg-[#f6f5ee] transition-all">
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={isReturn}
                onChange={(e) => setIsReturn(e.target.checked)}
                className="w-5 h-5 rounded-lg accent-[#8b9d77] cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-black text-[#383827]">
                {isUrdu ? 'واپسی کا چکر (راؤنڈ ٹرپ - دگنا فاصلہ)' : 'Round Trip (Return Journey - 2x Distance)'}
              </span>
            </div>
            {isReturn && (
              <span className="text-[10px] font-bold text-[#8b9d77] bg-[#eef4ea] px-2 py-0.5 rounded-md">
                2x {isUrdu ? 'فاصلہ' : 'Distance'}
              </span>
            )}
          </label>

          {/* Error notice */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-2xl text-center">
              {error}
            </div>
          )}
        </div>

        {/* Bottom Actions - 2 buttons prominently positioned above the bottom navigation bar with generous clearance */}
        <div className="w-full pt-4 pb-6 flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCalculate}
            className="flex-1 py-4 sm:py-4.5 bg-[#4a4a35] hover:bg-[#383827] active:bg-[#2e2e21] text-white rounded-2xl font-black text-base sm:text-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 border-2 border-[#8b9d77]/60"
          >
            <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-[#8b9d77]" />
            <span>{isUrdu ? 'حساب لگائیں (Calculate)' : 'Calculate Cost'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            title={isUrdu ? 'صاف کریں' : 'Reset'}
            className="p-4 sm:p-4.5 bg-white border-2 border-[#d5d5c5] hover:bg-[#f0f0e4] active:bg-[#e4e4d6] text-[#4a4a35] rounded-2xl font-bold transition-all active:scale-[0.98] cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // RENDER SCREEN 2: DEDICATED RESULT BREAKDOWN SCREEN (Scrollable)
  // ════════════════════════════════════════════════════════════
  const fmt = (n: number | undefined | null) => 'Rs ' + (Number(n) || 0).toLocaleString('en-US');

  return (
    <div 
      className={`w-full max-w-xl mx-auto flex flex-col p-3.5 sm:p-6 pb-48 sm:pb-40 md:pb-20 font-sans ${isUrdu ? 'dir-rtl' : 'dir-ltr'}`} 
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Top Header */}
      <div className="w-full flex items-center justify-between pb-3 shrink-0 border-b border-[#e0e0d2]">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#ecece0] p-0.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
            <PublicImage
              fileName="trip-icon.png"
              alt="Trip Expense and Freight Cost Summary"
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-xl"
              fallbackIcon={<Calculator className="w-5 h-5 text-[#8b9d77]" />}
            />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#4a4a35] leading-tight">
              {isUrdu ? 'سفری لاگت اور اخراجات کا نتیجہ' : 'Trip Cost Result Breakdown'}
            </h1>
            <p className="text-[11px] text-[#8e8e75]">
              {lastCalc?.origin} ➔ {lastCalc?.dest}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setViewMode('input');
            try {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } catch {}
          }}
          className="px-3 py-2 bg-white border border-[#ecece0] hover:bg-[#eaeae0] text-[#4a4a35] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
        >
          <ArrowLeft className={`w-3.5 h-3.5 ${isUrdu ? 'rotate-180' : ''}`} />
          <span>{isUrdu ? 'ترمیم کریں' : 'Edit Input'}</span>
        </button>
      </div>

      {/* Main Result Card */}
      {lastCalc && (
        <div className="w-full space-y-3.5 py-4 flex-1">
          {/* Total Cost Highlight Card */}
          <div className="bg-[#8b9d77] text-white p-5 rounded-3xl shadow-md text-center space-y-1">
            <span className="text-xs sm:text-sm font-bold opacity-90 block">
              {isUrdu ? 'کل متوقع سفری اخراجات (Total Freight Cost)' : 'Total Estimated Trip Cost'}
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
              PKR {(Number(lastCalc.total) || 0).toLocaleString('en-US')}
            </div>
            <span className="text-[11px] opacity-80 block">
              {lastCalc.dist} KM {lastCalc.isReturn ? (isUrdu ? '(راؤنڈ ٹرپ دگنا فاصلہ)' : '(Round Trip 2x Distance)') : ''}
            </span>
          </div>

          {/* Breakdown Table Card */}
          <div className="bg-white p-4 rounded-3xl border-2 border-[#e0e0d2] shadow-2xs space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#ecece0]">
              <span className="font-bold text-[#4a4a35]">{isUrdu ? 'ڈیزل ریٹ و ایوریج:' : 'Diesel Rate & Mileage:'}</span>
              <span className="font-mono font-bold text-[#383827]">
                PKR {lastCalc.fuelRateVal} / Ltr ({lastCalc.mileageVal} KM/L)
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#ecece0]">
              <span className="font-bold text-[#4a4a35]">{isUrdu ? 'ڈیزل کی کھپت:' : 'Fuel Consumption:'}</span>
              <span className="font-mono font-bold text-[#383827]">
                {lastCalc.consumed} Liters
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#ecece0]">
              <span className="font-bold text-[#4a4a35]">{isUrdu ? 'ڈیزل کا کل خرچہ:' : 'Total Fuel Cost:'}</span>
              <span className="font-mono font-bold text-[#383827]">
                {fmt(lastCalc.fuelCost)}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#ecece0]">
              <span className="font-bold text-[#4a4a35]">{isUrdu ? 'ڈرائیور، ٹول و دیگر اخراجات:' : 'Driver, Toll & Other Expenses:'}</span>
              <span className="font-mono font-bold text-[#383827]">
                {fmt(lastCalc.combinedExpensesVal || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 font-black text-sm text-[#4a4a35]">
              <span>{isUrdu ? 'کل واصل خرچہ:' : 'Net Total Trip Cost:'}</span>
              <span className="font-mono text-base text-[#8b9d77]">
                {fmt(lastCalc.total)}
              </span>
            </div>
          </div>

          {/* PDF error notification */}
          {pdfError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-2.5 rounded-2xl text-xs font-bold text-center shadow-2xs">
              {pdfError}
            </div>
          )}

          {/* Save confirmation */}
          {saveSuccess && (
            <div className="bg-[#eef4ea] border border-[#8b9d77] text-[#3d5a2d] p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#8b9d77]" />
              <span>{isUrdu ? 'یہ ٹرپ سفر ڈائری لاگز میں محفوظ کر لیا گیا ہے۔' : 'Trip saved to Safar Diary logs.'}</span>
            </div>
          )}

          {/* Copy toast */}
          {copyToast && (
            <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-950 p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? 'واٹس ایپ ٹیکسٹ میسج کاپی ہو گیا اور واٹس ایپ اوپن ہو رہا ہے! 📲' : 'WhatsApp message copied & opening WhatsApp! 📲'}</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Grid with generous spacing */}
      <div className="w-full pt-4 pb-6 shrink-0 space-y-2.5">
        <div className="grid grid-cols-3 gap-2">
          {/* 1. Fast WhatsApp Text Share */}
          <button
            type="button"
            onClick={handleQuickWhatsAppText}
            className="min-h-[50px] py-2.5 px-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1"
          >
            <Share2 className="w-4 h-4" />
            <span>{isUrdu ? 'واٹس ایپ میسج 📲' : 'WhatsApp 📲'}</span>
          </button>

          {/* 2. PDF Download */}
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={handleExportPDF}
            className={`min-h-[50px] py-2.5 px-2 text-white rounded-2xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1 ${
              isExportingPdf ? 'bg-[#4a4a35]/70 opacity-80 cursor-wait' : 'bg-[#4a4a35] hover:bg-[#383827]'
            }`}
          >
            <FileDown className={`w-4 h-4 text-[#8b9d77] ${isExportingPdf ? 'animate-bounce' : ''}`} />
            <span>{isExportingPdf ? (isUrdu ? 'بن رہی ہے...' : 'Generating...') : (isUrdu ? 'پی ڈی ایف رسید 📄' : 'PDF Receipt 📄')}</span>
          </button>

          {/* 3. Save to Diary */}
          <button
            type="button"
            onClick={handleSaveToDiary}
            className="min-h-[50px] py-2.5 px-2 bg-white border-2 border-[#8b9d77] text-[#4a4a35] hover:bg-[#eef4ea] rounded-2xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1"
          >
            <BookmarkPlus className="w-4 h-4 text-[#8b9d77]" />
            <span>{isUrdu ? 'ڈائری محفوظ 💾' : 'Save Trip 💾'}</span>
          </button>
        </div>

        {/* Back to Home / Edit Button */}
        <button
          type="button"
          onClick={() => {
            if (onNavigate) {
              onNavigate('home');
            } else {
              setViewMode('input');
              try {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } catch {}
            }
          }}
          className="w-full py-3 bg-white border border-[#e0e0d2] text-[#4a4a35] hover:bg-[#f6f5ee] rounded-2xl font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer text-center"
        >
          {isUrdu ? 'ڈیش بورڈ پر واپس جائیں' : 'Return to Dashboard'}
        </button>
      </div>
    </div>
  );
};


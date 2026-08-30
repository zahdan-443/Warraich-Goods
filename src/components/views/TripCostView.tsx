import React, { useState, useEffect } from 'react';
import { DICTIONARY, FuelType, Language, Trip } from '../../types';
import { PublicImage } from '../../assets/dashboardIcons';
import { Calculator, RotateCcw, Share2, CheckCircle2, BookmarkPlus, FileDown, ArrowLeft, Navigation, MapPin } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { fetchOSRMRouteDistance, PAKISTAN_CITIES } from '../../utils/mapRoutes';
import { getLogoBase64, sharePdfFileOrWhatsApp, escapeHtml, sanitizeHtml } from '../../utils/pdfHelper';
import { validateFinancialNumber, validateTripFinancials } from '../../utils/calculator';

interface TripCostViewProps {
  lang: Language;
  trips: Trip[];
  onSaveTrip: (tripData: Omit<Trip, 'id' | 'name'>, tripName: string) => void;
  onDeleteTrip: (id: number) => void;
  onClearAllTrips: () => void;
  initialMileage?: number;
  onNavigate?: (tab: any) => void;
}

export const TripCostView: React.FC<TripCostViewProps> = ({
  lang,
  trips,
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

  // Input States (Strict 1-box per line sequence)
  const [originCity, setOriginCity] = useState<string>('لاہور (Lahore)');
  const [destCity, setDestCity] = useState<string>('فیصل آباد (Faisalabad)');
  const [distance, setDistance] = useState<string>('180');
  const [fuelPrice, setFuelPrice] = useState<string>('311.47');
  const [mileage, setMileage] = useState<string>(initialMileage ? initialMileage.toString() : '7');
  const [combinedExpenses, setCombinedExpenses] = useState<string>('3200'); // Driver + Toll + Other
  const [isReturn, setIsReturn] = useState<boolean>(false);
  const [isRouteLoading, setIsRouteLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Result Calculation Object
  const [lastCalc, setLastCalc] = useState<Omit<Trip, 'id' | 'name'> & {
    origin?: string;
    dest?: string;
    fuelRateVal?: number;
    mileageVal?: number;
    combinedExpensesVal?: number;
  } | null>(null);

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Fetch fuel prices and toll calculator prefill from local cache if available
  useEffect(() => {
    try {
      const cachedStr = localStorage.getItem('ah_fuel_prices_cache');
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (cached && cached.diesel) {
          setFuelPrice(String(cached.diesel));
        }
      }
    } catch (e) {
      // ignore
    }

    try {
      const prefillStr = localStorage.getItem('ah-prefill-toll-calc');
      if (prefillStr) {
        const prefill = JSON.parse(prefillStr);
        if (prefill.tollAmount) {
          setCombinedExpenses(String(prefill.tollAmount));
        }
        if (prefill.fromCity) {
          const match = PAKISTAN_CITIES.find(
            c => c.nameEn.toLowerCase() === prefill.fromCity.toLowerCase() || c.nameUr.includes(prefill.fromCity)
          );
          if (match) {
            setOriginCity(`${match.nameUr} (${match.nameEn})`);
          }
        }
        if (prefill.toCity) {
          const match = PAKISTAN_CITIES.find(
            c => c.nameEn.toLowerCase() === prefill.toCity.toLowerCase() || c.nameUr.includes(prefill.toCity)
          );
          if (match) {
            setDestCity(`${match.nameUr} (${match.nameEn})`);
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

    const p = fuelVal.value;
    const m = mileageVal.value;
    const d = distVal.value;
    const exp = expVal.value;

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
      origin: originCity,
      dest: destCity,
      fuelRateVal: p,
      mileageVal: m,
      combinedExpensesVal: exp
    };

    setLastCalc(calcObj);
    setSaveSuccess(false);
    setViewMode('result');
  };

  const handleReset = () => {
    setOriginCity('لاہور (Lahore)');
    setDestCity('فیصل آباد (Faisalabad)');
    setDistance('180');
    setFuelPrice('311.47');
    setMileage('7');
    setCombinedExpenses('3200');
    setIsReturn(false);
    setError(null);
    setLastCalc(null);
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

  const handleWhatsAppShare = async () => {
    if (!lastCalc) return;
    const fmt = (n: number) => 'PKR ' + n.toLocaleString();
    const msg = `🚛 *ڈرائیور دوست — کرایہ اور سفری اخراجات لاگ*\n` +
      `📍 روانگی (از): ${lastCalc.origin}\n` +
      `🏁 منزل (تا): ${lastCalc.dest}\n` +
      `🛣️ روٹ فاصلہ: ${lastCalc.dist} km ${lastCalc.isReturn ? '(راؤنڈ ٹرپ)' : ''}\n` +
      `🛢️ فیول کھپت: ${lastCalc.consumed} Liters\n` +
      `⛽ فیول خرچہ: ${fmt(lastCalc.fuelCost)}\n` +
      `💵 ڈرائیور و دیگر اخراجات: ${fmt(lastCalc.combinedExpensesVal || 0)}\n\n` +
      `💰 *کل سفری اخراجات (Total Freight Cost): ${fmt(lastCalc.total)}*\n` +
      `📅 تاریخ: ${lastCalc.date}`;

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

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleExportPDF = async () => {
    if (!lastCalc || isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const result = await generateTripCostPdf();
      if (result) {
        result.pdf.save(result.fileName);
      } else {
        alert('پی ڈی ایف بنانے میں مسئلہ آیا، دوبارہ کوشش کریں۔');
      }
    } catch (err) {
      console.error('PDF export error:', err);
      alert('پی ڈی ایف بنانے میں مسئلہ آیا: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExportingPdf(false);
    }
  };

  // ════════════════════════════════════════════════════════════
  // RENDER SCREEN 1: INPUT FORM (Full-Screen Fit, Larger Fields & Typography)
  // ════════════════════════════════════════════════════════════
  if (viewMode === 'input') {
    return (
      <div className="fixed inset-0 z-50 h-[100dvh] max-h-[100dvh] overflow-hidden bg-[#f6f5ee] flex flex-col justify-between p-2.5 sm:p-4 font-sans dir-rtl select-none" dir="rtl">
        {/* Top Header with Trip Icon */}
        <div className="max-w-xl mx-auto w-full flex items-center justify-between pb-1 shrink-0">
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
              <h1 className="text-sm sm:text-base font-bold text-[#4a4a35] leading-tight">
                {isUrdu ? 'سفر اخراجات کیلکولیٹر' : 'Trip Expense Calculator'}
              </h1>
              <p className="text-[10px] text-[#8e8e75]">
                {isUrdu ? 'کرایہ، ڈیزل و منافع کا تخمینہ' : 'Freight, Fuel & Profit Estimate'}
              </p>
            </div>
          </div>
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="p-2 bg-white border border-[#ecece0] hover:bg-[#eaeae0] text-[#4a4a35] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              <span>{isUrdu ? 'ڈیش بورڈ' : 'Back'}</span>
            </button>
          )}
        </div>

        {/* 7 Inputs - Compact Full Screen Fit with Big Text */}
        <div className="flex-1 flex flex-col justify-evenly space-y-1 sm:space-y-1.5 max-w-xl mx-auto w-full my-auto">
          
          {/* Field 1: Origin City / از (روانگی - ڈراپ ڈاؤن) */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex flex-col justify-center">
            <label className="block text-xs sm:text-sm font-black text-[#383827] mb-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#8b9d77]" />
              <span>از (روانگی - ڈراپ ڈاؤن)</span>
            </label>
            <select
              value={originCity}
              onChange={(e) => setOriginCity(e.target.value)}
              className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-1.5 text-sm sm:text-base font-black text-[#2b2b1f] focus:border-[#8b9d77] focus:outline-none cursor-pointer shadow-2xs"
            >
              {PAKISTAN_CITIES.map((c) => (
                <option key={c.nameEn} value={c.nameUr}>
                  {c.nameUr}
                </option>
              ))}
            </select>
          </div>

          {/* Field 2: Destination City / تا (منزل - ڈراپ ڈاؤن) */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex flex-col justify-center">
            <label className="block text-xs sm:text-sm font-black text-[#383827] mb-1 flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-[#8b9d77]" />
              <span>تا (منزل - ڈراپ ڈاؤن)</span>
            </label>
            <select
              value={destCity}
              onChange={(e) => setDestCity(e.target.value)}
              className="w-full bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-1.5 text-sm sm:text-base font-black text-[#2b2b1f] focus:border-[#8b9d77] focus:outline-none cursor-pointer shadow-2xs"
            >
              {PAKISTAN_CITIES.map((c) => (
                <option key={c.nameEn} value={c.nameUr}>
                  {c.nameUr}
                </option>
              ))}
            </select>
          </div>

          {/* Field 3: Route Distance / روٹ فاصلہ (کلومیٹر) */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex flex-col justify-center">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs sm:text-sm font-black text-[#383827]">
                روٹ فاصلہ (کلومیٹر)
              </label>
              {isRouteLoading && (
                <span className="text-xs text-[#8b9d77] font-black animate-pulse">
                  {isUrdu ? 'نقشہ لوڈ ہو رہا ہے...' : 'Fetching OSRM route...'}
                </span>
              )}
            </div>
            <div className="flex items-center bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-1 focus-within:border-[#8b9d77] transition-all shadow-2xs">
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
          </div>

          {/* Field 4: Fuel Rate / ڈیزل ریٹ (روپے / لٹر) */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex flex-col justify-center">
            <label className="block text-xs sm:text-sm font-black text-[#383827] mb-1">
              ڈیزل ریٹ (روپے / لٹر)
            </label>
            <div className="flex items-center bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-1 focus-within:border-[#8b9d77] transition-all shadow-2xs">
              <input
                type="number"
                inputMode="decimal"
                value={fuelPrice}
                onChange={(e) => setFuelPrice(e.target.value)}
                onFocus={(e) => e.target.select()}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                placeholder="311.47"
                className="flex-1 bg-transparent text-left font-mono font-black text-sm sm:text-base text-[#2b2b1f] focus:outline-none dir-ltr pr-2 min-w-0"
              />
              <span className="text-xs font-mono font-black text-[#4a5a3a] bg-[#e6e6d8] px-2 py-0.5 rounded-lg shrink-0 select-none">
                PKR
              </span>
            </div>
          </div>

          {/* Field 5: Mileage / گاڑی کی ایوریج (کلومیٹر / لٹر) */}
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex flex-col justify-center">
            <label className="block text-xs sm:text-sm font-black text-[#383827] mb-1">
              گاڑی کی ایوریج (کلومیٹر / لٹر)
            </label>
            <div className="flex items-center bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-1 focus-within:border-[#8b9d77] transition-all shadow-2xs">
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
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex flex-col justify-center">
            <label className="block text-xs sm:text-sm font-black text-[#383827] mb-1">
              ڈرائیور، ٹول و دیگر اخراجات (روپے)
            </label>
            <div className="flex items-center bg-[#fdfbf7] border-2 border-[#d5d5c5] rounded-xl px-3 py-1 focus-within:border-[#8b9d77] transition-all shadow-2xs">
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
          </div>

          {/* Field 7: Round Trip / واپسی کا چکر (دگنا فاصلہ) */}
          <label className="bg-white p-2.5 sm:p-3 rounded-2xl border-2 border-[#e0e0d2] shadow-2xs flex items-center justify-between cursor-pointer active:bg-[#f6f5ee] transition-all">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isReturn}
                onChange={(e) => setIsReturn(e.target.checked)}
                className="w-5 h-5 rounded-lg accent-[#8b9d77] cursor-pointer"
              />
              <span className="text-xs sm:text-sm font-black text-[#383827]">
                واپسی کا چکر (راؤنڈ ٹرپ - دگنا فاصلہ)
              </span>
            </div>
            {isReturn && (
              <span className="text-[10px] font-bold text-[#8b9d77] bg-[#eef4ea] px-2 py-0.5 rounded-md">
                2x فاصلہ
              </span>
            )}
          </label>

          {/* Error notice */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-2 rounded-xl text-center">
              {error}
            </div>
          )}
        </div>

        {/* Bottom Actions - 2 buttons */}
        <div className="max-w-xl mx-auto w-full pt-2 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCalculate}
            className="flex-1 py-3 bg-[#4a4a35] hover:bg-[#383827] text-white rounded-2xl font-black text-base shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Calculator className="w-5 h-5 text-[#8b9d77]" />
            <span>{isUrdu ? 'حساب لگائیں (Calculate)' : 'Calculate Cost'}</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            title={isUrdu ? 'صاف کریں' : 'Reset'}
            className="p-3 bg-white border-2 border-[#d5d5c5] hover:bg-[#f0f0e4] text-[#4a4a35] rounded-2xl font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════
  // RENDER SCREEN 2: DEDICATED RESULT BREAKDOWN SCREEN
  // ════════════════════════════════════════════════════════════
  const fmt = (n: number) => 'Rs ' + n.toLocaleString('en-US');

  return (
    <div className="fixed inset-0 z-50 h-[100dvh] max-h-[100dvh] overflow-y-auto bg-[#f6f5ee] flex flex-col justify-between p-3 sm:p-5 font-sans dir-rtl select-none" dir="rtl">
      {/* Top Header */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between pb-2 shrink-0 border-b border-[#e0e0d2]">
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
          onClick={() => setViewMode('input')}
          className="px-3 py-2 bg-white border border-[#ecece0] hover:bg-[#eaeae0] text-[#4a4a35] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
          <span>{isUrdu ? 'ترمیم کریں' : 'Edit Input'}</span>
        </button>
      </div>

      {/* Main Result Card */}
      {lastCalc && (
        <div className="max-w-xl mx-auto w-full my-auto space-y-3 py-2">
          {/* Total Cost Highlight Card */}
          <div className="bg-[#8b9d77] text-white p-5 rounded-3xl shadow-md text-center space-y-1">
            <span className="text-xs sm:text-sm font-bold opacity-90 block">
              {isUrdu ? 'کل متوقع سفری اخراجات (Total Freight Cost)' : 'Total Estimated Trip Cost'}
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
              PKR {lastCalc.total.toLocaleString('en-US')}
            </div>
            <span className="text-[11px] opacity-80 block">
              {lastCalc.dist} KM {lastCalc.isReturn ? '(راؤنڈ ٹرپ دگنا فاصلہ)' : ''}
            </span>
          </div>

          {/* Breakdown Table Card */}
          <div className="bg-white p-4 rounded-3xl border-2 border-[#e0e0d2] shadow-2xs space-y-2.5 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-[#ecece0]">
              <span className="font-bold text-[#4a4a35]">ڈیزل ریٹ و ایوریج:</span>
              <span className="font-mono font-bold text-[#383827]">
                PKR {lastCalc.fuelRateVal} / Ltr ({lastCalc.mileageVal} KM/L)
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#ecece0]">
              <span className="font-bold text-[#4a4a35]">ڈیزل کی کھپت:</span>
              <span className="font-mono font-bold text-[#383827]">
                {lastCalc.consumed} Liters
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#ecece0]">
              <span className="font-bold text-[#4a4a35]">ڈیزل کا کل خرچہ:</span>
              <span className="font-mono font-bold text-[#383827]">
                {fmt(lastCalc.fuelCost)}
              </span>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-[#ecece0]">
              <span className="font-bold text-[#4a4a35]">ڈرائیور، ٹول و دیگر اخراجات:</span>
              <span className="font-mono font-bold text-[#383827]">
                {fmt(lastCalc.combinedExpensesVal || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 font-black text-sm text-[#4a4a35]">
              <span>کل واصل خرچہ:</span>
              <span className="font-mono text-base text-[#8b9d77]">
                {fmt(lastCalc.total)}
              </span>
            </div>
          </div>

          {/* Save confirmation */}
          {saveSuccess && (
            <div className="bg-[#eef4ea] border border-[#8b9d77] text-[#3d5a2d] p-2.5 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#8b9d77]" />
              <span>{isUrdu ? 'یہ ٹرپ سفر ڈائری لاگز میں محفوظ کر لیا گیا ہے۔' : 'Trip saved to Safar Diary logs.'}</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Action Grid */}
      <div className="max-w-xl mx-auto w-full pt-2 shrink-0 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {/* WhatsApp Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="py-2.5 px-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1"
          >
            <Share2 className="w-4 h-4" />
            <span>{isUrdu ? 'واٹس ایپ' : 'WhatsApp'}</span>
          </button>

          {/* PDF Download */}
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={handleExportPDF}
            className={`py-2.5 px-2 text-white rounded-2xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1 ${
              isExportingPdf ? 'bg-[#4a4a35]/70 opacity-80 cursor-wait' : 'bg-[#4a4a35] hover:bg-[#383827]'
            }`}
          >
            <FileDown className={`w-4 h-4 text-[#8b9d77] ${isExportingPdf ? 'animate-bounce' : ''}`} />
            <span>{isExportingPdf ? (isUrdu ? 'بن رہی ہے...' : 'Generating...') : (isUrdu ? 'پی ڈی ایف' : 'PDF Receipt')}</span>
          </button>

          {/* Save to Diary */}
          <button
            type="button"
            onClick={handleSaveToDiary}
            className="py-2.5 px-2 bg-white border-2 border-[#8b9d77] text-[#4a4a35] hover:bg-[#eef4ea] rounded-2xl font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1"
          >
            <BookmarkPlus className="w-4 h-4 text-[#8b9d77]" />
            <span>{isUrdu ? 'محفوظ کریں' : 'Save Trip'}</span>
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
            }
          }}
          className="w-full py-2.5 bg-white border border-[#e0e0d2] text-[#4a4a35] hover:bg-[#f6f5ee] rounded-2xl font-bold text-xs shadow-2xs transition-all active:scale-95 cursor-pointer text-center"
        >
          {isUrdu ? 'ڈیش بورڈ پر واپس جائیں' : 'Return to Dashboard'}
        </button>
      </div>
    </div>
  );
};

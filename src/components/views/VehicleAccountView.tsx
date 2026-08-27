import React, { useState } from 'react';
import { CustomExpense, FreightIncome, Language, Vehicle } from '../../types';
import { PublicImage } from '../../assets/dashboardIcons';
import {
  ArrowLeft,
  Calculator,
  Plus,
  Trash2,
  Share2,
  BookmarkPlus,
  FileDown,
  CheckCircle2,
  RotateCcw,
  TrendingUp,
  Wallet,
  Receipt,
  Truck,
  ArrowDownRight,
  Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { getLogoBase64 } from '../../utils/pdfHelper';
import { validateVehicleAccountFinancials } from '../../utils/calculator';

interface VehicleAccountViewProps {
  lang: Language;
  vehicles?: Vehicle[];
  onNavigate: (tab: any) => void;
  onSaveTrip?: (tripObj: any, tripName: string) => void;
}

export const VehicleAccountView: React.FC<VehicleAccountViewProps> = ({
  lang,
  vehicles = [],
  onNavigate,
  onSaveTrip,
}) => {
  const isUrdu = lang === 'ur';

  // Vehicle info
  const [vehicleNo, setVehicleNo] = useState<string>('LHR-7860');

  // Incomes (آمدن / کرایہ) - At least 2 default editable Karaya entries
  const [incomes, setIncomes] = useState<FreightIncome[]>([
    { id: 'income_1', label: isUrdu ? 'کرایہ 1 (جانے کا)' : 'Freight / Karaya 1', amount: 0 },
    { id: 'income_2', label: isUrdu ? 'کرایہ 2 (واپسی کا)' : 'Freight / Karaya 2', amount: 0 },
  ]);

  // Expenses (اخراجات)
  const [diesel, setDiesel] = useState<string>('0');
  const [toll, setToll] = useState<string>('0');
  const [challan, setChallan] = useState<string>('0');
  const [rotiKharcha, setRotiKharcha] = useState<string>('0');
  const [chowkidara, setChowkidara] = useState<string>('0');
  const [gariKaam, setGariKaam] = useState<string>('0');
  const [driverCommission, setDriverCommission] = useState<string>('0');
  
  // Custom expense items added on the fly
  const [customExpenses, setCustomExpenses] = useState<CustomExpense[]>([]);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

  // Add Income entry
  const handleAddIncome = () => {
    const nextIdx = incomes.length + 1;
    setIncomes((prev) => [
      ...prev,
      {
        id: `income_${Date.now()}`,
        label: isUrdu ? `کرایہ ${nextIdx} (اضافی مال)` : `Freight / Karaya ${nextIdx}`,
        amount: 0,
      },
    ]);
  };

  const handleUpdateIncomeLabel = (id: string, label: string) => {
    setIncomes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label } : item))
    );
  };

  const handleUpdateIncomeAmount = (id: string, amountStr: string) => {
    const num = parseFloat(amountStr) || 0;
    setIncomes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount: num } : item))
    );
  };

  const handleRemoveIncome = (id: string) => {
    if (incomes.length <= 2) {
      // Just reset amount to 0 if it's one of the 2 default entries
      setIncomes((prev) =>
        prev.map((item) => (item.id === id ? { ...item, amount: 0 } : item))
      );
    } else {
      setIncomes((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Add custom expense field
  const handleAddCustomExpense = () => {
    const newId = `custom_${Date.now()}`;
    setCustomExpenses((prev) => [
      ...prev,
      { id: newId, label: isUrdu ? 'نیا خرچہ' : 'Custom Expense', amount: 0 },
    ]);
  };

  const handleUpdateCustomLabel = (id: string, label: string) => {
    setCustomExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, label } : item))
    );
  };

  const handleUpdateCustomAmount = (id: string, amountStr: string) => {
    const num = parseFloat(amountStr) || 0;
    setCustomExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount: num } : item))
    );
  };

  const handleRemoveCustomExpense = (id: string) => {
    setCustomExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  // Calculations
  const totalIncome = incomes.reduce((sum, item) => sum + (item.amount || 0), 0);

  const dieselVal = parseFloat(diesel) || 0;
  const tollVal = parseFloat(toll) || 0;
  const challanVal = parseFloat(challan) || 0;
  const rotiVal = parseFloat(rotiKharcha) || 0;
  const chowkidaraVal = parseFloat(chowkidara) || 0;
  const gariKaamVal = parseFloat(gariKaam) || 0;
  const commissionVal = parseFloat(driverCommission) || 0;
  const customTotal = customExpenses.reduce((sum, item) => sum + (item.amount || 0), 0);

  const grandTotalExpenses = dieselVal + tollVal + challanVal + rotiVal + chowkidaraVal + gariKaamVal + commissionVal + customTotal;
  const netProfit = totalIncome - grandTotalExpenses;

  const handleReset = () => {
    setIncomes([
      { id: 'income_1', label: isUrdu ? 'کرایہ 1 (جانے کا)' : 'Freight / Karaya 1', amount: 0 },
      { id: 'income_2', label: isUrdu ? 'کرایہ 2 (واپسی کا)' : 'Freight / Karaya 2', amount: 0 },
    ]);
    setDiesel('0');
    setToll('0');
    setChallan('0');
    setRotiKharcha('0');
    setChowkidara('0');
    setGariKaam('0');
    setDriverCommission('0');
    setCustomExpenses([]);
    setSavedSuccess(false);
  };

  const handleSaveToDiary = () => {
    const finValidation = validateVehicleAccountFinancials(incomes, {
      diesel: dieselVal,
      toll: tollVal,
      challan: challanVal,
      rotiKharcha: rotiVal,
      chowkidara: chowkidaraVal,
      gariKaam: gariKaamVal,
      driverCommission: commissionVal,
      customTotal: customTotal
    });

    if (!finValidation.isValid) {
      window.alert(finValidation.error || 'براہ کرم گاڑی کے درست اور مثبت اخراجات درج کریں۔');
      return;
    }

    if (grandTotalExpenses <= 0 && totalIncome <= 0) {
      window.alert(isUrdu ? 'براہ کرم پہلے گاڑی کی آمدن یا اخراجات درج کریں۔' : 'Please input income or expenses before saving.');
      return;
    }

    if (onSaveTrip) {
      const titleName = `گاڑی کا حساب (${vehicleNo || 'ٹرک'})`;
      onSaveTrip(
        {
          fuelType: 'Diesel 🛢️',
          fuelTypeRaw: 'diesel',
          dist: 0,
          consumed: '0',
          fuelCost: Math.round(dieselVal),
          toll: Math.round(tollVal),
          loading: 0,
          driver: Math.round(rotiVal + commissionVal),
          other: Math.round(challanVal + chowkidaraVal + gariKaamVal + customTotal),
          total: Math.round(finValidation.totalExpense),
          totalIncome: Math.round(finValidation.totalIncome),
          netProfit: Math.round(finValidation.netProfit),
          incomes: incomes,
          isReturn: false,
          date: new Date().toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }),
          month: new Date().toLocaleString('default', { month: 'short', year: '2-digit' }),
        },
        titleName
      );
      setSavedSuccess(true);
    }
  };

  const handleWhatsAppShare = () => {
    const fmt = (num: number) => 'Rs ' + num.toLocaleString('en-US');
    let msg = `🚛 *وڑائچ گڈز — گاڑی کا مکمل حساب و منافع رپورٹ*\n` +
      `🚗 گاڑی نمبر: ${vehicleNo}\n` +
      `📅 تاریخ: ${new Date().toLocaleDateString('en-PK')}\n\n` +
      `💵 *آمدن و کرایہ جات (Freight Income):*\n`;

    incomes.forEach((item, idx) => {
      msg += `• ${item.label}: ${fmt(item.amount || 0)}\n`;
    });
    msg += `👉 *کل حاصل آمدن: ${fmt(totalIncome)}*\n\n`;

    msg += `🧾 *اخراجات تفصیل (Trip Expenses):*\n` +
      `⛽ ڈیزل خرچہ: ${fmt(dieselVal)}\n` +
      `🛣️ ٹول پلازہ: ${fmt(tollVal)}\n` +
      `🚔 چالان: ${fmt(challanVal)}\n` +
      `🍲 روٹی خرچہ: ${fmt(rotiVal)}\n` +
      `🛡️ چوکیداری / پارکنگ: ${fmt(chowkidaraVal)}\n` +
      `🔧 گاڑی کا کام / مرمت: ${fmt(gariKaamVal)}\n` +
      `👨‍✈️ ڈرائیور کمیشن: ${fmt(commissionVal)}\n`;

    if (customExpenses.length > 0) {
      customExpenses.forEach((item) => {
        if (item.amount > 0) {
          msg += `• ${item.label}: ${fmt(item.amount)}\n`;
        }
      });
    }

    msg += `👉 *کل واصل خرچہ: ${fmt(grandTotalExpenses)}*\n\n`;

    if (netProfit >= 0) {
      msg += `💰 *خالص بچت / نفع (Net Profit): ${fmt(netProfit)}* 🟢\n\n`;
    } else {
      msg += `⚠️ *خسارہ / بقایا خرچہ (Deficit): ${fmt(Math.abs(netProfit))}* 🔴\n\n`;
    }

    msg += `📞 وڑائچ گڈز ٹرانسپورٹ کمپنی: 0300-5370443`;

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleExportPDF = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
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

      const fmt = (num: number) => 'Rs ' + num.toLocaleString('en-US');

      let incomeRowsHtml = '';
      incomes.forEach((item) => {
        incomeRowsHtml += `
          <tr style="border-bottom: 1px solid #e2ebd8;">
            <td style="padding: 9px 8px; color: #2d5a27; font-weight: bold; text-align: right;">${item.label}:</td>
            <td style="padding: 9px 8px; font-weight: bold; text-align: left; font-family: sans-serif; color: #1e4620; direction: ltr;">${fmt(item.amount || 0)}</td>
          </tr>
        `;
      });

      let customRowsHtml = '';
      customExpenses.forEach((item) => {
        if (item.amount > 0) {
          customRowsHtml += `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 9px 8px; color: #4b5563; font-weight: bold; text-align: right;">${item.label}:</td>
              <td style="padding: 9px 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${fmt(item.amount)}</td>
            </tr>
          `;
        }
      });

      const logoHtml = logoDataUrl
        ? `<img src="${logoDataUrl}" alt="Warraich Logo" style="width: 76px; height: 76px; object-fit: contain; border-radius: 50%; border: 3px solid #c59b27; padding: 2px; background: #ffffff; box-shadow: 0 2px 6px rgba(0,0,0,0.08);" />`
        : `<div style="width: 76px; height: 76px; border-radius: 50%; border: 3px solid #c59b27; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.08); text-align: center;">
            <span style="font-size: 24px; line-height: 1;">🚛</span>
            <span style="font-size: 9px; font-weight: 900; color: #4a4a35; font-family: sans-serif; letter-spacing: 0.5px; margin-top: 2px;">WARRAICH</span>
          </div>`;

      container.innerHTML = `
        <div style="border-bottom: 3px solid #8b9d77; padding-bottom: 16px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: flex-start; direction: rtl;">
          <div style="flex: 1; text-align: right;">
            <h1 style="margin: 0; font-size: 26px; color: #4a4a35; font-weight: 900; font-family: inherit;">وڑائچ گڈز ٹرانسپورٹ کمپنی (رجسٹرڈ)</h1>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #8b9d77; font-weight: bold;">گاڑی کے سفر کا تفصیلی حساب و آمدن خرچ لیجر</p>
            
            <div style="margin-top: 10px; background: #fafaf5; border: 1.5px solid #e0e0d0; padding: 8px 14px; border-radius: 10px; font-size: 12px; line-height: 1.6; display: inline-block;">
              <div style="color: #c0392b; font-weight: bold;">چیف ایگزیکٹو: زاہدان نصر وڑائچ</div>
              <div style="direction: ltr; text-align: right; font-weight: 800; color: #222; font-family: sans-serif;">0300-5370443 | 0339-5370443</div>
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; margin-right: 15px;">
            ${logoHtml}
            <div style="text-align: center; font-size: 11px; color: #555; font-family: sans-serif; direction: ltr;">
              <div><strong>Vehicle:</strong> ${vehicleNo}</div>
              <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-PK')}</div>
            </div>
          </div>
        </div>

        <!-- Income Breakdown -->
        <div style="background: #f4f9f1; border: 1.5px solid #cde4c5; border-radius: 14px; padding: 16px 18px; margin-bottom: 22px; direction: rtl;">
          <h2 style="font-size: 16px; color: #275e23; margin: 0 0 10px 0; border-bottom: 1.5px solid #cde4c5; padding-bottom: 8px; text-align: right;">
            💵 حاصل شدہ آمدن و کرایہ جات کی تفصیل
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; direction: rtl;">
            ${incomeRowsHtml}
            <tr style="border-top: 2px solid #275e23;">
              <td style="padding: 10px 8px; font-weight: 900; font-size: 14px; color: #1e4620; text-align: right;">کل حاصل شدہ آمدن:</td>
              <td style="padding: 10px 8px; font-weight: 900; text-align: left; font-size: 16px; font-family: sans-serif; color: #1e4620; direction: ltr;">PKR ${totalIncome.toLocaleString('en-US')}</td>
            </tr>
          </table>
        </div>

        <!-- Expenses Breakdown -->
        <h2 style="font-size: 16px; color: #4a4a35; border-bottom: 2px solid #8b9d77; padding-bottom: 8px; margin-bottom: 14px; text-align: right;">
          🧾 سفری اخراجات کی مکمل تفصیل
        </h2>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 22px; direction: rtl;">
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px; color: #4b5563; font-weight: bold; text-align: right;">1. ڈیزل خرچہ (ایندھن):</td>
            <td style="padding: 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${fmt(dieselVal)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px; color: #4b5563; font-weight: bold; text-align: right;">2. ٹول پلازہ موٹروے ٹیکس:</td>
            <td style="padding: 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${fmt(tollVal)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px; color: #4b5563; font-weight: bold; text-align: right;">3. ٹریفک چالان و جرمانہ:</td>
            <td style="padding: 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${fmt(challanVal)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px; color: #4b5563; font-weight: bold; text-align: right;">4. روٹی و خوراک خرچہ:</td>
            <td style="padding: 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${fmt(rotiVal)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px; color: #4b5563; font-weight: bold; text-align: right;">5. چوکیداری و اڈا پارکنگ:</td>
            <td style="padding: 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${fmt(chowkidaraVal)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px; color: #4b5563; font-weight: bold; text-align: right;">6. گاڑی کا کام و مرمت:</td>
            <td style="padding: 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${fmt(gariKaamVal)}</td>
          </tr>
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 8px; color: #4b5563; font-weight: bold; text-align: right;">7. ڈرائیور کمیشن و اجرت:</td>
            <td style="padding: 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${fmt(commissionVal)}</td>
          </tr>
          ${customRowsHtml}
          <tr style="border-top: 2px solid #8b9d77;">
            <td style="padding: 10px 8px; font-weight: 900; font-size: 14px; color: #4a4a35; text-align: right;">کل سفری اخراجات:</td>
            <td style="padding: 10px 8px; font-weight: 900; text-align: left; font-size: 16px; font-family: sans-serif; color: #4a4a35; direction: ltr;">PKR ${grandTotalExpenses.toLocaleString('en-US')}</td>
          </tr>
        </table>

        <!-- Net Profit Card -->
        <div style="background: ${netProfit >= 0 ? '#275e23' : '#c0392b'}; color: #ffffff; border-radius: 16px; padding: 18px 22px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; direction: rtl;">
          <div style="text-align: right;">
            <div style="font-size: 17px; font-weight: 900;">${netProfit >= 0 ? 'خالص منافع / بچت:' : 'خسارہ / بقایا خرچہ:'}</div>
            <div style="font-size: 12px; opacity: 0.95; margin-top: 2px;">آمدن (PKR ${totalIncome.toLocaleString()}) منفی خرچہ (PKR ${grandTotalExpenses.toLocaleString()})</div>
          </div>
          <div style="font-size: 28px; font-weight: 900; font-family: sans-serif; direction: ltr;">PKR ${Math.abs(netProfit).toLocaleString('en-US')}</div>
        </div>

        <div style="border-top: 1.5px solid #d1d5db; padding-top: 16px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; color: #6b7280; line-height: 1.6; direction: rtl;">
          <div style="text-align: right;">
            <div style="font-weight: bold; color: #374151;">وڑائچ گڈز ٹرانسپورٹ فلیٹ مینجمنٹ سسٹم</div>
            <div style="font-style: italic;">یہ کمپیوٹر سے تیار کردہ تصدیق شدہ سسٹمیٹک رسید ہے۔</div>
          </div>
          <div style="text-align: left; direction: ltr; font-family: sans-serif; font-size: 11px;">
            <div><strong>Verified Vehicle:</strong> ${vehicleNo}</div>
            <div><strong>Generated:</strong> ${new Date().toLocaleTimeString('en-PK')}</div>
          </div>
        </div>
      `;

      document.body.appendChild(container);

      // Render canvas via html2canvas safely
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

      const fileName = `Gari_Hisaab_${vehicleNo}_${Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('پی ڈی ایف بنانے میں مسئلہ آیا: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-6 md:p-8 max-w-4xl mx-auto w-full font-sans" dir="rtl">
      {/* Back button */}
      <div className="mb-4">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4a4a35] hover:bg-[#383827] text-white rounded-2xl font-bold text-sm shadow-md transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 rotate-180" />
          <span>{isUrdu ? 'ڈیش بورڈ پر واپس جائیں' : 'Back to Dashboard'}</span>
        </button>
      </div>

      {/* Main Container Card */}
      <div className="bg-white p-5 sm:p-7 rounded-[28px] shadow-sm border border-[#ecece0] mb-6 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#ecece0] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border border-[#ecece0] p-1 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              <PublicImage
                fileName="gari-hisaab-icon.png"
                alt="Vehicle Account"
                className="w-full h-full object-cover rounded-xl"
                fallbackIcon={<Calculator className="w-6 h-6 text-[#8b9d77]" />}
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#4a4a35]">
                {isUrdu ? 'گاڑی کا تفصیلی حساب و آمدن' : 'Vehicle Trip Account & Income'}
              </h1>
              <p className="text-xs text-[#8e8e75] mt-0.5">
                {isUrdu ? 'کرایہ (آمدن) اور تمام سفری اخراجات درج کر کے خالص بچت کا حساب لگائیں' : 'Record freight earnings, trip expenses, and net profit'}
              </p>
            </div>
          </div>

          {/* Vehicle Selector */}
          <div className="w-full sm:w-auto">
            <label className="block text-[11px] font-bold text-[#8e8e75] mb-1">
              {isUrdu ? 'گاڑی منتخب کریں یا نمبر لکھیں:' : 'Vehicle Reg No:'}
            </label>
            <input
              type="text"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              onFocus={(e) => e.target.select()}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              placeholder="e.g. LHR-7860"
              className="bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3.5 py-2 text-sm font-bold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none w-full sm:w-48 font-mono dir-ltr text-left"
            />
          </div>
        </div>

        {/* SECTION 1: آمدن و کرایہ جات (FREIGHT INCOMES) */}
        <div className="bg-[#f8fbf6] p-4 sm:p-5 rounded-[24px] border-2 border-[#8b9d77]/40 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#8b9d77]/20 text-[#275e23] rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#275e23]">
                {isUrdu ? '1. حاصل شدہ آمدن و کرایہ جات' : '1. Freight Earnings & Incomes'}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddIncome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8b9d77] hover:bg-[#7a8c67] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'نیا کرایہ شامل کریں' : 'Add Income'}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {incomes.map((item, idx) => (
              <div key={item.id} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-white p-2.5 sm:p-3 rounded-2xl border border-[#d8e8d3]">
                <div className="flex-1">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateIncomeLabel(item.id, e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-bold text-[#383827] focus:outline-none px-1"
                    placeholder={`کرایہ ${idx + 1}`}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[#fdfbf7] border border-[#d8e8d3] rounded-xl px-3 py-1.5 focus-within:border-[#8b9d77] w-full sm:w-44">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={item.amount === 0 ? '' : item.amount}
                      onChange={(e) => handleUpdateIncomeAmount(item.id, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="0"
                      className="w-full bg-transparent text-left font-mono font-bold text-sm sm:text-base text-[#1e4620] focus:outline-none dir-ltr"
                    />
                    <span className="text-xs font-mono font-bold text-[#8e8e75] mr-1 select-none">
                      PKR
                    </span>
                  </div>
                  {incomes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveIncome(item.id)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer shrink-0"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-[#d8e8d3] font-bold text-sm sm:text-base text-[#275e23]">
            <span>{isUrdu ? 'کل حاصل شدہ آمدن:' : 'Total Income:'}</span>
            <span className="font-mono text-base sm:text-lg">
              PKR {totalIncome.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* SECTION 2: سفری اخراجات (TRIP EXPENSES) */}
        <div className="bg-[#fdfbf7] p-4 sm:p-5 rounded-[24px] border-2 border-[#ecece0] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#ecece0] text-[#4a4a35] rounded-xl">
                <Receipt className="w-5 h-5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#4a4a35]">
                {isUrdu ? '2. تمام سفری اخراجات کی تفصیل' : '2. Detailed Trip Expenses'}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleAddCustomExpense}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4a4a35] hover:bg-[#383827] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isUrdu ? 'اضافی خرچہ درج کریں' : 'Add Custom'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Diesel */}
            <div className="bg-white p-3 rounded-2xl border border-[#ecece0] space-y-1">
              <label className="block text-xs font-bold text-[#4a4a35]">
                {isUrdu ? '1. ڈیزل خرچہ (ایندھن)' : '1. Diesel Fuel Expense'}
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-1.5 focus-within:border-[#8b9d77]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={diesel === '0' ? '' : diesel}
                  onChange={(e) => setDiesel(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full bg-transparent text-left font-mono font-bold text-sm text-[#4a4a35] focus:outline-none dir-ltr"
                />
                <span className="text-xs font-mono font-bold text-[#8e8e75] mr-1">PKR</span>
              </div>
            </div>

            {/* 2. Toll Plaza */}
            <div className="bg-white p-3 rounded-2xl border border-[#ecece0] space-y-1">
              <label className="block text-xs font-bold text-[#4a4a35]">
                {isUrdu ? '2. ٹول پلازہ موٹروے ٹیکس' : '2. Motorway Toll Plaza'}
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-1.5 focus-within:border-[#8b9d77]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={toll === '0' ? '' : toll}
                  onChange={(e) => setToll(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full bg-transparent text-left font-mono font-bold text-sm text-[#4a4a35] focus:outline-none dir-ltr"
                />
                <span className="text-xs font-mono font-bold text-[#8e8e75] mr-1">PKR</span>
              </div>
            </div>

            {/* 3. Challan */}
            <div className="bg-white p-3 rounded-2xl border border-[#ecece0] space-y-1">
              <label className="block text-xs font-bold text-[#4a4a35]">
                {isUrdu ? '3. ٹریفک چالان و جرمانہ' : '3. Traffic Challan'}
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-1.5 focus-within:border-[#8b9d77]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={challan === '0' ? '' : challan}
                  onChange={(e) => setChallan(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full bg-transparent text-left font-mono font-bold text-sm text-[#4a4a35] focus:outline-none dir-ltr"
                />
                <span className="text-xs font-mono font-bold text-[#8e8e75] mr-1">PKR</span>
              </div>
            </div>

            {/* 4. Roti Kharcha */}
            <div className="bg-white p-3 rounded-2xl border border-[#ecece0] space-y-1">
              <label className="block text-xs font-bold text-[#4a4a35]">
                {isUrdu ? '4. روٹی و خوراک خرچہ' : '4. Food / Daily Allowance'}
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-1.5 focus-within:border-[#8b9d77]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={rotiKharcha === '0' ? '' : rotiKharcha}
                  onChange={(e) => setRotiKharcha(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full bg-transparent text-left font-mono font-bold text-sm text-[#4a4a35] focus:outline-none dir-ltr"
                />
                <span className="text-xs font-mono font-bold text-[#8e8e75] mr-1">PKR</span>
              </div>
            </div>

            {/* 5. Chowkidara / Parking */}
            <div className="bg-white p-3 rounded-2xl border border-[#ecece0] space-y-1">
              <label className="block text-xs font-bold text-[#4a4a35]">
                {isUrdu ? '5. چوکیداری و اڈا پارکنگ' : '5. Parking / Chowkidari'}
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-1.5 focus-within:border-[#8b9d77]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={chowkidara === '0' ? '' : chowkidara}
                  onChange={(e) => setChowkidara(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full bg-transparent text-left font-mono font-bold text-sm text-[#4a4a35] focus:outline-none dir-ltr"
                />
                <span className="text-xs font-mono font-bold text-[#8e8e75] mr-1">PKR</span>
              </div>
            </div>

            {/* 6. Gari Kaam / Repair */}
            <div className="bg-white p-3 rounded-2xl border border-[#ecece0] space-y-1">
              <label className="block text-xs font-bold text-[#4a4a35]">
                {isUrdu ? '6. گاڑی کا کام و مرمت' : '6. Vehicle Repair & Maintenance'}
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-1.5 focus-within:border-[#8b9d77]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={gariKaam === '0' ? '' : gariKaam}
                  onChange={(e) => setGariKaam(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full bg-transparent text-left font-mono font-bold text-sm text-[#4a4a35] focus:outline-none dir-ltr"
                />
                <span className="text-xs font-mono font-bold text-[#8e8e75] mr-1">PKR</span>
              </div>
            </div>

            {/* 7. Driver Commission */}
            <div className="bg-white p-3 rounded-2xl border border-[#ecece0] space-y-1">
              <label className="block text-xs font-bold text-[#4a4a35]">
                {isUrdu ? '7. ڈرائیور کمیشن و اجرت' : '7. Driver Commission'}
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-1.5 focus-within:border-[#8b9d77]">
                <input
                  type="number"
                  inputMode="decimal"
                  value={driverCommission === '0' ? '' : driverCommission}
                  onChange={(e) => setDriverCommission(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full bg-transparent text-left font-mono font-bold text-sm text-[#4a4a35] focus:outline-none dir-ltr"
                />
                <span className="text-xs font-mono font-bold text-[#8e8e75] mr-1">PKR</span>
              </div>
            </div>
          </div>

          {/* Custom Expenses List */}
          {customExpenses.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[#ecece0]">
              <span className="text-xs font-bold text-[#8e8e75] block">
                {isUrdu ? 'اضافی اخراجات:' : 'Custom Additional Expenses:'}
              </span>
              {customExpenses.map((c) => (
                <div key={c.id} className="flex items-center gap-2 bg-white p-2.5 rounded-2xl border border-[#ecece0]">
                  <input
                    type="text"
                    value={c.label}
                    onChange={(e) => handleUpdateCustomLabel(c.id, e.target.value)}
                    className="flex-1 bg-transparent text-xs sm:text-sm font-bold text-[#4a4a35] focus:outline-none"
                    placeholder="خرچہ کا نام"
                  />
                  <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-1 w-32 sm:w-40">
                    <input
                      type="number"
                      inputMode="decimal"
                      value={c.amount === 0 ? '' : c.amount}
                      onChange={(e) => handleUpdateCustomAmount(c.id, e.target.value)}
                      onFocus={(e) => e.target.select()}
                      placeholder="0"
                      className="w-full bg-transparent text-left font-mono font-bold text-sm text-[#4a4a35] focus:outline-none dir-ltr"
                    />
                    <span className="text-xs font-mono font-bold text-[#8e8e75] mr-1">PKR</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomExpense(c.id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#ecece0] font-bold text-sm sm:text-base text-[#4a4a35]">
            <span>{isUrdu ? 'کل سفری اخراجات:' : 'Total Trip Expenses:'}</span>
            <span className="font-mono text-base sm:text-lg">
              PKR {grandTotalExpenses.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* SECTION 3: خالص بچت و منافع SUMMARY CARD */}
        <div className={`p-5 sm:p-6 rounded-[24px] text-white shadow-md transition-all ${
          netProfit >= 0 ? 'bg-[#275e23]' : 'bg-[#c0392b]'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-base sm:text-lg font-bold">
                  {netProfit >= 0
                    ? (isUrdu ? 'خالص بچت و منافع' : 'Net Profit (Earnings - Expenses)')
                    : (isUrdu ? 'خسارہ / بقایا خرچہ' : 'Net Deficit (Expenses exceed Income)')
                  }
                </span>
              </div>
              <p className="text-xs opacity-90 mt-1">
                {isUrdu
                  ? `کل آمدن (PKR ${totalIncome.toLocaleString()}) منفی کل اخراجات (PKR ${grandTotalExpenses.toLocaleString()})`
                  : `Total Income (PKR ${totalIncome.toLocaleString()}) - Total Expenses (PKR ${grandTotalExpenses.toLocaleString()})`
                }
              </p>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-left sm:text-right dir-ltr">
              PKR {Math.abs(netProfit).toLocaleString('en-US')}
            </div>
          </div>
        </div>

        {/* Save confirmation */}
        {savedSuccess && (
          <div className="bg-[#eef4ea] border border-[#8b9d77] text-[#3d5a2d] p-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-[#8b9d77]" />
            <span>{isUrdu ? 'گاڑی کا حساب سفر ڈائری لاگز میں کامیابی سے محفوظ ہو گیا ہے۔' : 'Account log saved to Safar Diary.'}</span>
          </div>
        )}

        {/* SECTION 4: ACTIONS (WhatsApp, PDF, Save, Reset) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* WhatsApp Share */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="py-3 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>{isUrdu ? 'واٹس ایپ رپورٹ' : 'WhatsApp'}</span>
          </button>

          {/* PDF Download */}
          <button
            type="button"
            disabled={isExportingPdf}
            onClick={handleExportPDF}
            className={`py-3 px-3 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
              isExportingPdf ? 'bg-[#4a4a35]/70 opacity-80 cursor-wait' : 'bg-[#4a4a35] hover:bg-[#383827]'
            }`}
          >
            <FileDown className={`w-4 h-4 text-[#8b9d77] ${isExportingPdf ? 'animate-bounce' : ''}`} />
            <span>{isExportingPdf ? (isUrdu ? 'پی ڈی ایف بن رہی ہے...' : 'Generating...') : (isUrdu ? 'پی ڈی ایف لیجر' : 'PDF Ledger')}</span>
          </button>

          {/* Save to Log */}
          <button
            type="button"
            onClick={handleSaveToDiary}
            className="py-3 px-3 bg-white border-2 border-[#8b9d77] text-[#4a4a35] hover:bg-[#eef4ea] rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <BookmarkPlus className="w-4 h-4 text-[#8b9d77]" />
            <span>{isUrdu ? 'ڈائری میں محفوظ' : 'Save Record'}</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="py-3 px-3 bg-white border border-[#ecece0] text-[#8e8e75] hover:bg-[#f6f5ee] rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isUrdu ? 'صاف کریں' : 'Reset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};


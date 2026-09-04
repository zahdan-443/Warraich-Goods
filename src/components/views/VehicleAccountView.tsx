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
  Edit3,
  Sparkles
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { sharePdfFileOrWhatsApp, escapeHtml, sanitizeHtml } from '../../utils/pdfHelper';
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
  const isUrdu = true; // Always display in Urdu as requested by user

  // Vehicle info
  const [vehicleNo, setVehicleNo] = useState<string>('LHR-7860');

  // Incomes (آمدن / کرایہ) - Initialized with 2 clear editable Karaya entries
  const [incomes, setIncomes] = useState<FreightIncome[]>([
    { id: 'income_1', label: 'کرایہ 1 (جانے کا مال / پارٹی)', amount: 0 },
    { id: 'income_2', label: 'کرایہ 2 (واپسی کا مال / پارٹی)', amount: 0 },
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
        label: `کرایہ ${nextIdx} (اضافی پارٹی یا مال)`,
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
    if (incomes.length <= 1) {
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
      { id: newId, label: 'نیا متفرق خرچہ', amount: 0 },
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
      { id: 'income_1', label: 'کرایہ 1 (جانے کا مال / پارٹی)', amount: 0 },
      { id: 'income_2', label: 'کرایہ 2 (واپسی کا مال / پارٹی)', amount: 0 },
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
      window.alert('براہ کرم پہلے گاڑی کی آمدن یا اخراجات درج کریں۔');
      return;
    }

    if (onSaveTrip) {
      const tripRecord = {
        id: `trip_acc_${Date.now()}`,
        vehicleNo: vehicleNo || 'ٹرک',
        from: 'گاڑی حساب',
        to: 'لیجر ریکارڈ',
        date: new Date().toISOString(),
        totalExpenses: grandTotalExpenses,
        totalIncome: totalIncome,
        netProfit: netProfit,
        freightIncomes: incomes,
        expensesBreakdown: {
          diesel: dieselVal,
          toll: tollVal,
          challan: challanVal,
          rotiKharcha: rotiVal,
          chowkidara: chowkidaraVal,
          gariKaam: gariKaamVal,
          driverCommission: commissionVal,
          custom: customExpenses
        }
      };

      onSaveTrip(tripRecord, `گاڑی حساب (${vehicleNo || 'ٹرک'})`);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    }
  };

  const generateAccountPdf = async () => {
    let container: HTMLDivElement | null = null;
    try {
      container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '794px';
      container.style.padding = '36px 40px';
      container.style.backgroundColor = '#ffffff';
      container.style.color = '#1f2937';
      container.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      container.setAttribute('data-pdf-container', 'true');

      const fmt = (num: number) => 'PKR ' + num.toLocaleString('en-US');

      let incomeRowsHtml = '';
      incomes.forEach((inc) => {
        if (inc.amount > 0 || inc.label) {
          incomeRowsHtml += `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; font-weight: bold; color: #166534; text-align: right;">${escapeHtml(inc.label || 'کرایہ')}:</td>
              <td style="padding: 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${fmt(inc.amount || 0)}</td>
            </tr>
          `;
        }
      });

      let customRowsHtml = '';
      customExpenses.forEach((c) => {
        if (c.amount > 0) {
          customRowsHtml += `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 8px; color: #4b5563; font-weight: bold; text-align: right;">${escapeHtml(c.label || 'اضافی خرچہ')}:</td>
              <td style="padding: 8px; font-weight: bold; text-align: left; font-family: sans-serif; direction: ltr;">${fmt(c.amount)}</td>
            </tr>
          `;
        }
      });

      const safeVehicleNo = escapeHtml(vehicleNo || 'ٹرک');
      const safeDate = escapeHtml(new Date().toLocaleDateString('ur-PK'));
      const safeTime = escapeHtml(new Date().toLocaleTimeString('ur-PK'));

      container.innerHTML = sanitizeHtml(`
        <div style="border-bottom: 3px solid #8b9d77; padding-bottom: 16px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: flex-start; direction: rtl;">
          <div style="flex: 1; text-align: right;">
            <div style="margin: 0; font-size: 26px; color: #4a4a35; font-weight: 900; font-family: inherit;">ڈرائیور دوست - گاڑی کا مکمل حساب و لیجر</div>
            <p style="margin: 4px 0 0 0; font-size: 14px; color: #8b9d77; font-weight: bold;">گاڑی کے سفر کا تفصیلی حساب، آمدن، اخراجات و خالص بچت رپورٹ</p>
            
            <div style="margin-top: 10px; background: #fafaf5; border: 1.5px solid #e0e0d0; padding: 8px 14px; border-radius: 10px; font-size: 12px; line-height: 1.6; display: inline-block;">
              <div style="color: #275e23; font-weight: bold;">ڈرائیور دوست وہیکل کھاتہ سسٹم</div>
              <div style="direction: ltr; text-align: right; font-weight: 800; color: #222; font-family: sans-serif;">Smart Vehicle Trip Ledger Pakistan</div>
            </div>
          </div>
          
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; margin-right: 15px;">
            <div style="width: 76px; height: 76px; border-radius: 50%; border: 3px solid #c59b27; background: #ffffff; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.08); text-align: center;">
              <span style="font-size: 24px; line-height: 1;">🚚</span>
              <span style="font-size: 8px; font-weight: 900; color: #4a4a35; font-family: sans-serif; letter-spacing: 0.5px; margin-top: 2px;">DRIVER DOST</span>
            </div>
            <div style="text-align: center; font-size: 11px; color: #555; font-family: sans-serif; direction: ltr;">
              <div><strong>Vehicle:</strong> ${safeVehicleNo}</div>
              <div><strong>Date:</strong> ${safeDate}</div>
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
            <div style="font-weight: bold; color: #374151;">ڈرائیور دوست وہیکل مینجمنٹ و لیجر سسٹم</div>
            <div style="font-style: italic;">یہ کمپیوٹر سے تیار کردہ تصدیق شدہ سسٹمیٹک رسید ہے۔</div>
          </div>
          <div style="text-align: left; direction: ltr; font-family: sans-serif; font-size: 11px;">
            <div><strong>Verified Vehicle:</strong> ${safeVehicleNo}</div>
            <div><strong>Generated:</strong> ${safeTime}</div>
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

      const fileName = `Driver_Dost_Gari_Hisaab_${vehicleNo}_${Date.now()}.pdf`;
      const pdfBlob = pdf.output('blob');
      return { pdf, pdfBlob, fileName };
    } catch (err) {
      console.error('PDF generation failed:', err);
      return null;
    } finally {
      if (container && container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };

  const handleWhatsAppShare = async () => {
    const fmt = (num: number) => 'Rs ' + num.toLocaleString('en-US');
    let msg = `🚛 *ڈرائیور دوست — گاڑی کا مکمل حساب و منافع رپورٹ*\n` +
      `🚗 گاڑی نمبر: ${vehicleNo}\n` +
      `📅 تاریخ: ${new Date().toLocaleDateString('ur-PK')}\n\n` +
      `💵 *حاصل شدہ آمدن و کرایہ جات (Freight Incomes):*\n`;

    incomes.forEach((item) => {
      msg += `• ${item.label}: ${fmt(item.amount || 0)}\n`;
    });
    msg += `👉 *کل حاصل آمدن: ${fmt(totalIncome)}*\n\n`;

    msg += `🧾 *سفری اخراجات تفصیل (Trip Expenses):*\n` +
      `⛽ ڈیزل خرچہ: ${fmt(dieselVal)}\n` +
      `🛣️ ٹول پلازہ و ٹیکس: ${fmt(tollVal)}\n` +
      `🚔 چالان و جرمانہ: ${fmt(challanVal)}\n` +
      `🍲 روٹی و خوراک: ${fmt(rotiVal)}\n` +
      `🛡️ چوکیداری و پارکنگ: ${fmt(chowkidaraVal)}\n` +
      `🔧 گاڑی کام و مرمت: ${fmt(gariKaamVal)}\n` +
      `👨‍✈️ ڈرائیور کمیشن و اجرت: ${fmt(commissionVal)}\n`;

    if (customExpenses.length > 0) {
      customExpenses.forEach((item) => {
        if (item.amount > 0) {
          msg += `• ${item.label}: ${fmt(item.amount)}\n`;
        }
      });
    }

    msg += `👉 *کل کل خرچہ: ${fmt(grandTotalExpenses)}*\n\n`;

    if (netProfit >= 0) {
      msg += `💰 *خالص بچت / نفع (Net Profit): ${fmt(netProfit)}* 🟢\n\n`;
    } else {
      msg += `⚠️ *خسارہ / بقایا خرچہ (Deficit): ${fmt(Math.abs(netProfit))}* 🔴\n\n`;
    }

    msg += `📱 ڈرائیور دوست ایپ (Driver Dost Pakistan)`;

    try {
      const result = await generateAccountPdf();
      if (result) {
        await sharePdfFileOrWhatsApp({
          pdfBlob: result.pdfBlob,
          fileName: result.fileName,
          title: `گاڑی حساب رپورٹ - ${vehicleNo}`,
          textSummary: msg,
        });
        return;
      }
    } catch (e) {
      console.warn('PDF direct share fallback:', e);
    }

    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleExportPDF = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const result = await generateAccountPdf();
      if (result) {
        result.pdf.save(result.fileName);
      } else {
        alert('پی ڈی ایف بنانے میں مسئلہ آیا، دوبارہ کوشش کریں۔');
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('پی ڈی ایف بنانے میں مسئلہ آیا: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-6 md:p-8 max-w-4xl mx-auto w-full font-sans" dir="rtl">
      {/* Top Header with Back to Dashboard Button */}
      <div className="w-full flex items-center justify-between pb-1 mb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#ecece0] p-0.5 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
            <PublicImage
              fileName="gari-hisaab-icon.png"
              alt="Vehicle Trip Account, Ledger and Income Calculator"
              width={40}
              height={40}
              className="w-full h-full object-cover rounded-xl"
              fallbackIcon={<Calculator className="w-5 h-5 text-[#8b9d77]" />}
            />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-[#4a4a35] leading-tight">
              گاڑی کا حساب و منافع لیجر
            </h1>
            <p className="text-[10px] text-[#8e8e75]">
              آمدن، اخراجات اور خالص بچت کا کھاتہ
            </p>
          </div>
        </div>
        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="p-2 bg-white border border-[#ecece0] hover:bg-[#eaeae0] text-[#4a4a35] rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
            title="ڈیش بورڈ پر واپس جائیں"
          >
            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
            <span>ڈیش بورڈ</span>
          </button>
        )}
      </div>

      {/* Main Container Card */}
      <div className="bg-white p-5 sm:p-7 rounded-[28px] shadow-sm border border-[#ecece0] mb-6 space-y-6">
        
        {/* Vehicle Selector bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#ecece0] pb-4">
          <p className="text-xs text-[#8e8e75]">
            گاڑی کے تمام کرایہ جات اور سفری اخراجات درج کر کے خالص بچت کا حساب لگائیں
          </p>

          {/* Vehicle Selector */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <label className="text-xs font-bold text-[#4a4a35] shrink-0">
              گاڑی نمبر (Reg No):
            </label>
            <input
              type="text"
              value={vehicleNo}
              onChange={(e) => setVehicleNo(e.target.value)}
              onFocus={(e) => e.target.select()}
              onClick={(e) => (e.target as HTMLInputElement).select()}
              placeholder="مثلاً: LHR-7860"
              className="bg-[#fdfbf7] border-2 border-[#ecece0] rounded-xl px-3 py-1.5 text-sm font-bold text-[#4a4a35] focus:border-[#8b9d77] focus:outline-none w-full sm:w-44 font-mono dir-ltr text-left"
            />
          </div>
        </div>

        {/* SECTION 1: آمدن و کرایہ جات (FREIGHT INCOMES) - WITH CLEAR EDITABLE BOX */}
        <div className="bg-[#f4f9f1] p-4 sm:p-6 rounded-[24px] border-2 border-emerald-600/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-emerald-600/15 text-emerald-800 rounded-xl">
                <Wallet className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-emerald-900">
                  1. حاصل شدہ آمدن و کرایہ جات
                </h2>
                <p className="text-[11px] text-emerald-700 font-medium">
                  ہر پارٹی، مال یا چکر کا کرایہ اور نام الگ الگ درج کریں
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddIncome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ نیا کرایہ شامل کریں</span>
            </button>
          </div>

          {/* List of Incomes with Prominent Editable Freight Name Box */}
          <div className="space-y-3">
            {incomes.map((item, idx) => (
              <div 
                key={item.id} 
                className="bg-white p-3.5 sm:p-4 rounded-2xl border-2 border-emerald-500/30 shadow-xs space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  
                  {/* EDITABLE FREIGHT NAME INPUT BOX */}
                  <div className="sm:col-span-7 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>کرایہ / مال / پارٹی کا نام:</span>
                      </label>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                        کلک کر کے نام تبدیل کریں
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleUpdateIncomeLabel(item.id, e.target.value)}
                        className="w-full bg-[#fdfbf7] border-2 border-emerald-600/30 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-[#2d3748] focus:outline-none transition-all shadow-2xs"
                        placeholder={`مثلاً: کرایہ ${idx + 1} (لاہور تا کراچی سیمنٹ)`}
                      />
                    </div>
                  </div>

                  {/* FREIGHT AMOUNT INPUT BOX */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-xs font-bold text-emerald-900 block">
                      کرایہ رقم (PKR):
                    </label>
                    <div className="flex items-center bg-[#fdfbf7] border-2 border-emerald-600/30 hover:border-emerald-600 focus-within:border-emerald-600 focus-within:bg-white rounded-xl px-3 py-2 transition-all shadow-2xs">
                      <input
                        type="number"
                        inputMode="decimal"
                        value={item.amount === 0 ? '' : item.amount}
                        onChange={(e) => handleUpdateIncomeAmount(item.id, e.target.value)}
                        onFocus={(e) => e.target.select()}
                        placeholder="0"
                        className="w-full bg-transparent text-left font-mono font-bold text-sm sm:text-base text-emerald-900 focus:outline-none dir-ltr"
                      />
                      <span className="text-xs font-mono font-bold text-emerald-700 mr-1 select-none">
                        PKR
                      </span>
                    </div>
                  </div>

                  {/* DELETE BUTTON */}
                  <div className="sm:col-span-1 flex justify-end sm:justify-center pt-1 sm:pt-5">
                    {incomes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveIncome(item.id)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                        title="حذف کریں"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>

          {/* Income Total Bar */}
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-emerald-600/20 font-bold text-sm sm:text-base text-emerald-900">
            <span>کل حاصل شدہ آمدن و کرایہ جات:</span>
            <span className="font-mono text-base sm:text-lg text-emerald-800 dir-ltr">
              PKR {totalIncome.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* SECTION 2: سفری اخراجات (TRIP EXPENSES) */}
        <div className="bg-[#fdfbf7] p-4 sm:p-6 rounded-[24px] border-2 border-[#ecece0] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-[#ecece0] text-[#4a4a35] rounded-xl">
                <Receipt className="w-5 h-5 text-[#4a4a35]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#4a4a35]">
                  2. تمام سفری اخراجات کی تفصیل
                </h2>
                <p className="text-[11px] text-[#8e8e75] font-medium">
                  ڈیزل، ٹول پلازہ، چالان، روٹی، مرمت اور ڈرائیور کمیشن درج کریں
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddCustomExpense}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#4a4a35] hover:bg-[#383827] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ اضافی خرچہ شامل کریں</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Diesel */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#ecece0] space-y-1">
              <label className="block text-xs font-bold text-[#4a4a35]">
                1. ڈیزل خرچہ (ایندھن / فیول)
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-2 focus-within:border-[#8b9d77]">
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
            <div className="bg-white p-3.5 rounded-2xl border border-[#ecece0] space-y-1">
              <label className="block text-xs font-bold text-[#4a4a35]">
                2. ٹول پلازہ و موٹروے ٹیکس
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-2 focus-within:border-[#8b9d77]">
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
            <div className="bg-white p-3.5 rounded-2xl border border-[#ecece0] space-y-1">
              <label className="block text-xs font-bold text-[#4a4a35]">
                3. ٹریفک چالان و جرمانہ
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-2 focus-within:border-[#8b9d77]">
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
            <div className="bg-white p-3.5 rounded-2xl border border-[#ecece0] space-y-1">
              <label className="block text-xs font-bold text-[#4a4a35]">
                4. روٹی، خوراک و روزانہ الاؤنس
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-2 focus-within:border-[#8b9d77]">
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
            <div className="bg-white p-3.5 rounded-2xl border border-[#ecece0] space-y-1">
              <label className="block text-xs font-bold text-[#4a4a35]">
                5. اڈا چوکیداری و پارکنگ فیس
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-2 focus-within:border-[#8b9d77]">
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
            <div className="bg-white p-3.5 rounded-2xl border border-[#ecece0] space-y-1">
              <label className="block text-xs font-bold text-[#4a4a35]">
                6. گاڑی کا کام، مرمت و مستری خرچہ
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-2 focus-within:border-[#8b9d77]">
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
            <div className="bg-white p-3.5 rounded-2xl border border-[#ecece0] space-y-1 sm:col-span-2">
              <label className="block text-xs font-bold text-[#4a4a35]">
                7. ڈرائیور کمیشن و اجرت
              </label>
              <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-2 focus-within:border-[#8b9d77]">
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
                اضافی اخراجات (Custom Expenses):
              </span>
              {customExpenses.map((c) => (
                <div key={c.id} className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-[#ecece0]">
                  <input
                    type="text"
                    value={c.label}
                    onChange={(e) => handleUpdateCustomLabel(c.id, e.target.value)}
                    className="flex-1 bg-transparent text-xs sm:text-sm font-bold text-[#4a4a35] focus:outline-none px-1"
                    placeholder="خرچہ کا نام (مثلاً: پینچر، وائرنگ، وغیرہ)"
                  />
                  <div className="flex items-center bg-[#fdfbf7] border border-[#ecece0] rounded-xl px-3 py-1.5 w-36 sm:w-44">
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
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                    title="حذف کریں"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Total Expenses Bar */}
          <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#ecece0] font-bold text-sm sm:text-base text-[#4a4a35]">
            <span>کل سفری اخراجات:</span>
            <span className="font-mono text-base sm:text-lg dir-ltr">
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
                <TrendingUp className="w-5 h-5 text-amber-300" />
                <span className="text-base sm:text-lg font-bold">
                  {netProfit >= 0 ? 'خالص بچت و منافع (Net Profit)' : 'خسارہ / بقایا خرچہ (Net Deficit)'}
                </span>
              </div>
              <p className="text-xs opacity-90 mt-1">
                کل حاصل شدہ آمدن (PKR {totalIncome.toLocaleString()}) منفی کل سفری اخراجات (PKR {grandTotalExpenses.toLocaleString()})
              </p>
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-left sm:text-right dir-ltr">
              PKR {Math.abs(netProfit).toLocaleString('en-US')}
            </div>
          </div>
        </div>

        {/* Save confirmation */}
        {savedSuccess && (
          <div className="bg-[#eef4ea] border border-[#8b9d77] text-[#3d5a2d] p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-2xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-[#8b9d77]" />
            <span>گاڑی کا حساب سفر ڈائری لاگز میں کامیابی سے محفوظ ہو گیا ہے۔</span>
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
            <span>واٹس ایپ رسید</span>
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
            <FileDown className={`w-4 h-4 text-amber-300 ${isExportingPdf ? 'animate-bounce' : ''}`} />
            <span>{isExportingPdf ? 'پی ڈی ایف بن رہی ہے...' : 'پی ڈی ایف ڈاؤنلوڈ'}</span>
          </button>

          {/* Save to Log */}
          <button
            type="button"
            onClick={handleSaveToDiary}
            className="py-3 px-3 bg-white border-2 border-[#8b9d77] text-[#4a4a35] hover:bg-[#eef4ea] rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <BookmarkPlus className="w-4 h-4 text-[#8b9d77]" />
            <span>ڈائری میں محفوظ</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="py-3 px-3 bg-white border border-[#ecece0] text-[#8e8e75] hover:bg-[#f6f5ee] rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>خانے خالی کریں</span>
          </button>
        </div>
      </div>
    </div>
  );
};

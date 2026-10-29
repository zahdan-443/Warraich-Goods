import React, { useState, useEffect, useMemo } from 'react';
import { CustomExpense, FreightIncome, Language, Vehicle, Trip, CashEntry } from '../../types';
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
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowDownLeft,
  ArrowUpRight,
  X,
  FileText,
  TrendingDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { sharePdfFileOrWhatsApp, escapeHtml, sanitizeHtml } from '../../utils/pdfHelper';
import { validateVehicleAccountFinancials } from '../../utils/calculator';
import {
  getAllCashEntries,
  getCashEntries,
  saveOrUpdateCashEntry,
  deleteCashEntry,
  calculateDayCashSummary,
  calculateVehicleProfitLoss,
  evaluateArithmetic
} from '../../utils/ledgerStorage';

interface VehicleAccountViewProps {
  lang: Language;
  vehicles?: Vehicle[];
  trips?: Trip[];
  onNavigate: (tab: any) => void;
  onSaveTrip?: (tripObj: any, tripName: string) => void;
}

export const VehicleAccountView: React.FC<VehicleAccountViewProps> = ({
  lang,
  vehicles = [],
  trips = [],
  onNavigate,
  onSaveTrip,
}) => {
  const isUrdu = lang === 'ur';

  // Sub-tabs: 'gari_hisaab' (گاڑی کا حساب) | 'pnl' (گاڑی P&L) | 'roznamcha' (روزنامچہ)
  const [activeSubTab, setActiveSubTab] = useState<'gari_hisaab' | 'pnl' | 'roznamcha'>('gari_hisaab');

  // Vehicle info
  const [vehicleNo, setVehicleNo] = useState<string>('LHR-7860');

  // Incomes (آمدن / کرایہ) - Initialized with 2 clear editable Karaya entries
  const [incomes, setIncomes] = useState<FreightIncome[]>(() => [
    { id: 'income_1', label: lang === 'ur' ? 'کرایہ 1 (جانے کا مال / پارٹی)' : 'Freight 1 (Outbound Cargo / Party)', amount: 0 },
    { id: 'income_2', label: lang === 'ur' ? 'کرایہ 2 (واپسی کا مال / پارٹی)' : 'Freight 2 (Return Cargo / Party)', amount: 0 },
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
  const [copyToast, setCopyToast] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Fleet P&L Filter States
  const [pnlVehicle, setPnlVehicle] = useState<string>('all');
  const [pnlMonth, setPnlMonth] = useState<string>('all');

  // Roznamcha (Cashbook) States
  const [allCash, setAllCash] = useState<CashEntry[]>([]);
  const [selectedCashDate, setSelectedCashDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [showAddCashModal, setShowAddCashModal] = useState<'in' | 'out' | null>(null);
  const [editingCashEntry, setEditingCashEntry] = useState<CashEntry | null>(null);

  const reloadCashData = () => {
    setAllCash(getAllCashEntries());
  };

  useEffect(() => {
    reloadCashData();
  }, []);

  const addAmount = (setter: React.Dispatch<React.SetStateAction<string>>, current: string, delta: number) => {
    const val = parseFloat(current) || 0;
    setter(String(val + delta));
  };

  const addIncomeAmount = (id: string, delta: number) => {
    setIncomes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount: (Number(item.amount) || 0) + delta } : item))
    );
  };

  // Add Income entry
  const handleAddIncome = () => {
    const nextIdx = incomes.length + 1;
    setIncomes((prev) => [
      ...prev,
      {
        id: `income_${Date.now()}`,
        label: isUrdu ? `کرایہ ${nextIdx} (اضافی پارٹی یا مال)` : `Freight ${nextIdx} (Extra Party or Cargo)`,
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
      { id: newId, label: isUrdu ? 'نیا متفرق خرچہ' : 'Custom Expense', amount: 0 },
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
    setFormError(null);
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
      setFormError(finValidation.error || 'براہ کرم گاڑی کے درست اور مثبت اخراجات درج کریں۔');
      return;
    }

    if (grandTotalExpenses <= 0 && totalIncome <= 0) {
      setFormError('براہ کرم پہلے گاڑی کی آمدن یا اخراجات درج کریں۔');
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

  const buildWhatsAppMsg = () => {
    const fmt = (num: number) => 'Rs ' + num.toLocaleString('en-US');
    let msg = `🚚 *وارائچ گڈز ٹرانسپورٹ کمپنی*\n` +
      `📋 *گاڑی کا تفصیلی حساب و لیجر رپورٹ*\n` +
      `─────────────────────\n` +
      `🚛 *گاڑی نمبر:* ${vehicleNo || 'نامعلوم'}\n` +
      `📅 *تاریخ:* ${new Date().toLocaleDateString('ur-PK')}\n\n` +
      `*【 حاصل شدہ آمدن و کرایہ جات 】*\n`;

    incomes.forEach((item, idx) => {
      if (item.amount > 0 || item.label) {
        msg += `💵 ${item.label || `کرایہ ${idx + 1}`}: ${fmt(item.amount || 0)}\n`;
      }
    });
    msg += `👉 *کل حاصل آمدن:* ${fmt(totalIncome)}\n\n`;

    msg += `*【 سفری اخراجات کی تفصیل 】*\n` +
      `⛽ ڈیزل خرچہ: ${fmt(dieselVal)}\n` +
      `🛣️ ٹول پلازہ و ٹیکس: ${fmt(tollVal)}\n` +
      `🚔 چالان و جرمانہ: ${fmt(challanVal)}\n` +
      `🍲 روٹی و خوراک الاؤنس: ${fmt(rotiVal)}\n` +
      `🛡️ چوکیداری و اڈا پرچی: ${fmt(chowkidaraVal)}\n` +
      `🔧 گاڑی کام و مرمت: ${fmt(gariKaamVal)}\n` +
      `👨‍✈️ ڈرائیور کمیشن و اجرت: ${fmt(commissionVal)}\n`;

    if (customExpenses.length > 0) {
      customExpenses.forEach((item) => {
        if (item.amount > 0) {
          msg += `🔧 ${item.label || 'اضافی خرچہ'}: ${fmt(item.amount)}\n`;
        }
      });
    }

    msg += `─────────────────────\n` +
      `🧾 *کل سفری اخراجات:* ${fmt(grandTotalExpenses)}\n` +
      (netProfit >= 0
        ? `🟢 *خالص بچت و منافع (Net Profit):* ${fmt(netProfit)}\n`
        : `🔴 *خسارہ / بقایا خرچہ:* ${fmt(Math.abs(netProfit))}\n`) +
      `─────────────────────\n` +
      `📱 *ڈرائیور دوست ایپ (Driver Dost Pakistan)*`;
    return msg;
  };

  const handleQuickWhatsAppText = () => {
    const msg = buildWhatsAppMsg();
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

  const handleExportPDF = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    setPdfError(null);
    try {
      const result = await generateAccountPdf();
      if (result) {
        result.pdf.save(result.fileName);
      } else {
        setPdfError('پی ڈی ایف بنانے میں مسئلہ آیا، دوبارہ کوشش کریں۔');
      }
    } catch (err) {
      console.error('PDF export failed:', err);
      setPdfError('پی ڈی ایف بنانے میں مسئلہ آیا: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Roznamcha (Cashbook) summary
  const dayCashSummary = useMemo(() => {
    return calculateDayCashSummary(selectedCashDate, allCash);
  }, [selectedCashDate, allCash]);

  const selectedDayCashList = useMemo(() => {
    return getCashEntries(selectedCashDate);
  }, [selectedCashDate, allCash]);

  // Fleet P&L calculations
  const vehicleOptions = Array.from(
    new Set([
      ...vehicles.map(v => v.reg).filter(Boolean),
      ...trips.map(t => (t as any).vehicleNo).filter(Boolean)
    ])
  );

  const monthOptions = Array.from(
    new Set(trips.map(t => t.month).filter(Boolean))
  );

  const fleetPnl = calculateVehicleProfitLoss(
    pnlVehicle,
    pnlMonth,
    undefined,
    undefined,
    trips
  );

  const profitMargin =
    fleetPnl.totalIncome > 0
      ? ((fleetPnl.netProfit / fleetPnl.totalIncome) * 100).toFixed(1)
      : '0.0';

  return (
    <div className={`flex-1 p-3 sm:p-5 md:p-6 pb-28 md:pb-16 max-w-4xl mx-auto w-full font-sans ${isUrdu ? 'text-right' : 'text-left'}`} dir={isUrdu ? 'rtl' : 'ltr'}>
      {/* Top Header with Icon */}
      <div className="w-full flex items-center justify-between pb-2 mb-3 shrink-0 border-b border-[#ecece0]">
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
            <h1 className="text-base sm:text-lg font-bold text-[#4a4a35] leading-tight">
              {isUrdu ? 'گاڑی کا حساب و روزنامچہ' : 'Vehicle Account & Roznamcha'}
            </h1>
            <p className="text-xs text-[#8e8e75]">
              {isUrdu ? 'گاڑی نفع و نقصان اور روزانہ کیش آمدن و خرچہ' : 'Vehicle P&L and daily cash income/expense ledger'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Page Three Tabs: گاڑی کا حساب | گاڑی P&L | روزنامچہ */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#f0f0e4] mb-4 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveSubTab('gari_hisaab')}
          className={`flex-1 py-2.5 px-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'gari_hisaab'
              ? 'bg-white text-[#4a4a35] shadow-md border border-[#e2e2d5]'
              : 'text-[#8e8e75] hover:text-[#4a4a35]'
          }`}
        >
          <Calculator className="w-4 h-4 text-[#8b9d77]" />
          <span>{isUrdu ? 'گاڑی کا حساب' : 'Vehicle Trip Account'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('pnl')}
          className={`flex-1 py-2.5 px-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'pnl'
              ? 'bg-white text-[#4a4a35] shadow-md border border-[#e2e2d5]'
              : 'text-[#8e8e75] hover:text-[#4a4a35]'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>{isUrdu ? 'گاڑی P&L' : 'Vehicle P&L'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('roznamcha')}
          className={`flex-1 py-2.5 px-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'roznamcha'
              ? 'bg-white text-[#4a4a35] shadow-md border border-[#e2e2d5]'
              : 'text-[#8e8e75] hover:text-[#4a4a35]'
          }`}
        >
          <Wallet className="w-4 h-4 text-blue-600" />
          <span>{isUrdu ? 'روزنامچہ' : 'Roznamcha'}</span>
        </button>
      </div>

      {/* TAB 1: گاڑی کا حساب */}
      {activeSubTab === 'gari_hisaab' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-bold p-3 rounded-2xl text-center shadow-2xs">
              {formError}
            </div>
          )}

          {pdfError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold p-3 rounded-2xl text-center shadow-2xs">
              {pdfError}
            </div>
          )}

          {/* Fleet Vehicles P&L Overview (If trips recorded) */}
          {trips.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-[24px] shadow-sm border border-[#ecece0] space-y-3.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-[#ecece0] pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#8b9d77]" />
                  <h3 className="text-sm sm:text-base font-bold text-[#4a4a35]">
                    {isUrdu ? 'فلیٹ گاڑیوں کا نفع و نقصان (Fleet P&L Summary)' : 'Fleet Vehicles P&L Summary'}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={pnlVehicle}
                    onChange={e => setPnlVehicle(e.target.value)}
                    className="py-1.5 px-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-xl text-xs font-bold text-[#4a4a35] focus:outline-none"
                  >
                    <option value="all">{isUrdu ? 'تمام گاڑیاں' : 'All Fleet Vehicles'}</option>
                    {vehicleOptions.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>

                  <select
                    value={pnlMonth}
                    onChange={e => setPnlMonth(e.target.value)}
                    className="py-1.5 px-2.5 bg-[#fdfbf7] border border-[#ecece0] rounded-xl text-xs font-bold text-[#4a4a35] focus:outline-none"
                  >
                    <option value="all">{isUrdu ? 'تمام مہینے' : 'All Months'}</option>
                    {monthOptions.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 3 Overview Chips */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-[#f4f9f1] p-3 rounded-2xl border border-emerald-600/20">
                  <span className="text-xs text-emerald-800 font-bold block">{isUrdu ? 'کل آمدن' : 'Revenue'}</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-emerald-900 dir-ltr">
                    PKR {fleetPnl.totalIncome.toLocaleString('en-US')}
                  </span>
                </div>

                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200">
                  <span className="text-xs text-rose-800 font-bold block">{isUrdu ? 'کل اخراجات' : 'Expenses'}</span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-rose-900 dir-ltr">
                    PKR {fleetPnl.totalExpenses.toLocaleString('en-US')}
                  </span>
                </div>

                <div className={`p-3 rounded-2xl border text-white ${fleetPnl.isProfit ? 'bg-[#275e23] border-[#275e23]' : 'bg-[#c0392b] border-[#c0392b]'}`}>
                  <span className="text-xs font-bold block">{fleetPnl.isProfit ? (isUrdu ? 'خالص منافع' : 'Profit') : (isUrdu ? 'خسارہ' : 'Deficit')}</span>
                  <span className="text-xs sm:text-sm font-bold font-mono dir-ltr">
                    PKR {Math.abs(fleetPnl.netProfit).toLocaleString('en-US')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Single Trip Financial Account Form Container Card */}
          <div className="bg-white dark:bg-[#1a1b15] p-4 sm:p-6 rounded-[28px] shadow-sm border border-[#ecece0] dark:border-[#3d3e33] space-y-5">
            {/* Vehicle Selector bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#ecece0] dark:border-[#3d3e33] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8b9d77]"></span>
                <span className="text-xs font-bold text-[#4a4a35] dark:text-[#f8fafc]">
                  {isUrdu ? 'گاڑی کا انتخاب اور کرایہ / خرچہ کھاتہ' : 'Select Vehicle and Ledger Entries'}
                </span>
              </div>

              {/* Vehicle Selector */}
              <div className="w-full sm:w-auto flex items-center gap-2">
                <label className="text-xs font-bold text-[#4a4a35] dark:text-[#f8fafc] shrink-0">
                  {isUrdu ? 'گاڑی نمبر (Reg No):' : 'Vehicle Reg No:'}
                </label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  onFocus={(e) => e.target.select()}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  placeholder={isUrdu ? 'مثلاً: LHR-7860' : 'e.g. LHR-7860'}
                  className="bg-[#fdfbf7] dark:bg-[#181913] border-2 border-[#ecece0] dark:border-[#48493b] rounded-xl px-3 py-1.5 text-sm font-bold text-[#4a4a35] dark:text-[#f8fafc] focus:border-[#8b9d77] focus:outline-none w-full sm:w-44 font-mono dir-ltr text-left"
                />
              </div>
            </div>

            {/* SECTION 1: آمدن و کرایہ جات (FREIGHT INCOMES) */}
            <div className="bg-[#f4f9f1] dark:bg-[#122319] p-4 sm:p-6 rounded-[24px] border-2 border-emerald-600/30 dark:border-emerald-700/60 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-emerald-600/15 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 rounded-xl">
                    <Wallet className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-emerald-900 dark:text-emerald-100">
                      {isUrdu ? '1. حاصل شدہ آمدن و کرایہ جات' : '1. Freight Earnings & Incomes'}
                    </h2>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                      {isUrdu ? 'ہر پارٹی، مال یا چکر کا کرایہ اور نام الگ الگ درج کریں' : 'Record separate freight contracts and trip legs'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddIncome}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUrdu ? '+ نیا کرایہ شامل کریں' : '+ Add Freight Income'}</span>
                </button>
              </div>

              {/* List of Incomes */}
              <div className="space-y-3">
                {incomes.map((item, idx) => (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#1a1b15] p-3.5 sm:p-4 rounded-2xl border-2 border-emerald-500/30 dark:border-emerald-700/60 shadow-xs space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      <div className="sm:col-span-7 space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                            <Edit3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>{isUrdu ? 'کرایہ / مال / پارٹی کا نام:' : 'Freight / Cargo / Party Name:'}</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleUpdateIncomeLabel(item.id, e.target.value)}
                          className="w-full bg-[#fdfbf7] dark:bg-[#181913] border-2 border-emerald-600/30 dark:border-emerald-700/60 hover:border-emerald-600 focus:border-emerald-600 focus:bg-white dark:focus:bg-[#181913] rounded-xl px-3.5 py-2 text-xs sm:text-sm font-bold text-[#2d3748] dark:text-[#f8fafc] focus:outline-none transition-all shadow-2xs"
                          placeholder={isUrdu ? `مثلاً: کرایہ ${idx + 1} (لاہور تا کراچی سیمنٹ)` : `e.g. Freight ${idx + 1} (Cement Load)`}
                        />
                      </div>

                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                          {isUrdu ? 'کرایہ رقم (PKR):' : 'Freight Amount (PKR):'}
                        </label>
                        <div className="flex items-center bg-[#fdfbf7] dark:bg-[#181913] border-2 border-emerald-600/30 dark:border-emerald-700/60 hover:border-emerald-600 focus-within:border-emerald-600 focus-within:bg-white dark:focus-within:bg-[#181913] rounded-xl px-3 py-2 transition-all shadow-2xs">
                          <input
                            type="number"
                            inputMode="decimal"
                            value={item.amount === 0 ? '' : item.amount}
                            onChange={(e) => handleUpdateIncomeAmount(item.id, e.target.value)}
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                            className="w-full bg-transparent text-left font-mono font-bold text-sm sm:text-base text-emerald-900 dark:text-emerald-100 focus:outline-none dir-ltr"
                          />
                          <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 mr-1 select-none">
                            PKR
                          </span>
                        </div>
                      </div>

                      <div className="sm:col-span-1 flex justify-end sm:justify-center pt-1 sm:pt-5">
                        {incomes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveIncome(item.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl transition-all cursor-pointer"
                            title={isUrdu ? 'حذف کریں' : 'Remove'}
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
                <span>{isUrdu ? 'کل حاصل شدہ آمدن و کرایہ جات:' : 'Total Freight Earnings:'}</span>
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
                      {isUrdu ? '2. تمام سفری اخراجات کی تفصیل' : '2. Detailed Trip Expenses'}
                    </h2>
                    <p className="text-xs text-[#8e8e75] font-medium">
                      {isUrdu ? 'ڈیزل، ٹول پلازہ، چالان، روٹی، مرمت اور ڈرائیور کمیشن درج کریں' : 'Fuel, motorway tolls, fines, driver meals, repairs & commission'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddCustomExpense}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#4a4a35] hover:bg-[#383827] text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isUrdu ? '+ اضافی خرچہ شامل کریں' : '+ Add Custom Expense'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Diesel */}
                <div className="bg-white p-3.5 rounded-2xl border border-[#ecece0] space-y-1">
                  <label className="block text-xs font-bold text-[#4a4a35]">
                    {isUrdu ? '1. ڈیزل خرچہ (ایندھن / فیول)' : '1. Diesel Fuel Expense'}
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
                    {isUrdu ? '2. ٹول پلازہ و موٹروے ٹیکس' : '2. Toll Plaza & Motorway Tax'}
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
                    {isUrdu ? '3. ٹریفک چالان و جرمانہ' : '3. Traffic Challan & Penalties'}
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
                    {isUrdu ? '4. روٹی، خوراک و روزانہ الاؤنس' : '4. Driver Meals & Daily Allowance'}
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
                    {isUrdu ? '5. اڈا چوکیداری و پارکنگ فیس' : '5. Parking & Terminal Chowkidari'}
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
                    {isUrdu ? '6. گاڑی کا کام، مرمت و مستری خرچہ' : '6. Vehicle Maintenance & Repairs'}
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
                    {isUrdu ? '7. ڈرائیور کمیشن و اجرت' : '7. Driver Commission / Wages'}
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
                    {isUrdu ? 'اضافی اخراجات (Custom Expenses):' : 'Custom Trip Expenses:'}
                  </span>
                  {customExpenses.map((c) => (
                    <div key={c.id} className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-[#ecece0]">
                      <input
                        type="text"
                        value={c.label}
                        onChange={(e) => handleUpdateCustomLabel(c.id, e.target.value)}
                        className="flex-1 bg-transparent text-xs sm:text-sm font-bold text-[#4a4a35] focus:outline-none px-1"
                        placeholder={isUrdu ? 'خرچہ کا نام (مثلاً: پینچر، وائرنگ)' : 'Expense title'}
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
                        title={isUrdu ? 'حذف کریں' : 'Remove'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Expenses Bar */}
              <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#ecece0] font-bold text-sm sm:text-base text-[#4a4a35]">
                <span>{isUrdu ? 'کل سفری اخراجات:' : 'Total Trip Expenses:'}</span>
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
                      {netProfit >= 0
                        ? (isUrdu ? 'خالص بچت و منافع (Net Profit)' : 'Net Profit (Earnings)')
                        : (isUrdu ? 'خسارہ / بقایا خرچہ (Net Deficit)' : 'Net Deficit (Loss)')}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mt-1">
                    {isUrdu
                      ? `کل حاصل شدہ آمدن (PKR ${totalIncome.toLocaleString()}) منفی کل سفری اخراجات (PKR ${grandTotalExpenses.toLocaleString()})`
                      : `Total Freight Revenue (PKR ${totalIncome.toLocaleString()}) minus Total Trip Expenses (PKR ${grandTotalExpenses.toLocaleString()})`}
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
                <span>{isUrdu ? 'گاڑی کا حساب سفر ڈائری لاگز میں کامیابی سے محفوظ ہو گیا ہے۔' : 'Vehicle trip account has been saved to Safar Diary logs.'}</span>
              </div>
            )}

            {/* Copy toast */}
            {copyToast && (
              <div className="bg-emerald-50 border-2 border-emerald-400 text-emerald-950 p-3.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{isUrdu ? 'واٹس ایپ ٹیکسٹ میسج کاپی ہو گیا اور واٹس ایپ اوپن ہو رہا ہے! 📲' : 'WhatsApp report copied and WhatsApp opening! 📲'}</span>
              </div>
            )}

            {/* SECTION 4: ACTIONS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleQuickWhatsAppText}
                className="min-h-[48px] py-2.5 px-3 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>{isUrdu ? 'واٹس ایپ میسج 📲' : 'WhatsApp 📲'}</span>
              </button>

              <button
                type="button"
                disabled={isExportingPdf}
                onClick={handleExportPDF}
                className={`min-h-[48px] py-2.5 px-3 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 ${
                  isExportingPdf ? 'bg-[#4a4a35]/70 opacity-80 cursor-wait' : 'bg-[#4a4a35] hover:bg-[#383827]'
                }`}
              >
                <FileDown className={`w-4 h-4 text-amber-300 ${isExportingPdf ? 'animate-bounce' : ''}`} />
                <span>{isExportingPdf ? (isUrdu ? 'پی ڈی ایف بن رہی ہے...' : 'Generating...') : (isUrdu ? 'پی ڈی ایف رسید 📄' : 'PDF Ledger 📄')}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToDiary}
                className="min-h-[48px] py-2.5 px-3 bg-white border-2 border-[#8b9d77] text-[#4a4a35] hover:bg-[#eef4ea] rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BookmarkPlus className="w-4 h-4 text-[#8b9d77]" />
                <span>{isUrdu ? 'ڈائری محفوظ 💾' : 'Save Diary 💾'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="min-h-[48px] py-2.5 px-3 bg-white border border-[#ecece0] text-[#8e8e75] hover:bg-[#f6f5ee] rounded-2xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{isUrdu ? 'خانے خالی کریں' : 'Reset All'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: گاڑی P&L */}
      {activeSubTab === 'pnl' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          <div className="bg-white p-4 sm:p-5 rounded-[24px] shadow-sm border border-[#ecece0] space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#ecece0] pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h2 className="text-base sm:text-lg font-bold text-[#4a4a35]">
                  {isUrdu ? 'گاڑی نفع و نقصان کھاتہ (Vehicle P&L Statement)' : 'Vehicle Profit & Loss Statement'}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={pnlVehicle}
                  onChange={e => setPnlVehicle(e.target.value)}
                  className="py-2 px-3 bg-[#fdfbf7] border border-[#ecece0] rounded-xl text-xs font-bold text-[#4a4a35] focus:outline-none"
                >
                  <option value="all">{isUrdu ? 'تمام گاڑیاں' : 'All Fleet Vehicles'}</option>
                  {vehicleOptions.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>

                <select
                  value={pnlMonth}
                  onChange={e => setPnlMonth(e.target.value)}
                  className="py-2 px-3 bg-[#fdfbf7] border border-[#ecece0] rounded-xl text-xs font-bold text-[#4a4a35] focus:outline-none"
                >
                  <option value="all">{isUrdu ? 'تمام مہینے' : 'All Months'}</option>
                  {monthOptions.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* P&L Performance Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
                <span className="text-xs text-emerald-800 font-bold block">{isUrdu ? 'کل درآمدات / آمدن' : 'Total Revenue'}</span>
                <span className="text-sm sm:text-base font-black font-mono text-emerald-900 dir-ltr">
                  PKR {fleetPnl.totalIncome.toLocaleString('en-US')}
                </span>
              </div>

              <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-200">
                <span className="text-xs text-rose-800 font-bold block">{isUrdu ? 'کل اخراجات' : 'Total Expenses'}</span>
                <span className="text-sm sm:text-base font-black font-mono text-rose-900 dir-ltr">
                  PKR {fleetPnl.totalExpenses.toLocaleString('en-US')}
                </span>
              </div>

              <div className={`p-3.5 rounded-2xl border text-white ${fleetPnl.isProfit ? 'bg-[#275e23] border-[#275e23]' : 'bg-[#c0392b] border-[#c0392b]'}`}>
                <span className="text-xs font-bold block">{fleetPnl.isProfit ? (isUrdu ? 'خالص منافع' : 'Net Profit') : (isUrdu ? 'خسارہ' : 'Net Deficit')}</span>
                <span className="text-sm sm:text-base font-black font-mono dir-ltr">
                  PKR {Math.abs(fleetPnl.netProfit).toLocaleString('en-US')}
                </span>
              </div>

              <div className="bg-[#f0f0e4] p-3.5 rounded-2xl border border-[#ecece0]">
                <span className="text-xs text-[#4a4a35] font-bold block">{isUrdu ? 'پرافٹ مارجن (%)' : 'Profit Margin (%)'}</span>
                <span className="text-sm sm:text-base font-black font-mono text-[#4a4a35]">
                  {profitMargin}%
                </span>
              </div>
            </div>

            {/* Detailed Expense Breakdown in P&L */}
            <div className="pt-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#4a4a35] mb-2.5">
                {isUrdu ? 'اخراجات کی زمرہ وار تفصیل (Category-wise Expenses):' : 'Category-wise Expenses:'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="bg-[#fdfbf7] p-2.5 rounded-xl border border-[#ecece0]">
                  <span className="text-[#8e8e75] block">{isUrdu ? 'ڈیزل' : 'Fuel'}</span>
                  <span className="font-bold font-mono text-[#4a4a35]">PKR {(fleetPnl.dieselCost || 0).toLocaleString()}</span>
                </div>
                <div className="bg-[#fdfbf7] p-2.5 rounded-xl border border-[#ecece0]">
                  <span className="text-[#8e8e75] block">{isUrdu ? 'ٹول' : 'Tolls'}</span>
                  <span className="font-bold font-mono text-[#4a4a35]">PKR {(fleetPnl.tollCost || 0).toLocaleString()}</span>
                </div>
                <div className="bg-[#fdfbf7] p-2.5 rounded-xl border border-[#ecece0]">
                  <span className="text-[#8e8e75] block">{isUrdu ? 'ڈرائیور الاؤنس' : 'Driver Allowance'}</span>
                  <span className="font-bold font-mono text-[#4a4a35]">PKR {(fleetPnl.driverCost || 0).toLocaleString()}</span>
                </div>
                <div className="bg-[#fdfbf7] p-2.5 rounded-xl border border-[#ecece0]">
                  <span className="text-[#8e8e75] block">{isUrdu ? 'دیگر اخراجات' : 'Other Expenses'}</span>
                  <span className="font-bold font-mono text-[#4a4a35]">PKR {(fleetPnl.otherCost || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: روزنامچہ (ROZNAMCHA / CASHBOOK) */}
      {activeSubTab === 'roznamcha' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Date Selector Navigation */}
          <div className="bg-white rounded-2xl p-2.5 sm:p-3 border border-[#ecece0] flex items-center justify-between gap-2 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                const d = new Date(selectedCashDate);
                d.setDate(d.getDate() - 1);
                setSelectedCashDate(d.toISOString().split('T')[0]);
              }}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#fdfbf7] text-[#4a4a35] border border-[#ecece0] active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <input
                type="date"
                value={selectedCashDate}
                onChange={e => setSelectedCashDate(e.target.value)}
                className="bg-transparent font-black text-xs sm:text-sm text-[#4a4a35] focus:outline-none"
              />
              {selectedCashDate !== new Date().toISOString().split('T')[0] && (
                <button
                  type="button"
                  onClick={() => setSelectedCashDate(new Date().toISOString().split('T')[0])}
                  className="text-xs px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold active:scale-95 cursor-pointer"
                >
                  {isUrdu ? 'آج' : 'Today'}
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const d = new Date(selectedCashDate);
                d.setDate(d.getDate() + 1);
                setSelectedCashDate(d.toISOString().split('T')[0]);
              }}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl bg-[#fdfbf7] text-[#4a4a35] border border-[#ecece0] active:scale-95 transition-all cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Cash Summary Card */}
          <div className="bg-white rounded-[24px] sm:rounded-3xl p-4 sm:p-5 border border-[#ecece0] shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-3 rounded-2xl bg-[#fdfbf7] border border-[#ecece0]">
                <span className="text-xs text-[#8e8e75] font-bold block mb-0.5">
                  {isUrdu ? 'اوپننگ بیلنس' : 'Opening Cash'}
                </span>
                <span className="text-xs sm:text-sm font-black text-[#4a4a35]">
                  PKR {dayCashSummary.openingBalance.toLocaleString('en-US')}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-xs text-emerald-700 font-bold block mb-0.5">
                  {isUrdu ? 'کل کیش ان (+)' : 'Cash In (+)'}
                </span>
                <span className="text-xs sm:text-sm font-black text-emerald-600">
                  + PKR {dayCashSummary.totalIn.toLocaleString('en-US')}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200">
                <span className="text-xs text-rose-700 font-bold block mb-0.5">
                  {isUrdu ? 'کل کیش آؤٹ (-)' : 'Cash Out (-)'}
                </span>
                <span className="text-xs sm:text-sm font-black text-rose-600">
                  - PKR {dayCashSummary.totalOut.toLocaleString('en-US')}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#f0f0e4]">
                <span className="text-xs text-[#4a4a35] font-bold block mb-0.5">
                  {isUrdu ? 'کلوزنگ بیلنس' : 'Closing Cash'}
                </span>
                <span className="text-xs sm:text-sm font-black text-[#4a4a35]">
                  PKR {dayCashSummary.closingBalance.toLocaleString('en-US')}
                </span>
              </div>
            </div>

            {/* Two Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-3.5 pt-3 border-t border-[#ecece0]">
              <button
                type="button"
                onClick={() => {
                  setEditingCashEntry(null);
                  setShowAddCashModal('in');
                }}
                className="min-h-[48px] py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>{isUrdu ? 'کیش ان (آمدن)' : 'Cash In (+)'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingCashEntry(null);
                  setShowAddCashModal('out');
                }}
                className="min-h-[48px] py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-md shadow-rose-600/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>{isUrdu ? 'کیش آؤٹ (خرچہ)' : 'Cash Out (-)'}</span>
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-[24px] sm:rounded-3xl p-4 sm:p-5 border border-[#ecece0] shadow-sm">
            <h3 className="text-xs sm:text-sm font-extrabold text-[#4a4a35] mb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? `روزنامچہ اندراج برائے: ${selectedCashDate}` : `Cash Entries for ${selectedCashDate}`}</span>
            </h3>

            {selectedDayCashList.length === 0 ? (
              <div className="text-center py-8 text-[#8e8e75] text-xs">
                {isUrdu ? 'آج کے دن کا کوئی کیش اندراج نہیں ہے۔ اوپر بٹن دبا کر اندراج کریں۔' : 'No cash entries for this date. Use Cash In / Cash Out buttons above.'}
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDayCashList.map(entry => {
                  const isIn = entry.type === 'in';
                  return (
                    <div
                      key={entry.id}
                      className="min-h-[56px] flex items-center justify-between p-3 rounded-2xl bg-[#fdfbf7] border border-[#ecece0]"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isIn ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                          }`}
                        >
                          {isIn ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#4a4a35] capitalize">
                            {entry.category || (isIn ? 'Cash In' : 'Expense')}
                          </span>
                          {entry.note && (
                            <p className="text-xs text-[#8e8e75] mt-0.5 truncate">
                              {entry.note}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`text-sm font-black ${isIn ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isIn ? '+' : '-'} PKR {entry.amount.toLocaleString('en-US')}
                        </div>
                        <div className="flex items-center justify-end gap-3 mt-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCashEntry(entry);
                              setShowAddCashModal(entry.type);
                            }}
                            className="text-xs text-[#8e8e75] hover:text-[#4a4a35] font-semibold p-1 cursor-pointer"
                          >
                            {isUrdu ? 'تبدیل' : 'Edit'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              deleteCashEntry(entry.id);
                              reloadCashData();
                            }}
                            className="text-xs text-rose-500 hover:text-rose-700 font-semibold p-1 cursor-pointer"
                          >
                            {isUrdu ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cash Modal for Roznamcha */}
      {showAddCashModal && (
        <CashFormModal
          isOpen={Boolean(showAddCashModal)}
          onClose={() => {
            setShowAddCashModal(null);
            setEditingCashEntry(null);
          }}
          type={showAddCashModal}
          initialDate={selectedCashDate}
          initialEntry={editingCashEntry}
          lang={lang}
          onSaved={() => {
            setShowAddCashModal(null);
            setEditingCashEntry(null);
            reloadCashData();
          }}
        />
      )}
    </div>
  );
};

// =========================================================================
// SUB-COMPONENT: CASH FORM MODAL FOR ROZNAMCHA
// =========================================================================
interface CashFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'in' | 'out';
  initialDate: string;
  initialEntry: CashEntry | null;
  lang: Language;
  onSaved: (entry: CashEntry) => void;
}

const CashFormModal: React.FC<CashFormModalProps> = ({
  isOpen,
  onClose,
  type,
  initialDate,
  initialEntry,
  lang,
  onSaved,
}) => {
  const isUrdu = lang === 'ur';
  const isIn = type === 'in';

  const [amountStr, setAmountStr] = useState(
    initialEntry?.amount ? String(initialEntry.amount) : ''
  );
  const [date, setDate] = useState(initialEntry?.date || initialDate);
  const [category, setCategory] = useState(initialEntry?.category || (isIn ? 'advance' : 'fuel'));
  const [note, setNote] = useState(initialEntry?.note || '');

  const evaluatedAmount = useMemo(() => {
    return evaluateArithmetic(amountStr);
  }, [amountStr]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = evaluatedAmount ?? Number(amountStr);
    if (!finalAmount || finalAmount <= 0) return;

    const saved = saveOrUpdateCashEntry({
      id: initialEntry?.id,
      type,
      amount: finalAmount,
      date,
      category,
      note: note.trim()
    });
    onSaved(saved);
  };

  if (!isOpen) return null;

  const categories = [
    { id: 'fuel', icon: '⛽', ur: 'ڈیزل', en: 'Fuel' },
    { id: 'toll', icon: '🛣️', ur: 'ٹول', en: 'Toll' },
    { id: 'maintenance', icon: '🔧', ur: 'مرمت', en: 'Repair' },
    { id: 'food', icon: '☕', ur: 'کھانا', en: 'Food' },
    { id: 'kharcha', icon: '👤', ur: 'خرچہ', en: 'Kharcha' },
    { id: 'challan', icon: '📄', ur: 'چالان', en: 'Challan' },
    { id: 'advance', icon: '💸', ur: 'ایڈوانس', en: 'Advance' },
    { id: 'other', icon: '📦', ur: 'دیگر', en: 'Other' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-t-[28px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#ecece0] pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-3 sm:hidden" />

        <div className="flex items-center justify-between mb-3.5">
          <h3
            className={`text-base sm:text-lg font-black flex items-center gap-2 ${
              isIn ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isIn ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            <span>{isIn ? (isUrdu ? 'کیش ان (آمدن)' : 'Cash In (+)') : (isUrdu ? 'کیش آؤٹ (خرچہ)' : 'Cash Out (-)')}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#4a4a35]">
                {isUrdu ? 'رقم درج کریں' : 'Amount (PKR)'}
              </label>
              {evaluatedAmount !== null && (
                <span className="text-xs font-black text-emerald-600">
                  = PKR {evaluatedAmount.toLocaleString('en-US')}
                </span>
              )}
            </div>
            <input
              type="text"
              required
              autoFocus
              value={amountStr}
              onChange={e => setAmountStr(e.target.value)}
              placeholder="0"
              className="w-full min-h-[48px] px-4 py-2.5 rounded-2xl bg-[#fdfbf7] border-2 border-[#ecece0] text-base sm:text-lg font-mono font-bold text-[#4a4a35] focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#4a4a35] block mb-1.5">
              {isUrdu ? 'کیٹگری منتخب کریں' : 'Select Category'}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  className={`min-h-[44px] py-2 px-1.5 rounded-2xl text-xs font-bold flex flex-col items-center justify-center transition-all active:scale-95 cursor-pointer ${
                    category === c.id
                      ? 'bg-[#4a4a35] text-white shadow-md'
                      : 'bg-[#fdfbf7] text-[#4a4a35] border border-[#ecece0]'
                  }`}
                >
                  <span className="text-sm">{c.icon}</span>
                  <span className="text-xs mt-0.5 truncate">{isUrdu ? c.ur : c.en}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#4a4a35] block mb-1">
              {isUrdu ? 'تاریخ' : 'Date'}
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] text-sm text-[#4a4a35] focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#4a4a35] block mb-1">
              {isUrdu ? 'تفصیل' : 'Description'}
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={isUrdu ? 'تفصیل لکھیں...' : 'Enter details...'}
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-2xl bg-[#fdfbf7] border border-[#ecece0] text-sm text-[#4a4a35] focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[50px] flex-1 py-3 rounded-2xl bg-[#f0f0e4] text-[#4a4a35] font-extrabold text-xs active:scale-95 cursor-pointer"
            >
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!amountStr.trim() || evaluatedAmount === null || evaluatedAmount <= 0}
              className={`min-h-[50px] flex-1 py-3 rounded-2xl text-white font-extrabold text-xs shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer ${
                isIn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isUrdu ? 'محفوظ کریں' : 'Save Cash Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

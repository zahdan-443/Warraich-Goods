import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  Droplets, 
  Ban, 
  Gauge, 
  Clock, 
  PlusCircle, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Language } from '../../types';
import { 
  RouteHazardSummary, 
  HazardCategory, 
  HAZARD_CATEGORIES, 
  formatTimeAgo 
} from '../../utils/hazardReports';

interface RouteHazardAdvisoryBannerProps {
  lang: Language;
  summaries: RouteHazardSummary[];
  onOpenReportModal: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const RouteHazardAdvisoryBanner: React.FC<RouteHazardAdvisoryBannerProps> = ({
  lang,
  summaries,
  onOpenReportModal,
  onRefresh,
  isRefreshing = false
}) => {
  const isUrdu = lang === 'ur';

  const renderIcon = (cat: HazardCategory) => {
    switch (cat) {
      case 'checkpoint':
        return <ShieldAlert className="w-4 h-4 text-blue-600" />;
      case 'flooding':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'accident':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'closure':
        return <Ban className="w-4 h-4 text-amber-600" />;
      case 'traffic':
        return <Gauge className="w-4 h-4 text-purple-600" />;
    }
  };

  const formatHazardText = (summary: RouteHazardSummary) => {
    const meta = HAZARD_CATEGORIES[summary.category] || HAZARD_CATEGORIES.traffic;
    const timeAgo = formatTimeAgo(summary.latestTimestamp, lang);
    const catName = isUrdu ? meta.labelUr : meta.labelEn;
    const city = summary.cityNear || (isUrdu ? 'ہائی وے' : 'Highway');

    if (summary.count > 1) {
      return isUrdu 
        ? `${city} کے قریب ${catName} کی ${summary.count} رپورٹس (${timeAgo})` 
        : `${summary.count} reports of ${meta.labelEn.toLowerCase()} near ${city} (${timeAgo})`;
    }

    return isUrdu 
      ? `${city} کے قریب ${catName} رپورٹ ہوا (${timeAgo})` 
      : `${meta.labelEn} reported near ${city} (${timeAgo})`;
  };

  if (summaries.length === 0) {
    return (
      <div 
        className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        dir={isUrdu ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <p className="font-bold text-emerald-950">
              {isUrdu ? 'روٹ پر کوئی خطرہ یا رکاوٹ رپورٹ نہیں ہے' : 'No active road hazards reported along this corridor'}
            </p>
            <p className="text-[11px] text-emerald-800/80">
              {isUrdu 
                ? 'گزشتہ 24 گھنٹوں میں موٹروے/ہائی وے ٹریفک معمول کے مطابق ہے۔' 
                : 'Corridor traffic and checkpoints clear over the past 24 hours.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenReportModal}
          className="self-start sm:self-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isUrdu ? 'خطرہ رپورٹ کریں' : 'Report Hazard'}</span>
        </button>
      </div>
    );
  }

  const totalReportsCount = summaries.reduce((sum, s) => sum + s.count, 0);

  return (
    <div 
      className="p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 shadow-xs space-y-3"
      dir={isUrdu ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs shrink-0 animate-pulse">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-xs sm:text-sm text-amber-950">
                {isUrdu ? 'روٹ پر لائیو خطرات کی رپورٹس' : 'Active Road Hazard Alerts on Corridor'}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                {totalReportsCount} {isUrdu ? 'رپورٹس' : (totalReportsCount === 1 ? 'alert' : 'alerts')}
              </span>
            </div>
            <p className="text-[11px] text-amber-800">
              {isUrdu 
                ? 'ساتھی ٹرانسپورٹرز اور ڈرائیورز کی جانب سے درج کردہ تصدیقی معلومات' 
                : 'Crowd-sourced reports submitted by fellow transporters and drivers'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
              title={isUrdu ? 'تازہ ترین رپورٹس لوڈ کریں' : 'Refresh hazard alerts'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          <button
            type="button"
            onClick={onOpenReportModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 min-h-[40px] rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{isUrdu ? 'رپورٹ کریں' : 'Report'}</span>
          </button>
        </div>
      </div>

      {/* Hazard Items List */}
      <div className="space-y-2">
        {summaries.map((summary, idx) => {
          const meta = HAZARD_CATEGORIES[summary.category] || HAZARD_CATEGORIES.traffic;

          return (
            <div
              key={`${summary.category}-${summary.cityNear}-${idx}`}
              className="p-2.5 sm:p-3 rounded-xl bg-white/90 border border-amber-200/80 shadow-2xs flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg ${meta.badgeBg} flex items-center justify-center shrink-0 border ${meta.badgeBorder}`}>
                  {renderIcon(summary.category)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-900 truncate">
                    {formatHazardText(summary)}
                  </p>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span>{formatTimeAgo(summary.latestTimestamp, lang)}</span>
                    {summary.count > 1 && (
                      <span className="font-semibold text-amber-700 ml-1">
                        • {summary.count} {isUrdu ? 'مختلف ڈرائیوروں کی تصدیق' : 'reports'}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText} border`}>
                {isUrdu ? meta.labelUr : meta.labelEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

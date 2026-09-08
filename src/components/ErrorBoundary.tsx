import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, Trash2, Home, AlertOctagon } from 'lucide-react';
import { logError } from '../utils/storage';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    console.error('Driver Dost React ErrorBoundary caught an error:', error, errorInfo);
    try {
      logError('ErrorBoundary Catch', error, { componentStack: errorInfo?.componentStack });
    } catch {
      // Ignore fallback log error
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearCacheAndReload = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Clear non-essential cached session states to resolve corrupted data
        window.localStorage.removeItem('ah-calendar-events');
        window.localStorage.removeItem('wg_cached_highway_weather');
        window.localStorage.removeItem('ah-prefill-toll-calc');
      }
    } catch {
      // ignore
    }
    window.location.href = window.location.origin + window.location.pathname;
  };

  private handleGoHome = () => {
    try {
      window.history.pushState({ tab: 'home' }, '', '#home');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isUrdu = typeof document !== 'undefined' && document.documentElement.lang === 'ur';

      return (
        <div className="min-h-screen bg-[#fdfbf7] text-[#4a4a35] flex flex-col items-center justify-center p-6 font-sans text-center" dir={isUrdu ? 'rtl' : 'ltr'}>
          <div className="bg-white p-8 sm:p-10 rounded-[36px] shadow-lg border-2 border-red-200 max-w-lg w-full space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 border border-red-200 rounded-3xl flex items-center justify-center mx-auto shadow-2xs">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#4a4a35]">
                {isUrdu ? 'ایپ میں عارضی مسئلہ آیا ہے' : 'An Unexpected Error Occurred'}
              </h1>
              <p className="text-xs sm:text-sm text-[#8e8e75] leading-relaxed">
                {isUrdu
                  ? 'سسٹم نے ایک غیر متوقع ایرر کو محفوظ طریقے سے روک لیا ہے۔ آپ کا تمام محفوظ ریکارڈ (حساب و بلٹی) محفوظ ہے۔'
                  : 'The app encountered an unhandled exception. Your saved records remain safe in device memory.'}
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[#fdfbf7] border border-[#ecece0] rounded-2xl p-3 text-left font-mono text-[11px] text-red-800 overflow-x-auto max-h-28 dir-ltr">
                {this.state.error.toString()}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 px-3 rounded-2xl bg-[#8b9d77] hover:bg-[#7a8c66] text-white text-xs font-bold font-serif transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                <span>{isUrdu ? 'دوبارہ لوڈ کریں' : 'Reload App'}</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="w-full py-3 px-3 rounded-2xl bg-[#4a4a35] hover:bg-[#383827] text-white text-xs font-bold font-serif transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Home className="w-3.5 h-3.5 shrink-0" />
                <span>{isUrdu ? 'ڈیش بورڈ' : 'Go Home'}</span>
              </button>

              <button
                type="button"
                onClick={this.handleClearCacheAndReload}
                className="w-full py-3 px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold font-serif transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5 shrink-0 text-amber-700" />
                <span>{isUrdu ? 'کیش ریسٹور' : 'Clear Cache'}</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

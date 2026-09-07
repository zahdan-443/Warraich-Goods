import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  ShieldCheck,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { Language } from '../types';
import { ChatMessage, sendAiChatMessage } from '../utils/aiAdvisor';

interface AiAdvisorChatProps {
  lang: Language;
  userEmail?: string | null;
}

export const AiAdvisorChat: React.FC<AiAdvisorChatProps> = ({ lang, userEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUrdu = lang === 'ur';

  // Initial welcome greeting
  useEffect(() => {
    const welcomeMsg: ChatMessage = {
      id: 'welcome',
      role: 'model',
      text: isUrdu
        ? 'السلام علیکم محترم ڈرائیور دوست! میں آپ کا ذاتی ٹرانسپورٹ اسسٹنٹ ہوں۔ آپ مجھ سے اپنے ٹرپ اخراجات، ڈیزل حساب، بلٹی ریکارڈ یا سفر کے روٹس کے بارے میں کچھ بھی پوچھ سکتے ہیں۔'
        : 'Assalam-o-Alaikum! I am Driver Dost AI, your road freight and trip advisor. Ask me about your trip expenses, diesel calculations, bilty records, or Pakistan route advice.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMsg]);
  }, [lang, isUrdu]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 250);
      setHasUnread(false);
    }
  }, [isOpen, isMinimized]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await sendAiChatMessage({
        message: query,
        lang,
        history: newHistory,
        userEmail
      });

      const aiMsg: ChatMessage = {
        id: `model_${Date.now()}`,
        role: 'model',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'model',
        text: isUrdu
          ? 'معذرت، رابطہ میں کچھ دشواری پیش آئی ہے۔ براہ کرم دوبارہ کوشش کریں۔'
          : 'Sorry, communication failed. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    const freshWelcome: ChatMessage = {
      id: `welcome_${Date.now()}`,
      role: 'model',
      text: isUrdu
        ? 'چیٹ ری سیٹ ہو گئی۔ میں آپ کی کیا مدد کر سکتا ہوں؟'
        : 'Chat cleared. How can I assist you with your trips or transport operations today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([freshWelcome]);
  };

  // Quick Suggestion Chips (As requested)
  const suggestionChips = [
    {
      id: 'trip_cost',
      labelUr: 'ٹرپ خرچہ معلوم کریں',
      labelEn: 'Trip cost nikalain',
      prompt: isUrdu
        ? 'میرے حالیہ ٹرپ کے اخراجات اور بچت کا خلاصہ بتائیں۔'
        : 'Calculate my recent trip cost and net earnings summary.'
    },
    {
      id: 'bilties',
      labelUr: 'میری بلٹیاں دیکھیں',
      labelEn: 'Meri bilties dekhain',
      prompt: isUrdu
        ? 'میرے ریکارڈ میں محفوظ بلٹیوں کا اسٹیٹس اور بقایا کرایہ بتائیں۔'
        : 'Show me summary of my saved bilties and pending payable balance.'
    },
    {
      id: 'fuel',
      labelUr: 'ڈیزل اخراجات کا خلاصہ',
      labelEn: 'Fuel expense summary',
      prompt: isUrdu
        ? 'آج کے ڈیزل ریٹ اور میری گاڑیوں کے فیول اخراجات کا حساب بتائیں۔'
        : 'Give me fuel expense summary and today\'s diesel rate.'
    },
    {
      id: 'route',
      labelUr: 'روٹ مشورہ',
      labelEn: 'Route advice',
      prompt: isUrdu
        ? 'لاہور تا کراچی اور موٹروے پر محفوظ سفر کے لیے ٹول اور روٹ مشورہ دیں۔'
        : 'Give route advice, motorway M-Tag, and distance tips.'
    }
  ];

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right, always visible across every screen) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center">
          <button
            type="button"
            id="driver-dost-ai-trigger"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#162a4d] text-white rounded-full shadow-2xl hover:bg-[#0f1f38] active:scale-95 transition-all border border-[#c59b27]/40 cursor-pointer"
            aria-label={isUrdu ? 'ڈرائیور دوست AI چیٹ اسسٹنٹ کھولیں' : 'Open Driver Dost AI Advisor'}
          >
            {/* Pulsing indicator */}
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c59b27] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#c59b27] border-2 border-white"></span>
              </span>
            )}

            <div className="w-8 h-8 rounded-full bg-[#c59b27] flex items-center justify-center text-[#162a4d] shadow-sm">
              <Sparkles className="w-4 h-4 fill-current animate-pulse" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold font-serif tracking-wide text-amber-200">
                Driver Dost AI
              </span>
              <span className="text-[10px] text-slate-300 font-sans -mt-0.5">
                {isUrdu ? 'مفت اسسٹنٹ' : 'Free Advisor'}
              </span>
            </div>
          </button>
        </div>
      )}

      {/* Slide-Up Chat Panel */}
      {isOpen && (
        <div
          id="driver-dost-ai-panel"
          dir={isUrdu ? 'rtl' : 'ltr'}
          className={`fixed z-50 transition-all duration-300 ease-in-out shadow-2xl bg-white border border-[#c59b27]/30 flex flex-col ${
            isMinimized
              ? 'bottom-4 right-4 sm:right-6 w-72 sm:w-80 h-14 rounded-2xl overflow-hidden'
              : 'bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[420px] h-[85vh] sm:h-[600px] max-h-[92vh] rounded-t-3xl sm:rounded-3xl overflow-hidden'
          }`}
        >
          {/* Header */}
          <div className="bg-[#162a4d] px-4 py-3 text-white flex items-center justify-between shrink-0 border-b border-[#c59b27]/20 select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-[#c59b27] flex items-center justify-center text-[#162a4d] shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#162a4d] rounded-full"></span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold font-serif text-amber-200 leading-tight">
                    {isUrdu ? 'ڈرائیور دوست AI' : 'Driver Dost AI'}
                  </span>
                  <span className="text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                    Free
                  </span>
                </div>
                <span className="text-[10px] text-slate-300">
                  {isUrdu ? 'آن لائن • نجی ٹرانسپورٹ مشیر' : 'Online • Personal Freight Advisor'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-300">
              <button
                type="button"
                onClick={clearChat}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title={isUrdu ? 'چیٹ صاف کریں' : 'Clear chat'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                title={isMinimized ? (isUrdu ? 'بڑا کریں' : 'Maximize') : (isUrdu ? 'چھوٹا کریں' : 'Minimize')}
              >
                <ChevronDown className={`w-4 h-4 transform transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                title={isUrdu ? 'بند کریں' : 'Close'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body when not minimized */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#fdfbf7]">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isUser ? (isUrdu ? 'flex-row' : 'flex-row-reverse') : (isUrdu ? 'flex-row-reverse' : 'flex-row')}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                          isUser
                            ? 'bg-[#0f2942] text-amber-200'
                            : 'bg-[#c59b27] text-[#162a4d]'
                        }`}
                      >
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed ${
                          isUser
                            ? 'bg-[#162a4d] text-white rounded-br-none shadow-sm'
                            : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-xs'
                        }`}
                        style={{
                          fontFamily: isUrdu
                            ? "'Noto Nastaliq Urdu', 'Noto Sans Arabic', Arial, sans-serif"
                            : "'Plus Jakarta Sans', sans-serif",
                          lineHeight: isUrdu ? '1.8' : '1.5'
                        }}
                      >
                        <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                        <div
                          className={`text-[9px] mt-1 text-right ${
                            isUser ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {isLoading && (
                  <div
                    className={`flex items-end gap-2 ${isUrdu ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className="w-7 h-7 rounded-full bg-[#c59b27] text-[#162a4d] flex items-center justify-center shrink-0 shadow-xs">
                      <Bot className="w-3.5 h-3.5 animate-bounce" />
                    </div>
                    <div className="bg-white border border-slate-200 px-3.5 py-2.5 rounded-2xl rounded-bl-none shadow-xs flex items-center gap-1.5 text-xs text-slate-500">
                      <span className="w-1.5 h-1.5 bg-[#c59b27] rounded-full animate-pulse"></span>
                      <span className="w-1.5 h-1.5 bg-[#c59b27] rounded-full animate-pulse delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-[#c59b27] rounded-full animate-pulse delay-200"></span>
                      <span className="text-[11px] text-slate-500 mr-1">
                        {isUrdu ? 'ڈرائیور دوست جواب تیار کر رہا ہے...' : 'Driver Dost AI is thinking...'}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggestion Chips */}
              <div className="px-3 py-2 bg-[#f6f2e9] border-t border-[#ecece0] overflow-x-auto no-scrollbar flex items-center gap-1.5">
                {suggestionChips.map(chip => (
                  <button
                    key={chip.id}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleSend(chip.prompt)}
                    className="shrink-0 text-[11px] font-medium bg-white hover:bg-amber-50 active:scale-95 text-[#162a4d] border border-amber-300/60 rounded-full px-2.5 py-1 transition-all shadow-2xs hover:border-[#c59b27] cursor-pointer disabled:opacity-50 whitespace-nowrap"
                  >
                    ✨ {isUrdu ? chip.labelUr : chip.labelEn}
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="p-2.5 sm:p-3 bg-white border-t border-slate-200">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      isUrdu
                        ? 'اپنا سوال یا ٹرپ کے بارے میں پوچھیں...'
                        : 'Ask about trips, fuel, bilty or route...'
                    }
                    disabled={isLoading}
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#c59b27] focus:ring-1 focus:ring-[#c59b27] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-[#162a4d] text-amber-300 flex items-center justify-center hover:bg-[#0f1f38] active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none shadow-xs cursor-pointer shrink-0"
                    title={isUrdu ? 'پیغام بھیجیں' : 'Send message'}
                  >
                    <Send className={`w-4 h-4 ${isUrdu ? 'rotate-180' : ''}`} />
                  </button>
                </form>

                <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    {isUrdu ? 'محفوظ و نجی ڈیٹا' : 'Private & Isolated Data'}
                  </span>
                  <span>
                    Powered by Gemini Flash
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

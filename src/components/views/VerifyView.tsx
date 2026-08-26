import React from 'react';
import { DICTIONARY, Language } from '../../types';
import { ShieldCheck, ExternalLink, Building2, Car, CreditCard, AlertTriangle } from 'lucide-react';

interface VerifyViewProps {
  lang: Language;
}

export const VerifyView: React.FC<VerifyViewProps> = ({ lang }) => {
  const t = DICTIONARY[lang].verify;

  const portals = [
    {
      id: 'mtmis',
      title: t.mtmis.title,
      sub: t.mtmis.sub,
      steps: [t.mtmis.s1, t.mtmis.s2, t.mtmis.s3],
      url: 'https://mtmis.excise.punjab.gov.pk',
      icon: <Car className="w-6 h-6 text-[#3B82F6]" />,
      badgeBg: 'bg-[#3B82F6]/15 border-[#3B82F6]/30 text-[#2563EB]'
    },
    {
      id: 'dlims',
      title: t.dlims.title,
      sub: t.dlims.sub,
      steps: [t.dlims.s1, t.dlims.s2, t.dlims.s3],
      url: 'https://dlims.punjab.gov.pk/verify',
      icon: <CreditCard className="w-6 h-6 text-[#10B981]" />,
      badgeBg: 'bg-[#10B981]/15 border-[#10B981]/30 text-[#059669]'
    },
    {
      id: 'challan',
      title: t.challan.title,
      sub: t.challan.sub,
      steps: [t.challan.s1, t.challan.s2, t.challan.s3],
      url: 'https://echallan.psca.gop.pk',
      icon: <AlertTriangle className="w-6 h-6 text-[#EF4444]" />,
      badgeBg: 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#DC2626]'
    }
  ];

  const handleLaunch = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto w-full space-y-8">
      
      <div className="bg-white p-8 md:p-10 rounded-[40px] shadow-sm border border-[#ecece0] space-y-8">
        <header className="border-b border-[#ecece0] pb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#4a4a35]">
              {t.title}
            </h1>
            <p className="text-sm text-[#8e8e75] font-sans mt-1">
              {t.subtitle}
            </p>
          </div>
          <div className="w-12 h-12 bg-[#f0f0e4] rounded-full flex items-center justify-center text-[#5a5a40] shrink-0">
            <Building2 className="w-6 h-6 text-[#8b9d77]" />
          </div>
        </header>

        <div className="space-y-6">
          {portals.map((p) => (
            <div
              key={p.id}
              className="p-8 rounded-3xl bg-[#fdfbf7] border border-[#ecece0] hover:border-[#8b9d77] transition-all space-y-6 shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl border ${p.badgeBg} bg-white shadow-2xs shrink-0`}>
                      {p.icon}
                    </div>
                    <div>
                      <span className="inline-block px-3 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#8b9d77]/15 text-[#5a5a40] mb-1.5 font-mono">
                        🏛️ {t.officialBadge}
                      </span>
                      <h3 className="font-serif font-bold text-2xl text-[#4a4a35] group-hover:text-[#8b9d77] transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-[#8e8e75] font-sans font-medium">{p.sub}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-[#ecece0]">
                  <ul className="space-y-2.5">
                    {p.steps.map((stepText, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs text-[#8e8e75] leading-relaxed font-sans">
                        <span className="w-5 h-5 rounded-full bg-white border border-[#ecece0] flex items-center justify-center text-[10px] font-mono font-bold text-[#5a5a40] shrink-0 mt-0.5 shadow-2xs">
                          {idx + 1}
                        </span>
                        <span className="text-[#4a4a35] font-medium">{stepText}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleLaunch(p.url)}
                  className="px-6 py-3.5 bg-[#5a5a40] hover:bg-[#4a4a35] text-white rounded-full font-medium text-xs uppercase tracking-widest shadow-xs transition-all active:scale-98 cursor-pointer flex items-center gap-2 group-hover:bg-[#8b9d77]"
                >
                  <span>{t.openBtn}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#f0f0e4]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

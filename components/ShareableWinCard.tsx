
import React from 'react';
import { Sparkles, Quote, Star, Zap } from 'lucide-react';

interface ShareableWinCardProps {
  win: string;
  reflection: string;
  identityTitle: string;
  dreamTitle: string;
  theme?: 'light' | 'dark';
}

const ShareableWinCard: React.FC<ShareableWinCardProps> = ({ 
  win, 
  reflection, 
  identityTitle, 
  dreamTitle,
  theme = 'light' 
}) => {
  return (
    <div className={`aspect-square w-full max-w-[400px] relative overflow-hidden rounded-[3rem] shadow-2xl border-4 ${theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-white bg-background'} noise-texture p-10 flex flex-col justify-between transition-all duration-500`}>
      {/* Decorative Elements */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-cta/10 rounded-full blur-[80px]" />
      
      {/* Header */}
      <div className="z-10 flex justify-between items-start">
        <div className="flex flex-col">
          <span className={`text-[10px] font-black uppercase tracking-[0.5em] ${theme === 'dark' ? 'text-white/30' : 'text-charcoal/20'}`}>
            Manifestation Documented
          </span>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-primary font-black italic text-sm">{identityTitle}</span>
            <div className="w-1 h-1 rounded-full bg-primary/40" />
          </div>
        </div>
        <Zap className="w-6 h-6 text-primary fill-primary opacity-20" />
      </div>

      {/* Main Content */}
      <div className="z-10 space-y-6">
        <div className="relative">
          <Quote className="absolute -top-8 -left-6 w-12 h-12 text-primary/10" strokeWidth={1} />
          <h2 className={`text-3xl font-bold italic leading-tight tracking-tight ${theme === 'dark' ? 'text-white' : 'text-charcoal'}`}>
            "{win}"
          </h2>
        </div>
        
        <div className="space-y-2">
          <p className={`text-xs font-medium leading-relaxed italic ${theme === 'dark' ? 'text-white/50' : 'text-charcoal/50'}`}>
            Towards: {dreamTitle}
          </p>
          <div className={`p-5 rounded-3xl border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/60 border-white'} glass-silk`}>
             <p className={`text-[13px] leading-relaxed font-semibold italic ${theme === 'dark' ? 'text-white/70' : 'text-charcoal/70'}`}>
               "{reflection}"
             </p>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="z-10 flex items-center justify-between pt-4 border-t border-charcoal/5 dark:border-white/5">
        <div className="flex flex-col">
          <h4 className={`text-lg font-black italic tracking-tighter ${theme === 'dark' ? 'text-white' : 'text-charcoal'}`}>
            She Goes
          </h4>
          <span className={`text-[8px] font-bold uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-white/20' : 'text-charcoal/20'}`}>
            Momentum over Perfection
          </span>
        </div>
        <div className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${theme === 'dark' ? 'bg-primary/20 text-primary' : 'bg-charcoal text-white shadow-lg'}`}>
          Win Logged 🥂
        </div>
      </div>
      
      {/* Corner Sparkle */}
      <div className="absolute bottom-6 right-6 opacity-10">
        <Sparkles className="w-10 h-10 text-primary" />
      </div>
    </div>
  );
};

export default ShareableWinCard;

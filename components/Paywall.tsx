import React from 'react';
import { X, Check, Sparkles, Zap } from 'lucide-react';
import { COLORS } from '../constants';

interface PaywallProps {
  onClose: () => void;
  onSubscribe: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onClose, onSubscribe }) => {
  return (
    <div className="fixed inset-0 bg-background z-[100] flex flex-col p-6 animate-in slide-in-from-bottom duration-500 overflow-y-auto">
      <div className="flex justify-end">
        <button onClick={onClose} className="p-3 text-charcoal/40 bg-white shadow-sm rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center text-center space-y-8 py-8">
        <div className="relative">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-pulse-soft">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <Zap className="absolute -top-1 -right-1 w-8 h-8 text-accent fill-accent" />
        </div>
        
        <div className="space-y-2">
            <h1 className="text-4xl font-black italic text-charcoal leading-tight">
              You're building major momentum
            </h1>
            <p className="text-lg text-charcoal/60 font-medium px-4">
              Support your growth with consistency, care, and the full <span className="text-primary font-black">Dream Builder</span> toolkit.
            </p>
        </div>

        <div className="w-full max-w-sm space-y-4 text-left bg-white p-8 rounded-[40px] shadow-sm border border-charcoal/5">
          {[
            'Unlimited active dreams',
            'Streak protection (guilt-free progress)',
            'Curated monthly Dream Drops',
            'Full identity-shift recaps'
          ].map((feature, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="bg-primary/20 rounded-full p-1 flex-shrink-0">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <span className="text-charcoal/80 font-bold text-sm">{feature}</span>
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm space-y-4 pt-6">
          <button 
            onClick={onSubscribe}
            className="btn-energetic w-full py-5 rounded-full text-white font-black text-xl shadow-xl"
            style={{ backgroundColor: COLORS.primary }}
          >
            Unlock Dream Builder
          </button>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-charcoal/30">
              $4.99/month or $39/year • Cancel anytime
            </p>
            <p className="text-[9px] text-charcoal/20 px-8">
              Consistency over perfection. By upgrading, you're investing in your own momentum. 🥂
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paywall;
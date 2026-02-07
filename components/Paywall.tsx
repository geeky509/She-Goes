
import React from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { COLORS } from '../constants';

interface PaywallProps {
  onClose: () => void;
  onSubscribe: () => void;
}

const Paywall: React.FC<PaywallProps> = ({ onClose, onSubscribe }) => {
  return (
    <div className="fixed inset-0 bg-white z-[100] flex flex-col p-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex justify-end">
        <button onClick={onClose} className="p-2 text-gray-400">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-20 h-20 bg-[#FEFAE0] rounded-full flex items-center justify-center mb-4">
          <Sparkles className="w-10 h-10" style={{ color: COLORS.premium }} />
        </div>
        
        <h1 className="text-3xl font-bold" style={{ color: COLORS.text }}>
          You're building momentum
        </h1>
        
        <p className="text-lg text-gray-600 max-w-xs">
          Support your dreams with consistency, care, and the full Dream Builder experience.
        </p>

        <div className="w-full max-w-sm space-y-4 text-left">
          {[
            'Unlimited active dreams',
            'Streak protection (never feel behind)',
            'Special monthly Dream Drops',
            'Personal progress recaps'
          ].map((feature, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="bg-[#CCD5AE] rounded-full p-1">
                <Check className="w-4 h-4 text-[#283618]" />
              </div>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <div className="w-full max-w-sm space-y-3 pt-6">
          <button 
            onClick={onSubscribe}
            className="w-full py-4 rounded-2xl text-white font-semibold text-lg transition-transform active:scale-95 shadow-lg"
            style={{ backgroundColor: COLORS.premium }}
          >
            Unlock Dream Builder
          </button>
          <p className="text-sm text-gray-400">
            $4.99/month or $39/year. Cancel anytime.
          </p>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-xs text-gray-400 underline">
            Billing Documentation
          </a>
        </div>
      </div>
    </div>
  );
};

export default Paywall;

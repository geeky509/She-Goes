
import React from 'react';
import { X, Share2, Download, Copy, CheckCircle2, Star } from 'lucide-react';
import { COLORS } from '../constants';

interface ShareModalProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ title, subtitle, onClose }) => {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'She Goes - Small Actions. Big Lives.',
      text: `I just logged a win on She Goes: "${title}" towards my dream of ${subtitle}. 🥂✨`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      handleCopy();
    }
  };

  const handleCopy = () => {
    const text = `I just logged a win on She Goes: "${title}" towards my dream of ${subtitle}. 🥂✨`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-charcoal/80 backdrop-blur-md z-[110] flex items-center justify-center p-6">
      <div className="bg-background w-full max-w-sm rounded-[40px] overflow-hidden flex flex-col animate-in zoom-in duration-300 shadow-2xl border-4 border-white/20">
        <div className="p-4 flex justify-end">
          <button onClick={onClose} className="p-3 text-charcoal/40 bg-white/20 rounded-full hover:text-charcoal transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Shareable Card Canvas */}
        <div className="px-8 pb-8 flex flex-col">
          <div className="bg-white rounded-[32px] p-8 shadow-2xl border-2 border-primary/10 flex flex-col items-center text-center space-y-6 aspect-square justify-center relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl opacity-50" />

            <div className="z-10 flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center border-4 border-primary animate-pulse-soft">
                <Star className="w-8 h-8 text-primary fill-primary" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black italic leading-tight text-charcoal">
                  "{title}"
                </h3>
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-black">
                  Momentum Built
                </p>
              </div>

              <div className="pt-4">
                <p className="text-[10px] font-black tracking-[0.4em] uppercase opacity-20 text-charcoal">She Goes</p>
                <p className="text-[10px] italic text-charcoal/40 font-bold">Small actions. Big lives.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button 
              onClick={handleShare}
              className="btn-energetic flex items-center justify-center space-x-2 py-4 bg-primary text-white rounded-2xl font-black shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button 
              onClick={handleCopy}
              className="btn-energetic flex items-center justify-center space-x-2 py-4 bg-white border-2 border-charcoal/5 text-charcoal rounded-2xl font-black shadow-sm"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          
          <p className="text-center mt-6 text-[9px] text-charcoal/30 uppercase tracking-[0.2em] font-black">
            Inspiration is better when shared. ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

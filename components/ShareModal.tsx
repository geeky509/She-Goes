
import React from 'react';
import { X, Share2, Download, Copy, CheckCircle2 } from 'lucide-react';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
      <div className="bg-[#FAF9F6] w-full max-w-sm rounded-[40px] overflow-hidden flex flex-col animate-in zoom-in duration-300 shadow-2xl">
        <div className="p-4 flex justify-end">
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Shareable Card Canvas */}
        <div className="px-8 pb-8 flex flex-col">
          <div className="bg-white rounded-[32px] p-8 shadow-inner border border-gray-100 flex flex-col items-center text-center space-y-6 aspect-square justify-center relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FAEDCD] rounded-full blur-3xl opacity-50" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#CCD5AE] rounded-full blur-3xl opacity-50" />

            <div className="z-10 flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-[#FAEDCD] rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-[#BC6C25]" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-bold italic leading-tight" style={{ color: COLORS.text }}>
                  "{title}"
                </h3>
                <p className="text-sm uppercase tracking-widest text-gray-400 font-bold">
                  Building Momentum
                </p>
              </div>

              <div className="pt-4">
                <p className="text-xs font-bold tracking-[0.2em] uppercase opacity-40">She Goes</p>
                <p className="text-[10px] italic text-gray-400">Small actions. Big lives.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <button 
              onClick={handleShare}
              className="flex items-center justify-center space-x-2 py-4 bg-[#283618] text-white rounded-2xl font-bold transition-transform active:scale-95 shadow-lg"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button 
              onClick={handleCopy}
              className="flex items-center justify-center space-x-2 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold transition-transform active:scale-95 shadow-sm"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          
          <p className="text-center mt-4 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
            Share the vibe, inspire the tribe.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;

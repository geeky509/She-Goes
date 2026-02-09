
import React, { useState } from 'react';
import { X, Share2, Download, Copy, CheckCircle2, Star } from 'lucide-react';
import { COLORS } from '../constants.tsx';
import ShareableWinCard from './ShareableWinCard.tsx';

interface ShareModalProps {
  title: string;
  reflection: string;
  identityTitle: string;
  dreamTitle: string;
  theme?: 'light' | 'dark';
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ 
  title, 
  reflection, 
  identityTitle, 
  dreamTitle, 
  theme = 'light',
  onClose 
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: 'She Goes - Momentum Logged',
      text: `Manifestation Documented: "${title}" towards my dream of ${dreamTitle}. 🥂✨`,
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
    const text = `Manifestation Documented: "${title}" towards my dream of ${dreamTitle}. Identity: ${identityTitle}. 🥂✨`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-charcoal/90 dark:bg-black/95 backdrop-blur-xl z-[150] flex items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col space-y-8 animate-in zoom-in duration-300">
        <div className="flex justify-between items-center">
          <div className="flex flex-col">
            <h3 className="text-white font-black italic text-xl">The Evidence</h3>
            <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.4em]">Ready to inspire</span>
          </div>
          <button onClick={onClose} className="p-3 text-white/40 bg-white/10 rounded-full hover:text-white transition-colors">
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* The Luxury Card */}
        <div className="shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
          <ShareableWinCard 
            win={title} 
            reflection={reflection} 
            identityTitle={identityTitle} 
            dreamTitle={dreamTitle}
            theme={theme}
          />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleShare}
            className="btn-luxury flex items-center justify-center space-x-3 py-6 bg-primary text-white rounded-3xl font-black shadow-2xl"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Path</span>
          </button>
          <button 
            onClick={handleCopy}
            className="btn-luxury flex items-center justify-center space-x-3 py-6 glass-silk text-white border-white/20 rounded-3xl font-black"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        
        <p className="text-center text-[10px] text-white/20 uppercase tracking-[0.4em] font-black">
          "One woman's win is permission for all."
        </p>
      </div>
    </div>
  );
};

export default ShareModal;

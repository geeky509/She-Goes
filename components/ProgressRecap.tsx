import React from 'react';
import { X, Trophy, Flame, Target, Star, ChevronRight, Zap } from 'lucide-react';
import { Win } from '../types';
import { COLORS } from '../constants';

interface ProgressRecapProps {
  wins: Win[];
  streak: number;
  onClose: () => void;
}

const ProgressRecap: React.FC<ProgressRecapProps> = ({ wins, streak, onClose }) => {
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const monthWins = wins.filter(w => {
    const d = new Date(w.timestamp);
    return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
  });

  return (
    <div className="fixed inset-0 bg-background z-[120] flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-500">
      <div className="p-6 flex justify-between items-center bg-white sticky top-0 z-10 border-b border-charcoal/5">
        <h2 className="text-xl font-black uppercase tracking-widest text-charcoal">Identity Recap</h2>
        <button onClick={onClose} className="p-2 text-charcoal/30 bg-charcoal/5 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-8 pb-12">
        <div className="text-center space-y-2 mt-4">
          <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Your Journey • {currentMonth}</p>
          <h1 className="text-4xl font-black italic text-charcoal leading-tight">Look how far you've come.</h1>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[32px] shadow-sm flex flex-col items-center text-center space-y-2 border border-charcoal/5">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-black text-charcoal">{monthWins.length}</p>
            <p className="text-[9px] text-charcoal/40 font-black uppercase tracking-widest">Wins this month</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm flex flex-col items-center text-center space-y-2 border border-charcoal/5">
            <div className="w-12 h-12 bg-cta/10 rounded-full flex items-center justify-center">
              <Zap className="w-6 h-6 text-cta fill-cta" />
            </div>
            <p className="text-3xl font-black text-charcoal">{streak}</p>
            <p className="text-[9px] text-charcoal/40 font-black uppercase tracking-widest">Protected Streak</p>
          </div>
        </div>

        {/* Encouraging Quote/Message */}
        <div className="bg-white p-8 rounded-[40px] border-4 border-accent/20 relative overflow-hidden shadow-xl">
          <div className="relative z-10">
            <Star className="w-8 h-8 text-primary fill-primary mb-4 opacity-50" />
            <p className="text-xl leading-relaxed italic font-black text-charcoal">
              "Consistency isn't about perfection; it's about the courage to show up again and again. You are building a life you're obsessed with."
            </p>
            <p className="mt-4 font-black text-primary uppercase tracking-[0.2em] text-[10px]">— Gabby Beckford</p>
          </div>
          <Target className="absolute -bottom-6 -right-6 w-32 h-32 text-accent opacity-5 rotate-12" />
        </div>

        {/* Milestone List */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-charcoal/30 flex items-center">
            Recent Steps <ChevronRight className="w-4 h-4 ml-1" />
          </h3>
          <div className="space-y-3">
            {monthWins.slice(0, 5).map((win, i) => (
              <div key={win.id} className="btn-energetic bg-white p-5 rounded-3xl shadow-sm border border-charcoal/5 flex items-start space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-background flex-shrink-0 flex items-center justify-center font-black text-primary">
                  {monthWins.length - i}
                </div>
                <div>
                  <h4 className="font-black leading-tight text-charcoal">{win.action}</h4>
                  <p className="text-[10px] text-charcoal/40 mt-1 uppercase tracking-widest font-black">
                    {new Date(win.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={onClose}
          className="btn-energetic w-full py-5 text-white rounded-full font-black text-lg shadow-xl"
          style={{ backgroundColor: COLORS.primary }}
        >
          Stay in Momentum 🥂
        </button>
      </div>
    </div>
  );
};

export default ProgressRecap;
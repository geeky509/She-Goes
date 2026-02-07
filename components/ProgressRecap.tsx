
import React from 'react';
import { X, Trophy, Flame, Target, Star, ChevronRight } from 'lucide-react';
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
    <div className="fixed inset-0 bg-[#FAF9F6] z-[120] flex flex-col overflow-y-auto animate-in slide-in-from-bottom duration-500">
      <div className="p-6 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-10">
        <h2 className="text-2xl font-bold" style={{ color: COLORS.text }}>Progress Recap</h2>
        <button onClick={onClose} className="p-2 text-gray-400">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 space-y-8 pb-12">
        <div className="text-center space-y-2">
          <p className="text-[#BC6C25] font-bold uppercase tracking-widest text-xs">Your Journey in {currentMonth}</p>
          <h1 className="text-4xl font-bold italic" style={{ color: COLORS.text }}>Look how far you've come.</h1>
        </div>

        {/* Highlight Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-[32px] shadow-sm flex flex-col items-center text-center space-y-2 border border-gray-50">
            <div className="w-12 h-12 bg-[#FAEDCD] rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-[#BC6C25]" />
            </div>
            <p className="text-3xl font-bold" style={{ color: COLORS.text }}>{monthWins.length}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Wins this month</p>
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm flex flex-col items-center text-center space-y-2 border border-gray-50">
            <div className="w-12 h-12 bg-[#E9EDC9] rounded-full flex items-center justify-center">
              <Flame className="w-6 h-6 text-[#283618]" />
            </div>
            <p className="text-3xl font-bold" style={{ color: COLORS.text }}>{streak}</p>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Current Streak</p>
          </div>
        </div>

        {/* Encouraging Quote/Message */}
        <div className="bg-[#FEFAE0] p-8 rounded-[40px] border border-[#D4A373]/20 relative overflow-hidden">
          <div className="relative z-10">
            <Star className="w-8 h-8 text-[#BC6C25] mb-4 opacity-50" />
            <p className="text-xl leading-relaxed italic" style={{ color: COLORS.text }}>
              "Consistency isn't about perfection; it's about the courage to show up again and again. You are building a life you're obsessed with, one small step at a time."
            </p>
            <p className="mt-4 font-bold text-[#BC6C25] uppercase tracking-widest text-xs">— Gabby Beckford</p>
          </div>
          <Target className="absolute -bottom-6 -right-6 w-32 h-32 text-[#BC6C25] opacity-5 rotate-12" />
        </div>

        {/* Milestone List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold uppercase tracking-widest text-gray-400 flex items-center">
            Recent Milestones <ChevronRight className="w-4 h-4 ml-1" />
          </h3>
          <div className="space-y-3">
            {monthWins.slice(0, 5).map((win, i) => (
              <div key={win.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex items-start space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-[#FAF9F6] flex-shrink-0 flex items-center justify-center font-bold text-[#D4A373]">
                  {monthWins.length - i}
                </div>
                <div>
                  <h4 className="font-bold leading-tight" style={{ color: COLORS.text }}>{win.action}</h4>
                  <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
                    {new Date(win.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={onClose}
          className="w-full py-5 bg-[#283618] text-white rounded-full font-bold text-lg shadow-xl active:scale-95 transition-transform"
        >
          Keep building momentum
        </button>
      </div>
    </div>
  );
};

export default ProgressRecap;

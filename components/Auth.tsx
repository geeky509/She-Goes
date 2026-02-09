
import React, { useState } from 'react';
import { supabase } from '../services/supabase.ts';
import { COLORS } from '../constants.tsx';
import { Mail, Lock, User, ArrowRight, Sparkles, Apple } from 'lucide-react';

interface AuthProps {
  onSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: { data: { display_name: name } }
        });
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.origin }
      });
    } catch (err: any) { setError(err.message); }
  };

  return (
    <div className="flex flex-col h-full bg-background p-10 justify-center animate-slide-up-ritual">
      <div className="mb-12 text-center space-y-4">
        <div className="w-20 h-20 bg-white/40 border border-white rounded-[2rem] mx-auto flex items-center justify-center animate-breathing">
            <Sparkles className="w-10 h-10 text-primary" strokeWidth={1.5} />
        </div>
        <div className="space-y-1">
          <h1 className="text-5xl font-bold italic text-charcoal tracking-tight">She Goes</h1>
          <p className="text-charcoal/30 font-black text-[10px] uppercase tracking-[0.4em]">Daily Momentum Lab</p>
        </div>
      </div>

      <div className="space-y-6 w-full max-w-sm mx-auto">
        <div className="space-y-3">
          <button onClick={() => handleOAuthSignIn('apple')} className="btn-luxury w-full py-5 rounded-full bg-black text-white font-bold flex items-center justify-center space-x-3 shadow-xl">
            <Apple className="w-5 h-5 fill-white" />
            <span>Claim Your Spot via Apple</span>
          </button>
          <button onClick={() => handleOAuthSignIn('google')} className="btn-luxury w-full py-5 rounded-full bg-white border border-white text-charcoal font-bold flex items-center justify-center space-x-3 shadow-sm">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            <span>Join with Google</span>
          </button>
        </div>

        <div className="relative flex items-center py-4">
          <div className="flex-grow border-t border-charcoal/5"></div>
          <span className="flex-shrink mx-4 text-charcoal/20 text-[9px] font-black uppercase tracking-widest">or your own pace</span>
          <div className="flex-grow border-t border-charcoal/5"></div>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-8 py-5 rounded-full bg-white/60 border border-white focus:ring-2 focus:ring-primary outline-none font-medium" />
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-8 py-5 rounded-full bg-white/60 border border-white focus:ring-2 focus:ring-primary outline-none font-medium" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-8 py-5 rounded-full bg-white/60 border border-white focus:ring-2 focus:ring-primary outline-none font-medium" />

          {error && <p className="text-red-500 text-xs text-center font-bold px-2">{error}</p>}

          <button type="submit" disabled={loading} className="btn-luxury w-full py-5 rounded-full text-white font-black text-lg shadow-xl bg-primary">
            {loading ? "Aligning..." : (isLogin ? 'Enter' : 'Start Journey')}
          </button>
        </form>

        <div className="pt-4 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-charcoal/40 text-[10px] font-black uppercase tracking-widest">
            {isLogin ? "Permission needed? Join us" : "Already built? Sign In"}
          </button>
        </div>
      </div>
      
      <div className="mt-16 text-center opacity-10">
        <p className="text-[9px] uppercase tracking-[0.3em] font-black">Gabby Beckford • She Goes 🥂</p>
      </div>
    </div>
  );
};

export default Auth;

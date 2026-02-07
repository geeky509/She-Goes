import React, { useState } from 'react';
import { auth } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously
} from 'firebase/auth';
import { COLORS } from '../constants';
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface AuthProps {
  onSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
      }
      onSuccess();
    } catch (err: any) {
      let message = "An error occurred during authentication.";
      if (err.code === 'auth/user-not-found') message = "Account not found.";
      if (err.code === 'auth/wrong-password') message = "Incorrect password.";
      if (err.code === 'auth/email-already-in-use') message = "Email already in use.";
      if (err.code === 'auth/weak-password') message = "Password should be at least 6 characters.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSocialLoading('google');
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onSuccess();
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setSocialLoading(null);
    }
  };

  const handleAnonymousSignIn = async () => {
    setSocialLoading('anonymous');
    setError(null);
    try {
      await signInAnonymously(auth);
      onSuccess();
    } catch (err: any) {
      setError("Guest access failed. Please try again.");
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background p-8 justify-center animate-in fade-in duration-700">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center space-x-2 mb-2">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-5xl font-bold italic" style={{ color: COLORS.text }}>She Goes</h1>
        </div>
        <p className="text-charcoal opacity-60 font-medium text-lg">Small actions. Big lives.</p>
      </div>

      <div className="space-y-4 max-w-sm mx-auto w-full">
        {/* Social & Guest Buttons */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={!!socialLoading || loading}
            className="btn-energetic w-full py-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {socialLoading === 'google' ? (
              <div className="spinner-gradient"></div>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                <span className="font-bold text-charcoal">Continue with Google</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleAnonymousSignIn}
            disabled={!!socialLoading || loading}
            className="btn-energetic w-full py-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {socialLoading === 'anonymous' ? (
              <div className="spinner-gradient"></div>
            ) : (
              <>
                <User className="w-5 h-5 text-charcoal/40" />
                <span className="font-bold text-charcoal/60">Continue as Guest</span>
              </>
            )}
          </button>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-charcoal/10"></div>
          <span className="flex-shrink mx-4 text-charcoal/40 text-[10px] font-bold uppercase tracking-widest">or email</span>
          <div className="flex-grow border-t border-charcoal/10"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-charcoal/5 shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              />
            </div>
          )}
          
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30 group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-charcoal/5 shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/30 group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-charcoal/5 shadow-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            />
          </div>

          {error && <p className="text-red-500 text-xs text-center px-2 animate-in slide-in-from-top duration-300 font-medium">{error}</p>}

          <button
            type="submit"
            disabled={loading || !!socialLoading}
            className="btn-energetic w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
            style={{ backgroundColor: COLORS.primary }}
          >
            {loading ? (
              <div className="spinner-gradient !border-t-white !border-r-white/30"></div>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Join the Vibe'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-charcoal/60 text-sm font-bold hover:text-primary transition-colors"
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
      
      <div className="mt-12 text-center opacity-30">
        <p className="text-[10px] uppercase tracking-widest font-black">Gabby Beckford • She Goes</p>
      </div>
    </div>
  );
};

export default Auth;
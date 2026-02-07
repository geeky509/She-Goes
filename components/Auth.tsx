
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
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-[#FAF9F6] p-8 justify-center animate-in fade-in duration-700">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-bold mb-3 italic" style={{ color: COLORS.text }}>She Goes</h1>
        <p className="text-gray-400 font-medium text-lg">Small actions. Big lives.</p>
      </div>

      <div className="space-y-4 max-w-sm mx-auto w-full">
        {/* Social & Guest Buttons */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={!!socialLoading || loading}
            className="w-full py-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center space-x-3 transition-all active:scale-95 hover:bg-gray-50 disabled:opacity-50"
          >
            {socialLoading === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                <span className="font-semibold text-gray-700">Continue with Google</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleAnonymousSignIn}
            disabled={!!socialLoading || loading}
            className="w-full py-4 rounded-2xl bg-[#E9EDC9] flex items-center justify-center space-x-3 transition-all active:scale-95 hover:bg-[#d8ddb8] disabled:opacity-50"
          >
            {socialLoading === 'anonymous' ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#283618]" />
            ) : (
              <>
                <User className="w-5 h-5 text-[#283618]" />
                <span className="font-semibold text-[#283618]">Continue as Guest</span>
              </>
            )}
          </button>
        </div>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-100"></div>
          <span className="flex-shrink mx-4 text-gray-300 text-[10px] font-bold uppercase tracking-widest">or email</span>
          <div className="flex-grow border-t border-gray-100"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {!isLogin && (
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#D4A373] transition-colors" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-[#D4A373] outline-none transition-all"
              />
            </div>
          )}
          
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#D4A373] transition-colors" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-[#D4A373] outline-none transition-all"
            />
          </div>

          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#D4A373] transition-colors" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm focus:ring-2 focus:ring-[#D4A373] outline-none transition-all"
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center px-2 animate-in slide-in-from-top duration-300">{error}</p>}

          <button
            type="submit"
            disabled={loading || !!socialLoading}
            className="w-full py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-lg disabled:opacity-50"
            style={{ backgroundColor: COLORS.text }}
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-400 text-sm font-medium hover:text-[#D4A373] transition-colors"
          >
            {isLogin ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
      
      <div className="mt-12 text-center opacity-30">
        <p className="text-[10px] uppercase tracking-widest font-bold">Gabby Beckford x She Goes</p>
      </div>
    </div>
  );
};

export default Auth;

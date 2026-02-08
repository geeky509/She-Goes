
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  History, 
  Home as HomeIcon, 
  Settings, 
  ChevronRight,
  CheckCircle2,
  Lock,
  Share2,
  LogOut,
  Camera,
  Trophy,
  Sparkles,
  Zap,
  Gift,
  Star,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { Category, UserState, Dream, Win, MicroAction } from './types';
import { CATEGORIES, SUGGESTED_DREAMS, COLORS, GABBY_QUOTES, MILESTONES, MONTHLY_DREAM_DROPS } from './constants';
import { generateMicroAction } from './services/geminiService';
import { supabase } from './services/supabase';
import Confetti from './components/Confetti';
import Paywall from './components/Paywall';
import ShareModal from './components/ShareModal';
import Auth from './components/Auth';
import ProgressRecap from './components/ProgressRecap';

const App: React.FC = () => {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'onboarding' | 'home' | 'wins' | 'settings'>('onboarding');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [dailyAction, setDailyAction] = useState<MicroAction | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [showMilestonePopup, setShowMilestonePopup] = useState<number | null>(null);
  const [shareData, setShareData] = useState<{ title: string; subtitle: string } | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- AUTH LISTENERS ---
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        await loadUserData(user.id, user);
      } else {
        setUserState(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (uid: string, authUser: any) => {
    setLoading(true);
    try {
      const { data: userDoc, error } = await supabase
        .from('users')
        .select('*')
        .eq('uid', uid)
        .maybeSingle();

      if (userDoc) {
        setUserState({
          ...userDoc,
          displayName: authUser.user_metadata?.display_name || userDoc.displayName,
          photoURL: authUser.user_metadata?.avatar_url || userDoc.photoURL,
        });
        setView(userDoc.hasOnboarded ? 'home' : 'onboarding');
      } else {
        const initialState: UserState = {
          uid,
          email: authUser.email,
          displayName: authUser.user_metadata?.display_name || 'Adventurer',
          photoURL: authUser.user_metadata?.avatar_url || null,
          hasOnboarded: false,
          activeDreamId: null,
          dreams: [],
          wins: [],
          streak: 0,
          lastCompletedDate: null,
          isPremium: false,
          streakProtectionEnabled: true,
          milestonesReached: []
        };
        await supabase.from('users').insert([initialState]);
        setUserState(initialState);
        setView('onboarding');
      }
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Paywall Trigger: Day 3
  useEffect(() => {
    if (userState && !userState.isPremium && userState.hasOnboarded && userState.dreams.length > 0) {
      const createdDate = userState.dreams[0].createdAt;
      const diffDays = Math.ceil((Date.now() - createdDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 3) {
        setShowPaywall(true);
      }
    }
  }, [userState?.hasOnboarded, userState?.isPremium, view]);

  useEffect(() => {
    if (userState?.hasOnboarded && view === 'home') {
      fetchDailyAction();
    }
  }, [userState?.activeDreamId, view]);

  const syncUserData = async (updates: Partial<UserState>) => {
    if (!currentUser || !userState) return;
    const newState = { ...userState, ...updates };
    setUserState(newState);
    try {
      await supabase.from('users').update(updates).eq('uid', currentUser.id);
    } catch (err) {
      console.error("Error syncing user data:", err);
    }
  };

  const fetchDailyAction = async () => {
    if (!userState?.activeDreamId) return;
    const activeDream = userState.dreams.find(d => d.id === userState.activeDreamId);
    if (!activeDream) return;

    setLoadingAction(true);
    const action = await generateMicroAction(activeDream.category, activeDream.title);
    setDailyAction(action);
    setLoadingAction(false);
  };

  // --- ACTIONS ---
  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setView('onboarding');
    setOnboardingStep(1);
  };

  const selectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setOnboardingStep(2);
  };

  const selectDream = async (title: string) => {
    if (!userState) return;
    const newDream: Dream = {
      id: Math.random().toString(36).substr(2, 9),
      category: selectedCategory!,
      title,
      createdAt: Date.now()
    };
    
    await syncUserData({
      hasOnboarded: true,
      activeDreamId: newDream.id,
      dreams: [...userState.dreams, newDream]
    });
    
    setView('home');
  };

  const completeAction = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (userState?.lastCompletedDate === today) return;

    setShowConfetti(true);
    const newWin: Win = {
      id: Math.random().toString(36).substr(2, 9),
      dreamId: userState!.activeDreamId!,
      action: dailyAction?.task || "Showed up today",
      timestamp: Date.now()
    };

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    const isConsecutive = userState!.lastCompletedDate === yesterdayStr;
    let newStreak = 1;

    if (isConsecutive) {
      newStreak = userState!.streak + 1;
    } else if (userState!.isPremium && userState!.streakProtectionEnabled && userState!.lastCompletedDate) {
      const lastDate = new Date(userState!.lastCompletedDate);
      const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) {
        newStreak = userState!.streak + 1;
      }
    }

    const totalWins = userState!.wins.length + 1;
    const milestone = MILESTONES.find(m => m === totalWins && !userState!.milestonesReached.includes(m));

    const updates: Partial<UserState> = {
      wins: [newWin, ...userState!.wins],
      streak: newStreak,
      lastCompletedDate: today
    };

    if (milestone) {
      updates.milestonesReached = [...userState!.milestonesReached, milestone];
      setShowMilestonePopup(milestone);
    }
    
    await syncUserData(updates);

    setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
  };

  const addAnotherDream = () => {
    if (!userState?.isPremium && userState!.dreams.length >= 1) {
      setShowPaywall(true);
    } else {
      setOnboardingStep(1);
      setView('onboarding');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Please upload an image smaller than 5MB.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const filePath = `profiles/${currentUser.id}`;
      const { data, error } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);
      
      await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      await syncUserData({ photoURL: publicUrl });
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image. Ensure the 'profiles' bucket exists.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // --- RENDER HELPERS ---
  const getInitial = () => {
    if (!userState?.displayName) return '?';
    return userState.displayName.charAt(0).toUpperCase();
  };

  const renderOnboarding = () => {
    if (onboardingStep === 1) {
      return (
        <div className="flex flex-col h-full p-6 space-y-8 animate-in fade-in duration-500">
          <div className="mt-12 text-center px-4">
            <h1 className="text-4xl mb-2 italic" style={{ color: COLORS.text }}>
              What's the dream, {userState?.displayName?.split(' ')[0] || 'Sis'}?
            </h1>
            <p className="text-charcoal/60 font-medium">Pick one category to focus on today.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => selectCategory(cat.name)}
                className="btn-energetic flex flex-col items-center justify-center p-6 rounded-3xl bg-white shadow-sm border border-charcoal/5 aspect-square"
              >
                <div className="mb-4 p-4 rounded-full" style={{ backgroundColor: cat.color + '15' }}>
                  <div style={{ color: cat.color }}>{cat.icon}</div>
                </div>
                <span className="font-bold text-center text-sm" style={{ color: COLORS.text }}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full p-6 space-y-8 animate-in slide-in-from-right duration-300">
        <div className="mt-12">
          <button onClick={() => setOnboardingStep(1)} className="text-charcoal/40 font-bold mb-4 flex items-center text-[10px] uppercase tracking-widest">
            ← Back
          </button>
          <h1 className="text-4xl mb-2 italic" style={{ color: COLORS.text }}>Choose your focus</h1>
          <p className="text-charcoal/60 italic">"Go where you're celebrated, not tolerated."</p>
        </div>
        <div className="space-y-4">
          {selectedCategory && SUGGESTED_DREAMS[selectedCategory].map(dream => (
            <button
              key={dream}
              onClick={() => selectDream(dream)}
              className="btn-energetic w-full p-6 text-left rounded-3xl bg-white shadow-sm border border-charcoal/5 flex justify-between items-center group"
            >
              <span className="text-lg font-bold" style={{ color: COLORS.text }}>{dream}</span>
              <ChevronRight className="w-5 h-5 text-charcoal/20 group-hover:text-primary" />
            </button>
          ))}
          <div className="pt-4">
            <input 
              placeholder="Or type your own..."
              className="w-full p-6 rounded-3xl bg-white shadow-sm border border-charcoal/5 outline-none focus:ring-2 focus:ring-primary font-medium"
              onKeyDown={(e) => {
                if (e.key === 'Enter') selectDream((e.target as HTMLInputElement).value);
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderHome = () => {
    const activeDream = userState?.dreams.find(d => d.id === userState.activeDreamId);
    const today = new Date().toISOString().split('T')[0];
    const isDone = userState?.lastCompletedDate === today;
    const nextMilestone = MILESTONES.find(m => m > (userState?.wins.length || 0)) || 100;
    const progress = ((userState?.wins.length || 0) / nextMilestone) * 100;

    return (
      <div className="flex flex-col h-full p-6 space-y-6 animate-in fade-in duration-500">
        {showMilestonePopup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in zoom-in duration-300">
            <div className="bg-white rounded-[40px] p-8 text-center space-y-6 shadow-2xl w-full max-w-xs relative overflow-hidden">
               <Trophy className="w-20 h-20 text-primary mx-auto animate-bounce" />
               <div className="space-y-2">
                 <h3 className="text-3xl font-bold italic" style={{ color: COLORS.text }}>{showMilestonePopup} Wins!</h3>
                 <p className="text-charcoal/60">You're officially building momentum, sis. Look at you go.</p>
               </div>
               <button 
                onClick={() => setShowMilestonePopup(null)}
                className="btn-energetic w-full py-4 bg-primary text-white rounded-full font-bold shadow-lg"
               >
                 Keep Going
               </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between items-start">
          <div className="max-w-[70%]">
            <h2 className="text-3xl font-bold leading-tight italic" style={{ color: COLORS.text }}>{isDone ? 'Win Logged!' : 'Today\'s Step'}</h2>
            <p className="text-charcoal/50 font-bold truncate text-sm">{activeDream?.title || 'No dream active'}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold shadow-sm transition-colors bg-white ${userState?.isPremium ? 'border-primary text-primary' : 'border-cta text-cta'}`}>
              {userState?.streak || 0}
            </div>
            <span className="text-[10px] uppercase font-black text-charcoal/40 mt-1 tracking-widest flex items-center">
              Streak {userState?.isPremium && <Zap className="w-2 h-2 ml-1 fill-primary text-primary" />}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-charcoal/5">
          <div className="flex justify-between text-[9px] uppercase font-black text-charcoal/40 mb-2 tracking-[0.2em]">
            <span>Next Milestone: {nextMilestone} Wins</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-charcoal/5 rounded-full overflow-hidden relative">
            <div 
              className={`h-full transition-all duration-1000 ease-out bg-primary`}
              style={{ width: `${progress}%` }}
            />
            {!isDone && <div className="absolute inset-0 progress-bar-indeterminate opacity-30"></div>}
          </div>
        </div>

        <div className={`relative flex-1 rounded-[40px] p-8 flex flex-col items-center justify-center text-center space-y-8 overflow-hidden transition-all duration-700 shadow-xl ${isDone ? 'bg-primary' : 'bg-white border-4 border-primary/10'}`}>
          {loadingAction ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="spinner-gradient"></div>
              <p className="text-charcoal/40 text-sm font-bold italic">Gathering your power...</p>
            </div>
          ) : isDone ? (
            <div className="animate-in zoom-in duration-500 flex flex-col items-center space-y-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl animate-pulse-soft">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white">Identity Shifted.</h3>
                <p className="text-white/80 mt-2 px-4 italic font-medium">"{GABBY_QUOTES[Math.floor(Date.now() / 86400000) % GABBY_QUOTES.length]}"</p>
              </div>
              <div className="flex flex-col space-y-4 w-full pt-8 px-4">
                <p className="text-xs font-black uppercase tracking-[0.3em] text-white/50">One step closer.</p>
                <button 
                  onClick={() => setShareData({ title: userState!.wins[0]?.action || "Taking steps", subtitle: activeDream?.title || "my dream" })}
                  className="btn-energetic flex items-center justify-center space-x-2 bg-white text-primary py-4 rounded-full font-black shadow-lg"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share Win</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center shadow-sm animate-bounce-subtle">
                <Star className="w-10 h-10 text-primary fill-primary" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl leading-snug px-2 italic font-black text-charcoal">{dailyAction?.task}</h3>
                <p className="text-charcoal/70 text-lg px-2 font-medium">{dailyAction?.encouragement}</p>
              </div>
              <button 
                onClick={completeAction}
                className="btn-energetic mt-4 px-10 py-5 bg-primary text-white rounded-full font-black text-lg shadow-xl"
              >
                I Did It! 🥂
              </button>
            </>
          )}
          
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles className="w-20 h-20" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 flex items-center space-x-4 shadow-sm border border-charcoal/5">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex-shrink-0 overflow-hidden border-2 border-white flex items-center justify-center">
            {userState?.photoURL ? (
              <img src={userState.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-primary font-black text-xl">{getInitial()}</span>
            )}
          </div>
          <p className="text-sm text-charcoal/60 font-medium italic">"You are closer than you think. Keep taking up space."</p>
        </div>
      </div>
    );
  };

  const renderWins = () => (
    <div className="flex flex-col h-full p-6 space-y-6 animate-in fade-in duration-500">
      <div className="mt-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold italic text-charcoal">Your Wins</h2>
          <p className="text-charcoal/50 font-medium italic">Evidence of your growth.</p>
        </div>
        <button 
          onClick={() => setShareData({ title: `${userState?.wins.length} wins logged`, subtitle: "becoming my best self" })}
          className="btn-energetic p-4 bg-white rounded-2xl shadow-sm text-charcoal/20 hover:text-primary"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 space-y-4 overflow-y-auto pb-20 px-1">
        {!userState?.wins || userState.wins.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center space-y-4">
            <History className="w-12 h-12 text-charcoal/10" />
            <p className="text-charcoal/40 font-bold">No wins yet. Let's get one today!</p>
          </div>
        ) : (
          userState.wins.map((win, idx) => {
            const dream = userState.dreams.find(d => d.id === win.dreamId);
            return (
              <div key={win.id} className="bg-white p-6 rounded-3xl shadow-sm border-l-8 group relative" style={{ borderLeftColor: idx === 0 ? COLORS.primary : COLORS.muted }}>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setShareData({ title: win.action, subtitle: dream?.title || "my dream" })} className="p-2 text-charcoal/10 hover:text-charcoal/40">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] text-charcoal/40 font-black mb-1 uppercase tracking-widest">
                  {new Date(win.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
                <h4 className="text-lg font-black text-charcoal pr-8">{win.action}</h4>
                <p className="text-xs text-charcoal/50 font-bold">{dream?.title}</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="flex flex-col h-full p-6 space-y-6 animate-in fade-in duration-500">
      <div className="mt-8">
        <h2 className="text-3xl font-bold italic text-charcoal">Your Profile</h2>
      </div>

      <div className="bg-white rounded-[40px] p-8 flex flex-col items-center space-y-6 shadow-xl relative overflow-hidden group border-4 border-charcoal/5">
        <div className="relative">
          <div className={`w-36 h-36 rounded-full overflow-hidden border-4 transition-all duration-300 shadow-xl ${uploadingPhoto ? 'scale-95 grayscale' : 'border-background scale-100'}`}>
            {userState?.photoURL ? (
              <img 
                src={userState.photoURL} 
                className="w-full h-full object-cover" 
                alt="Profile" 
              />
            ) : (
              <div className="w-full h-full bg-background flex items-center justify-center text-primary text-5xl font-black">
                {getInitial()}
              </div>
            )}
            
            {uploadingPhoto && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-10">
                 <div className="spinner-gradient"></div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute bottom-1 right-1 p-4 bg-charcoal text-white rounded-full shadow-2xl active:scale-90 transition-all hover:bg-black disabled:opacity-50"
          >
            <Camera className="w-6 h-6" />
          </button>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handlePhotoUpload} 
            className="hidden" 
            accept="image/*" 
          />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-2xl font-black text-charcoal">{userState?.displayName || 'Adventurer'}</h3>
          <p className="text-charcoal/40 font-bold text-[10px] uppercase tracking-widest">{userState?.email || 'Guest Explorer'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {userState?.isPremium && (
          <>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-charcoal/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-xl ${userState.streakProtectionEnabled ? 'bg-primary/10 text-primary' : 'bg-charcoal/5 text-charcoal/30'}`}>
                    {userState.streakProtectionEnabled ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-charcoal uppercase tracking-widest">Streak Protection</h3>
                    <p className="text-[10px] text-charcoal/40 font-bold">Safeguard your momentum</p>
                  </div>
                </div>
                <button 
                  onClick={() => syncUserData({ streakProtectionEnabled: !userState.streakProtectionEnabled })}
                  className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative ${userState.streakProtectionEnabled ? 'bg-primary' : 'bg-charcoal/20'}`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${userState.streakProtectionEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
              <p className="text-[11px] text-charcoal/60 leading-relaxed font-medium italic">
                Active protection keeps your streak alive for up to 3 days if you miss a check-in. Guilt-free growth.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4 border border-charcoal/5">
              <div className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-primary" />
                  <h3 className="font-black text-[10px] uppercase tracking-widest text-charcoal/30">Dream Drops</h3>
              </div>
              <div className="space-y-3">
                  {MONTHLY_DREAM_DROPS.map(drop => (
                    <div key={drop.id} className="p-4 bg-background rounded-2xl border border-primary/10">
                      <h4 className="font-black text-primary text-sm">{drop.title}</h4>
                      <p className="text-[11px] text-charcoal/70 mt-1 font-medium">{drop.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        <div className="bg-white p-6 rounded-3xl border border-charcoal/10 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="font-black text-primary text-sm uppercase tracking-widest">Dream Builder</span>
            </div>
            {userState?.isPremium ? (
              <span className="bg-primary text-white text-[9px] px-3 py-1 rounded-full uppercase font-black tracking-widest">Active</span>
            ) : (
              <button onClick={() => setShowPaywall(true)} className="text-[10px] underline text-primary font-black uppercase tracking-widest">Upgrade</button>
            )}
          </div>
          <p className="text-xs text-charcoal/60 font-medium italic">Building big lives, with care and consistency.</p>
          
          {userState?.isPremium && (
            <button 
              onClick={() => setShowRecap(true)}
              className="btn-energetic w-full py-4 bg-primary text-white rounded-2xl font-black text-sm flex items-center justify-center space-x-3 shadow-md"
            >
              <Trophy className="w-5 h-5" />
              <span>Full Progress Recap</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={addAnotherDream}
            className="btn-energetic w-full p-6 bg-white rounded-3xl text-left flex items-center justify-between shadow-sm border border-charcoal/5"
          >
            <div className="flex items-center space-x-4">
              <Plus className="w-6 h-6 text-charcoal/20" />
              <span className="font-black text-charcoal text-sm uppercase tracking-widest">New Dream</span>
            </div>
            {!userState?.isPremium && (userState?.dreams?.length || 0) >= 1 && <Lock className="w-4 h-4 text-charcoal/20" />}
          </button>

          <button 
            onClick={handleSignOut}
            className="btn-energetic w-full p-6 bg-white rounded-3xl text-left flex items-center space-x-4 shadow-sm text-red-500 border border-charcoal/5"
          >
            <LogOut className="w-6 h-6" />
            <span className="font-black text-sm uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background space-y-4">
        <div className="spinner-gradient"></div>
        <p className="text-primary font-black uppercase tracking-[0.3em] animate-pulse">Dreaming...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onSuccess={() => {}} />;
  }

  return (
    <div className="h-screen w-full max-w-md mx-auto relative flex flex-col bg-background shadow-2xl overflow-hidden">
      <Confetti active={showConfetti} />
      
      {showPaywall && (
        <Paywall 
          onClose={() => setShowPaywall(false)} 
          onSubscribe={() => {
            syncUserData({ isPremium: true });
            setShowPaywall(false);
          }}
        />
      )}

      {showRecap && userState && (
        <ProgressRecap 
          wins={userState.wins}
          streak={userState.streak}
          onClose={() => setShowRecap(false)}
        />
      )}

      {shareData && (
        <ShareModal 
          title={shareData.title}
          subtitle={shareData.subtitle}
          onClose={() => setShareData(null)}
        />
      )}

      <div className="flex-1 overflow-y-auto pb-24 scroll-smooth">
        {view === 'onboarding' ? renderOnboarding() :
         view === 'home' ? renderHome() :
         view === 'wins' ? renderWins() :
         renderSettings()}
      </div>

      {userState?.hasOnboarded && view !== 'onboarding' && (
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-charcoal/5 flex items-center justify-around px-8 safe-area-bottom h-24 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <button 
            onClick={() => setView('home')}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${view === 'home' ? 'text-primary scale-110' : 'text-charcoal/20 hover:text-charcoal/40'}`}
          >
            <HomeIcon className={`w-7 h-7 ${view === 'home' ? 'fill-primary/10' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </button>
          
          <button 
            onClick={() => setView('wins')}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${view === 'wins' ? 'text-primary scale-110' : 'text-charcoal/20 hover:text-charcoal/40'}`}
          >
            <History className="w-7 h-7" />
            <span className="text-[9px] font-black uppercase tracking-widest">Wins</span>
          </button>
          
          <button 
            onClick={() => setView('settings')}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${view === 'settings' ? 'text-primary scale-110' : 'text-charcoal/20 hover:text-charcoal/40'}`}
          >
            <Settings className={`w-7 h-7 ${view === 'settings' ? 'animate-spin-slow' : ''}`} />
            <span className="text-[9px] font-black uppercase tracking-widest">Profile</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default App;

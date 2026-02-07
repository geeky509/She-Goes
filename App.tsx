
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  History, 
  Home as HomeIcon, 
  Settings, 
  ChevronRight,
  CheckCircle2,
  Calendar,
  Lock,
  Share2,
  LogOut,
  Camera,
  Loader2,
  Trophy,
  User as UserIcon,
  Sparkles,
  Zap,
  Gift
} from 'lucide-react';
import { Category, UserState, Dream, Win, MicroAction } from './types';
import { CATEGORIES, SUGGESTED_DREAMS, COLORS, GABBY_QUOTES, MILESTONES, MONTHLY_DREAM_DROPS } from './constants';
import { generateMicroAction } from './services/geminiService';
import { auth, db, storage } from './services/firebase';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await loadUserData(user.uid, user);
      } else {
        setUserState(null);
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const loadUserData = async (uid: string, authUser: any) => {
    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserState;
        setUserState({
          ...data,
          uid,
          email: authUser.email,
          displayName: authUser.displayName || data.displayName,
          photoURL: authUser.photoURL || data.photoURL,
          milestonesReached: data.milestonesReached || []
        });
        setView(data.hasOnboarded ? 'home' : 'onboarding');
      } else {
        const initialState: UserState = {
          uid,
          email: authUser.email,
          displayName: authUser.displayName,
          photoURL: authUser.photoURL,
          hasOnboarded: false,
          activeDreamId: null,
          dreams: [],
          wins: [],
          streak: 0,
          lastCompletedDate: null,
          isPremium: false,
          milestonesReached: []
        };
        await setDoc(doc(db, "users", uid), initialState);
        setUserState(initialState);
        setView('onboarding');
      }
    } catch (err) {
      console.error("Error loading user data:", err);
    } finally {
      setLoading(false);
    }
  };

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
      await updateDoc(doc(db, "users", currentUser.uid), updates);
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
    await signOut(auth);
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

    // Streak Protection Logic
    if (isConsecutive) {
      newStreak = userState!.streak + 1;
    } else if (userState!.isPremium && userState!.lastCompletedDate) {
      // Premium users preserve streak if miss is <= 3 days (Protected)
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
      if (milestone) {
        // Automatically hide milestone after some time or keep it until dismissed
      }
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
      const storageRef = ref(storage, `profiles/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      await updateProfile(currentUser, { photoURL: url });
      await syncUserData({ photoURL: url });
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to upload image.");
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
            <p className="text-gray-500">Pick one category to focus on today.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map(cat => (
              <button
                key={cat.name}
                onClick={() => selectCategory(cat.name)}
                className="flex flex-col items-center justify-center p-6 rounded-3xl bg-white shadow-sm border border-transparent hover:border-[#D4A373] transition-all aspect-square"
              >
                <div className="mb-4 p-4 rounded-full" style={{ backgroundColor: cat.color + '20' }}>
                  {cat.icon}
                </div>
                <span className="font-medium text-center text-sm" style={{ color: COLORS.text }}>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col h-full p-6 space-y-8 animate-in slide-in-from-right duration-300">
        <div className="mt-12">
          <button onClick={() => setOnboardingStep(1)} className="text-gray-400 mb-4 flex items-center text-sm">
            ← Back to categories
          </button>
          <h1 className="text-4xl mb-2 italic" style={{ color: COLORS.text }}>Choose your focus</h1>
          <p className="text-gray-500 italic">"Go where you're celebrated, not tolerated."</p>
        </div>
        <div className="space-y-4">
          {selectedCategory && SUGGESTED_DREAMS[selectedCategory].map(dream => (
            <button
              key={dream}
              onClick={() => selectDream(dream)}
              className="w-full p-6 text-left rounded-3xl bg-white shadow-sm border border-transparent hover:border-[#D4A373] transition-all flex justify-between items-center group"
            >
              <span className="text-lg" style={{ color: COLORS.text }}>{dream}</span>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#D4A373]" />
            </button>
          ))}
          <div className="pt-4 border-t border-gray-100">
            <input 
              placeholder="Or type your own..."
              className="w-full p-6 rounded-3xl bg-white shadow-sm outline-none focus:ring-1 focus:ring-[#D4A373]"
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
        {/* Milestone Achievement Popup */}
        {showMilestonePopup && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in zoom-in duration-300">
            <div className="bg-white rounded-[40px] p-8 text-center space-y-6 shadow-2xl w-full max-w-xs relative overflow-hidden">
               <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#FAEDCD] rounded-full opacity-50 blur-2xl" />
               <Trophy className="w-20 h-20 text-[#BC6C25] mx-auto animate-bounce" />
               <div className="space-y-2">
                 <h3 className="text-3xl font-bold italic" style={{ color: COLORS.text }}>{showMilestonePopup} Wins!</h3>
                 <p className="text-gray-500">You're officially building momentum, sis. Look at you go.</p>
               </div>
               <button 
                onClick={() => setShowMilestonePopup(null)}
                className="w-full py-4 bg-[#283618] text-white rounded-full font-bold shadow-lg"
               >
                 Keep Going
               </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between items-start">
          <div className="max-w-[70%]">
            <h2 className="text-3xl font-bold leading-tight italic" style={{ color: COLORS.text }}>{isDone ? 'Win Logged!' : 'Today\'s Step'}</h2>
            <p className="text-gray-500 truncate">{activeDream?.title || 'No dream active'}</p>
          </div>
          <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-bold shadow-sm transition-colors ${userState?.isPremium ? 'border-[#BC6C25] text-[#BC6C25]' : 'border-[#D4A373] text-[#D4A373]'}`}>
              {userState?.streak || 0}
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-400 mt-1 tracking-wider flex items-center">
              Streak {userState?.isPremium && <Zap className="w-2 h-2 ml-1 fill-[#BC6C25] text-[#BC6C25]" />}
            </span>
          </div>
        </div>

        {/* Milestone Progress Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
          <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-widest">
            <span>Next Milestone: {nextMilestone} Wins</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#CCD5AE] transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className={`relative flex-1 rounded-[40px] p-8 flex flex-col items-center justify-center text-center space-y-8 overflow-hidden transition-all duration-700 ${isDone ? 'bg-[#CCD5AE]' : 'bg-[#FAEDCD]'}`}>
          {loadingAction ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#D4A373]" />
              <p className="text-gray-400 text-sm italic">Thinking of your next step...</p>
            </div>
          ) : isDone ? (
            <div className="animate-in zoom-in duration-500 flex flex-col items-center space-y-6">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl">
                <CheckCircle2 className="w-12 h-12 text-[#283618]" />
              </div>
              <div>
                <h3 className="text-3xl font-bold text-[#283618]">Momentum built.</h3>
                <p className="text-[#283618]/70 mt-2 px-4 italic">"{GABBY_QUOTES[Math.floor(Date.now() / 86400000) % GABBY_QUOTES.length]}"</p>
              </div>
              <div className="flex flex-col space-y-4 w-full pt-8 px-4">
                <p className="text-sm font-medium uppercase tracking-widest text-[#283618]/50">See you tomorrow, sis.</p>
                <button 
                  onClick={() => setShareData({ title: userState!.wins[0]?.action || "Taking steps", subtitle: activeDream?.title || "my dream" })}
                  className="flex items-center justify-center space-x-2 bg-[#283618]/10 text-[#283618] py-4 rounded-full font-bold transition-all active:scale-95"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share Win</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-md animate-bounce-subtle">
                <Calendar className="w-10 h-10 text-[#D4A373]" />
              </div>
              <div className="space-y-4">
                <h3 className="text-3xl leading-snug px-2 italic font-bold" style={{ color: COLORS.text }}>{dailyAction?.task}</h3>
                <p className="text-gray-600 text-lg px-2">{dailyAction?.encouragement}</p>
              </div>
              <button 
                onClick={completeAction}
                className="mt-4 px-10 py-5 bg-[#283618] text-white rounded-full font-bold text-lg shadow-xl active:scale-95 transition-transform"
              >
                Log this Win
              </button>
            </>
          )}
          
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Plus className="w-20 h-20 rotate-45" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FAEDCD] flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center">
            {userState?.photoURL ? (
              <img src={userState.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[#BC6C25] font-bold text-lg">{getInitial()}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 italic">"You are closer than you think. Keep taking up space."</p>
        </div>
      </div>
    );
  };

  const renderWins = () => (
    <div className="flex flex-col h-full p-6 space-y-6 animate-in fade-in duration-500">
      <div className="mt-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold italic" style={{ color: COLORS.text }}>Your Wins</h2>
          <p className="text-gray-500 italic">Every small step is a giant leap.</p>
        </div>
        <button 
          onClick={() => setShareData({ title: `${userState?.wins.length} wins logged`, subtitle: "becoming my best self" })}
          className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 hover:text-[#D4A373] transition-colors"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 space-y-4 overflow-y-auto pb-20 px-1">
        {!userState?.wins || userState.wins.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center space-y-4">
            <History className="w-12 h-12 text-gray-200" />
            <p className="text-gray-400">No wins logged yet. Take that first step today!</p>
          </div>
        ) : (
          userState.wins.map((win, idx) => {
            const dream = userState.dreams.find(d => d.id === win.dreamId);
            return (
              <div key={win.id} className="bg-white p-6 rounded-3xl shadow-sm border-l-4 group relative" style={{ borderLeftColor: idx === 0 ? COLORS.primary : COLORS.muted }}>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setShareData({ title: win.action, subtitle: dream?.title || "my dream" })} className="p-2 text-gray-300 hover:text-gray-500">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">
                  {new Date(win.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
                <h4 className="text-lg font-bold pr-8" style={{ color: COLORS.text }}>{win.action}</h4>
                <p className="text-sm text-gray-500">{dream?.title}</p>
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
        <h2 className="text-3xl font-bold italic" style={{ color: COLORS.text }}>Your Profile</h2>
      </div>

      <div className="bg-white rounded-[40px] p-8 flex flex-col items-center space-y-6 shadow-sm relative overflow-hidden group">
        <div className="relative">
          <div className={`w-36 h-36 rounded-full overflow-hidden border-4 transition-all duration-300 shadow-xl ${uploadingPhoto ? 'scale-95 grayscale' : 'border-[#FAEDCD] scale-100'}`}>
            {userState?.photoURL ? (
              <img 
                src={userState.photoURL} 
                className="w-full h-full object-cover" 
                alt="Profile" 
              />
            ) : (
              <div className="w-full h-full bg-[#FAEDCD] flex items-center justify-center text-[#BC6C25] text-5xl font-serif">
                {getInitial()}
              </div>
            )}
            
            {uploadingPhoto && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] z-10">
                 <Loader2 className="w-10 h-10 animate-spin text-white" />
              </div>
            )}
          </div>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="absolute bottom-1 right-1 p-4 bg-[#283618] text-white rounded-full shadow-2xl active:scale-90 transition-all hover:bg-[#1a2410] disabled:opacity-50"
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
          <h3 className="text-2xl font-bold" style={{ color: COLORS.text }}>{userState?.displayName || (currentUser?.isAnonymous ? 'Guest' : 'Adventurer')}</h3>
          <p className="text-gray-400 font-medium text-sm">{userState?.email || 'Guest Sis'}</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Premium Perk: Monthly Dream Drops */}
        {userState?.isPremium && (
          <div className="bg-white rounded-3xl p-6 shadow-sm space-y-4">
             <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-[#BC6C25]" />
                <h3 className="font-bold text-sm uppercase tracking-widest text-gray-400">Monthly Dream Drops</h3>
             </div>
             <div className="space-y-3">
                {MONTHLY_DREAM_DROPS.map(drop => (
                  <div key={drop.id} className="p-4 bg-[#FEFAE0] rounded-2xl border border-[#D4A373]/20">
                    <h4 className="font-bold text-[#BC6C25]">{drop.title}</h4>
                    <p className="text-xs text-[#283618]/70 mt-1">{drop.description}</p>
                  </div>
                ))}
             </div>
          </div>
        )}

        <div className="bg-[#FEFAE0] p-6 rounded-3xl border border-[#D4A373]/20 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-[#BC6C25]" />
              <span className="font-bold text-[#BC6C25]">Dream Builder</span>
            </div>
            {userState?.isPremium ? (
              <span className="bg-[#BC6C25] text-white text-[10px] px-3 py-1 rounded-full uppercase font-bold tracking-widest">Active</span>
            ) : (
              <button onClick={() => setShowPaywall(true)} className="text-sm underline text-[#BC6C25] font-bold">UPGRADE</button>
            )}
          </div>
          <p className="text-sm text-[#BC6C25]/80">Support your growth with the full toolkit.</p>
          
          {userState?.isPremium && (
            <button 
              onClick={() => setShowRecap(true)}
              className="w-full py-4 bg-[#BC6C25] text-white rounded-2xl font-bold text-sm flex items-center justify-center space-x-3 shadow-md active:scale-95 transition-transform"
            >
              <Trophy className="w-5 h-5" />
              <span>Progress Recap</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <button 
            onClick={addAnotherDream}
            className="w-full p-6 bg-white rounded-3xl text-left flex items-center justify-between group shadow-sm active:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <Plus className="w-6 h-6 text-gray-300" />
              <span className="font-semibold text-gray-700">New Dream</span>
            </div>
            {!userState?.isPremium && (userState?.dreams?.length || 0) >= 1 && <Lock className="w-4 h-4 text-gray-300" />}
          </button>

          <button 
            onClick={handleSignOut}
            className="w-full p-6 bg-white rounded-3xl text-left flex items-center space-x-4 shadow-sm text-red-400 active:bg-red-50 transition-colors"
          >
            <LogOut className="w-6 h-6" />
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FAF9F6]">
        <Loader2 className="w-10 h-10 animate-spin text-[#D4A373]" />
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onSuccess={() => {}} />;
  }

  return (
    <div className="h-screen w-full max-w-md mx-auto relative flex flex-col bg-[#FAF9F6] shadow-2xl overflow-hidden">
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
        <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex items-center justify-around px-8 safe-area-bottom h-24 z-40 shadow-2xl">
          <button 
            onClick={() => setView('home')}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${view === 'home' ? 'text-[#D4A373] scale-110' : 'text-gray-300 hover:text-gray-400'}`}
          >
            <HomeIcon className={`w-7 h-7 ${view === 'home' ? 'fill-[#D4A373]/20' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
          </button>
          
          <button 
            onClick={() => setView('wins')}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${view === 'wins' ? 'text-[#D4A373] scale-110' : 'text-gray-300 hover:text-gray-400'}`}
          >
            <History className="w-7 h-7" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Wins</span>
          </button>
          
          <button 
            onClick={() => setView('settings')}
            className={`flex flex-col items-center space-y-1 transition-all duration-300 ${view === 'settings' ? 'text-[#D4A373] scale-110' : 'text-gray-300 hover:text-gray-400'}`}
          >
            <Settings className={`w-7 h-7 ${view === 'settings' ? 'animate-spin-slow' : ''}`} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
          </button>
        </div>
      )}
      
      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;

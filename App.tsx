
import React, { useState, useEffect, useRef } from 'react';
import { 
  History, 
  Settings, 
  ChevronRight,
  CheckCircle2,
  LogOut,
  Camera,
  Sparkles,
  Waves,
  BatteryMedium,
  BatteryLow,
  BatteryFull,
  Quote,
  Star,
  Zap,
  User,
  Moon,
  Sun,
  Upload,
  UserCircle,
  Share
} from 'lucide-react';
import { Category, UserState, Dream, Win, MicroAction, EnergyLevel, AppTheme } from './types.ts';
import { CATEGORIES, SUGGESTED_DREAMS, GABBY_QUOTES } from './constants.tsx';
import { generateMicroAction, generateLegacyReflection, generateIdentityEvolution, generateDailyAffirmation } from './services/geminiService.ts';
import { supabase } from './services/supabase.ts';
import Confetti from './components/Confetti.tsx';
import Auth from './components/Auth.tsx';
import ShareModal from './components/ShareModal.tsx';

const App: React.FC = () => {
  // --- STATE ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userState, setUserState] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'onboarding' | 'ritual' | 'evidence' | 'settings' | 'profile'>('onboarding');
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [dailyAction, setDailyAction] = useState<MicroAction | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [showEnergyPicker, setShowEnergyPicker] = useState(true);
  const [legacyReflection, setLegacyReflection] = useState<string | null>(null);
  const [dailyAffirmation, setDailyAffirmation] = useState<string | null>(null);
  const [identityTitle, setIdentityTitle] = useState<string>("Dreamer");
  const [showShareModal, setShowShareModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- AUTH & INITIALIZATION ---
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      if (user) {
        await loadUserData(user.id, user);
      } else {
        setUserState(null);
        setTimeout(() => setLoading(false), 3000);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userState?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userState?.theme]);

  const loadUserData = async (uid: string, authUser: any) => {
    try {
      const { data: userDoc } = await supabase.from('users').select('*').eq('uid', uid).maybeSingle();
      if (userDoc) {
        setUserState({
          ...userDoc,
          displayName: authUser.user_metadata?.display_name || userDoc.displayName,
          photoURL: authUser.user_metadata?.avatar_url || userDoc.photoURL,
          theme: userDoc.theme || 'light'
        });
        
        const activeDream = userDoc.dreams.find((d: any) => d.id === userDoc.activeDreamId);
        if (activeDream) {
          const [aff, title] = await Promise.all([
            generateDailyAffirmation(activeDream.title),
            generateIdentityEvolution(activeDream.title, userDoc.wins.slice(0, 3).map((w: any) => w.action))
          ]);
          setDailyAffirmation(aff);
          setIdentityTitle(title);
        }
        setView(userDoc.hasOnboarded ? 'ritual' : 'onboarding');
      } else {
        const initialState: UserState = {
          uid, email: authUser.email, displayName: authUser.user_metadata?.display_name || 'Adventurer', photoURL: null, hasOnboarded: false, activeDreamId: null, dreams: [], wins: [], streak: 0, lastCompletedDate: null, isPremium: false, streakProtectionEnabled: true, streakPausedUntil: null, milestonesReached: [], preferredEnergy: 'medium', theme: 'light'
        };
        await supabase.from('users').insert([initialState]);
        setUserState(initialState);
        setView('onboarding');
      }
    } catch (err) { console.error(err); } finally { 
      setTimeout(() => setLoading(false), 2500); 
    }
  };

  const syncUserData = async (updates: Partial<UserState>) => {
    if (!currentUser || !userState) return;
    setUserState(prev => prev ? ({ ...prev, ...updates }) : null);
    await supabase.from('users').update(updates).eq('uid', currentUser.id);
  };

  const toggleTheme = () => {
    const newTheme = userState?.theme === 'light' ? 'dark' : 'light';
    syncUserData({ theme: newTheme });
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        syncUserData({ photoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchAction = async (energyLevel: EnergyLevel) => {
    if (!userState?.activeDreamId) return;
    const activeDream = userState.dreams.find(d => d.id === userState.activeDreamId);
    if (!activeDream) return;
    setLoadingAction(true);
    // Pass identityTitle for a more personalized prompt context
    const action = await generateMicroAction(
      activeDream.category, 
      activeDream.title, 
      energyLevel,
      identityTitle
    );
    setDailyAction(action);
    setLoadingAction(false);
    setShowEnergyPicker(false);
  };

  const completeAction = async () => {
    const today = new Date().toISOString().split('T')[0];
    if (userState?.lastCompletedDate === today) return;

    setLoadingAction(true);
    const activeDream = userState!.dreams.find(d => d.id === userState!.activeDreamId);
    const reflection = await generateLegacyReflection(activeDream?.title || "", dailyAction?.task || "");
    setLegacyReflection(reflection);

    if (navigator.vibrate) navigator.vibrate([15, 50, 15]);
    setShowConfetti(true);

    const newWin: Win = {
      id: Math.random().toString(36).substr(2, 9),
      dreamId: userState!.activeDreamId!,
      action: dailyAction?.task || "Showed up today",
      timestamp: Date.now(),
      energyLevel: energy,
      reflection
    };

    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = (userState!.lastCompletedDate === yesterdayStr) ? userState!.streak + 1 : 1;
    
    if (userState!.wins.length > 0 && (userState!.wins.length + 1) % 3 === 0) {
      const newTitle = await generateIdentityEvolution(activeDream?.title || "", [newWin.action, ...userState!.wins.slice(0, 2).map(w => w.action)]);
      setIdentityTitle(newTitle);
    }

    await syncUserData({ wins: [newWin, ...userState!.wins], streak: newStreak, lastCompletedDate: today });
    setLoadingAction(false);
    setTimeout(() => setShowConfetti(false), 4500);
  };

  const RenderRitual = () => {
    const isDone = userState?.lastCompletedDate === new Date().toISOString().split('T')[0];
    const activeDream = userState?.dreams.find(d => d.id === userState?.activeDreamId);

    return (
      <div className="h-full p-8 flex flex-col items-center justify-center space-y-12 relative">
        <div className="absolute top-16 w-full flex justify-between px-8 animate-fade-in-up">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-charcoal/20 dark:text-white/20 uppercase tracking-[0.4em]">{identityTitle}</span>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-black italic text-primary leading-none">{userState?.streak || 0}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-pulse" />
            </div>
          </div>
          <button onClick={() => setView('profile')} className="btn-luxury w-12 h-12 rounded-full glass-silk overflow-hidden flex items-center justify-center border border-white/80">
            {userState?.photoURL ? (
              <img src={userState.photoURL} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-charcoal/20 dark:text-white/20" />
            )}
          </button>
        </div>

        {showEnergyPicker && !isDone ? (
          <div className="w-full space-y-10 text-center animate-fade-in-up">
            <div className="space-y-4">
              <div className="p-4 glass-silk rounded-3xl inline-block mb-2 border border-white/40">
                <p className="text-[10px] italic font-medium text-charcoal/70 dark:text-white/60 leading-relaxed max-w-[220px]">"{dailyAffirmation || GABBY_QUOTES[0]}"</p>
              </div>
              <h2 className="text-4xl font-bold italic text-charcoal dark:text-white tracking-tight">The Check-In</h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { l: 'low', t: 'Gentle', icon: <BatteryLow />, c: 'bg-orange-100/50 text-orange-500' },
                { l: 'medium', t: 'Focused', icon: <BatteryMedium />, c: 'bg-pink-100/50 text-pink-500' },
                { l: 'high', t: 'Powerful', icon: <BatteryFull />, c: 'bg-purple-100/50 text-purple-500' }
              ].map(lvl => (
                <button key={lvl.l} onClick={() => { setEnergy(lvl.l as EnergyLevel); fetchAction(lvl.l as EnergyLevel); }} className="btn-luxury p-6 glass-silk rounded-[2.8rem] flex items-center space-x-6 text-left border border-white/60">
                  <div className={`p-4 rounded-2xl ${lvl.c}`}>{lvl.icon}</div>
                  <div>
                    <h3 className="font-black text-charcoal dark:text-white text-base">{lvl.t} Ritual</h3>
                    <p className="text-[9px] opacity-40 dark:opacity-20 uppercase tracking-widest font-black mt-0.5">Capacity: {lvl.l} energy</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className={`w-full relative min-h-[500px] p-10 glass-silk rounded-[5rem] flex flex-col items-center justify-center text-center space-y-10 animate-fade-in-up border border-white/60 ${isDone ? 'ring-2 ring-primary/20' : ''}`}>
            {loadingAction ? (
               <div className="space-y-8 flex flex-col items-center">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-2 border-primary/10" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <div className="absolute inset-4 rounded-full border-2 border-cta/20 border-b-cta animate-spin [animation-duration:1.5s]" />
                  </div>
                  <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.5em] animate-pulse">Designing Tomorrow</p>
               </div>
            ) : isDone ? (
               <div className="space-y-10 animate-fade-in-up">
                  <div className="w-20 h-20 bg-primary/5 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-6">
                    <h3 className="text-3xl font-black italic text-charcoal dark:text-white leading-tight">Identity: Claimed.</h3>
                    <div className="p-8 glass-silk rounded-[3rem] italic text-sm text-charcoal/60 dark:text-white/50 leading-relaxed relative bg-white/20">
                      <Quote className="w-4 h-4 text-primary opacity-20 absolute -top-1 -left-1" />
                      "{legacyReflection || userState?.wins[0]?.reflection}"
                    </div>
                  </div>
                  <div className="space-y-4">
                    <button 
                      onClick={() => setShowShareModal(true)}
                      className="btn-luxury flex items-center justify-center space-x-3 px-8 py-5 bg-charcoal dark:bg-primary text-white rounded-full font-black text-xs shadow-xl"
                    >
                      <Share className="w-4 h-4" />
                      <span>Share This Shift</span>
                    </button>
                    <p className="text-[9px] text-charcoal/30 dark:text-white/20 font-black uppercase tracking-[0.4em]">The work of becoming is done for today. 🥂</p>
                  </div>

                  {showShareModal && (
                    <ShareModal 
                      title={userState?.wins[0]?.action || ""}
                      reflection={userState?.wins[0]?.reflection || ""}
                      identityTitle={identityTitle}
                      dreamTitle={activeDream?.title || ""}
                      theme={userState?.theme}
                      onClose={() => setShowShareModal(false)}
                    />
                  )}
               </div>
            ) : (
              <>
                <div className="space-y-10">
                  <div className="w-24 h-24 bg-primary/5 rounded-[3rem] flex items-center justify-center mx-auto animate-float-slow shadow-sm">
                    <Sparkles className="w-12 h-12 text-primary opacity-50" strokeWidth={1.5} />
                  </div>
                  <div className="space-y-5 px-2">
                    <h3 className="text-2xl font-black text-charcoal dark:text-white italic leading-snug">{dailyAction?.task}</h3>
                    <p className="text-charcoal/40 dark:text-white/40 text-sm font-medium leading-relaxed">{dailyAction?.encouragement}</p>
                  </div>
                </div>
                <button onClick={completeAction} className="btn-luxury w-full py-7 bg-charcoal dark:bg-primary text-white rounded-full font-black text-lg shadow-[0_20px_40px_rgba(31,41,55,0.2)]">
                  I Went Today.
                </button>
                <div className="pt-2 text-[9px] font-black text-primary/30 uppercase tracking-[0.4em]">Hold: {dailyAction?.braveNote}</div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const RenderLoading = () => (
    <div className="h-full flex flex-col items-center justify-center relative bg-background dark:bg-darkbg overflow-hidden transition-colors duration-500">
        <div className="pulse-orb animate-pulse-bloom" />
        <div className="pulse-orb animate-pulse-bloom [animation-delay:2s]" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="star-particle animate-orbit" style={{ 
            animationDelay: `${i * 3}s`,
            left: '50%', top: '50%', marginTop: '-2px', marginLeft: '-2px'
          }} />
        ))}
        <div className="z-10 text-center space-y-8 animate-fade-in-up">
            <div className="relative">
              <h1 className="text-5xl font-bold italic text-charcoal dark:text-white tracking-tighter">She Goes</h1>
              <div className="absolute -top-4 -right-4">
                <Zap className="w-6 h-6 text-primary fill-primary opacity-20 animate-pulse" />
              </div>
            </div>
            <div className="flex flex-col items-center space-y-3">
                <div className="w-12 h-px bg-charcoal/5 dark:bg-white/5" />
                <p className="text-[9px] font-black text-charcoal/20 dark:text-white/20 uppercase tracking-[0.6em] animate-pulse">Aligning Your Momentum</p>
            </div>
        </div>
    </div>
  );

  if (loading) return <RenderLoading />;
  if (!currentUser) return <Auth onSuccess={() => {}} />;

  return (
    <div className="app-container app-scroll relative">
      <div className="fixed inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-cta/5 pointer-events-none" />
      <Confetti active={showConfetti} />

      <main className="flex-1 relative z-10 overflow-y-auto no-scrollbar">
        {view === 'onboarding' ? (
          <div className="h-full flex flex-col p-8 pt-24 animate-fade-in-up">
            {onboardingStep === 1 ? (
              <div className="space-y-12">
                <div className="text-center space-y-4">
                   <h1 className="text-5xl font-bold italic text-charcoal dark:text-white tracking-tight">The Vision</h1>
                   <p className="text-charcoal/30 dark:text-white/30 font-black uppercase tracking-[0.4em] text-[10px]">What are we prioritizing?</p>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  {CATEGORIES.map(cat => (
                    <button key={cat.name} onClick={() => { setSelectedCategory(cat.name); setOnboardingStep(2); }} className="btn-luxury flex flex-col items-center justify-center p-8 glass-silk rounded-[3.5rem] aspect-square border border-white/60">
                      <div className="p-5 bg-white/90 dark:bg-white/10 rounded-full mb-4 shadow-sm" style={{ color: cat.color }}>{cat.icon}</div>
                      <span className="font-black text-center text-[10px] uppercase tracking-widest text-charcoal dark:text-white">{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-10">
                 <button onClick={() => setOnboardingStep(1)} className="btn-luxury text-charcoal/20 dark:text-white/20 text-[10px] font-black uppercase tracking-[0.4em] flex items-center"><ChevronRight className="w-4 h-4 rotate-180 mr-1" /> Refine Focus</button>
                 <h1 className="text-4xl font-bold italic text-charcoal dark:text-white leading-tight">Name the Dream.</h1>
                 <div className="space-y-4">
                   {selectedCategory && SUGGESTED_DREAMS[selectedCategory].map(dream => (
                     <button key={dream} onClick={async () => {
                       const newDream = { id: Math.random().toString(36).substr(2,9), category: selectedCategory!, title: dream, createdAt: Date.now() };
                       await syncUserData({ hasOnboarded: true, activeDreamId: newDream.id, dreams: [newDream] });
                       setView('ritual');
                     }} className="btn-luxury w-full p-10 text-left rounded-[3rem] glass-silk text-charcoal dark:text-white font-black text-xl leading-tight border border-white/60">{dream}</button>
                   ))}
                 </div>
              </div>
            )}
          </div>
        ) : view === 'ritual' ? <RenderRitual /> :
         view === 'evidence' ? (
           <div className="h-full p-8 pt-28 flex flex-col space-y-12 overflow-y-auto no-scrollbar pb-32 animate-fade-in-up">
             <div className="space-y-3">
               <h1 className="text-4xl font-bold italic text-charcoal dark:text-white">The Evidence</h1>
               <p className="text-charcoal/30 dark:text-white/30 font-black text-[10px] uppercase tracking-[0.4em]">Proof that you are becoming her</p>
             </div>
             <div className="space-y-6">
               {userState?.wins.map((win, idx) => (
                 <div key={win.id} className="p-10 glass-silk rounded-[4rem] space-y-6 border border-white/60 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5">
                      <Star className="w-20 h-20 text-primary rotate-12" />
                   </div>
                   <div className="flex justify-between items-center relative z-10">
                     <span className="text-[10px] font-black text-charcoal/20 dark:text-white/20 uppercase tracking-widest leading-none">{new Date(win.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                     <div className="w-2 h-2 rounded-full bg-primary/20" />
                   </div>
                   <h4 className="text-2xl font-black text-charcoal dark:text-white italic leading-snug relative z-10">"{win.action}"</h4>
                   {win.reflection && (
                     <div className="pt-6 border-t border-charcoal/5 dark:border-white/5 relative z-10">
                        <p className="text-[13px] text-charcoal/50 dark:text-white/50 leading-relaxed font-medium italic">"{win.reflection}"</p>
                     </div>
                   )}
                 </div>
               ))}
               {!userState?.wins.length && <div className="py-32 text-center text-charcoal/5 dark:text-white/5 font-black uppercase tracking-[1em]">Empty Space.</div>}
             </div>
           </div>
         ) : view === 'profile' ? (
           <div className="h-full p-8 pt-28 flex flex-col space-y-8 animate-fade-in-up pb-32">
             <div className="glass-silk rounded-[5rem] p-12 flex flex-col items-center space-y-8 border border-white/60 relative overflow-hidden">
                <div className="absolute top-4 right-8">
                   <button onClick={toggleTheme} className="btn-luxury p-3 glass-silk rounded-full border border-white/40">
                      {userState?.theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-primary" />}
                   </button>
                </div>

               <div className="relative group">
                 <div className="w-40 h-40 rounded-full border-8 border-white dark:border-slate-800 bg-stone-50 dark:bg-slate-900 overflow-hidden relative shadow-2xl transition-transform duration-500 group-hover:scale-105">
                    {userState?.photoURL ? (
                      <img src={userState.photoURL} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-stone-50 dark:bg-slate-800">
                        <UserCircle className="w-20 h-20 text-stone-200 dark:text-slate-700" />
                      </div>
                    )}
                 </div>
                 <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-luxury absolute bottom-1 right-1 p-3 bg-primary text-white rounded-full shadow-xl border-4 border-white dark:border-slate-800"
                 >
                   <Camera className="w-5 h-5" />
                 </button>
                 <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />
               </div>

               <div className="text-center space-y-1">
                  <h2 className="text-3xl font-black italic text-charcoal dark:text-white tracking-tight">{userState?.displayName}</h2>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">{identityTitle}</p>
               </div>
             </div>

             <div className="space-y-4">
               <button onClick={() => { syncUserData({ hasOnboarded: false }); setOnboardingStep(1); setView('onboarding'); }} className="btn-luxury w-full p-8 glass-silk rounded-[2.5rem] text-left font-black text-charcoal dark:text-white uppercase tracking-[0.2em] text-[11px] flex justify-between items-center border border-white/60">
                  Refocus Path <ChevronRight className="w-4 h-4 opacity-20" />
               </button>
               <button onClick={() => supabase.auth.signOut()} className="btn-luxury w-full p-8 bg-red-50/30 dark:bg-red-900/20 text-red-400 rounded-[2.5rem] text-left font-black uppercase tracking-[0.2em] text-[11px] flex items-center space-x-5 border border-red-100/30 dark:border-red-900/30">
                  <LogOut className="w-5 h-5 opacity-40" /> <span>Logout</span>
               </button>
             </div>
           </div>
         ) : (
           <div className="h-full p-8 pt-28 flex flex-col space-y-8 animate-fade-in-up">
              <div className="space-y-3">
                <h1 className="text-4xl font-bold italic text-charcoal dark:text-white">Settings</h1>
                <p className="text-charcoal/30 dark:text-white/30 font-black text-[10px] uppercase tracking-[0.4em]">Personalize your ritual</p>
              </div>
              <div className="space-y-4">
                 <div className="p-8 glass-silk rounded-[3rem] border border-white/60 flex justify-between items-center">
                    <div>
                       <h4 className="font-black text-charcoal dark:text-white">Appearance</h4>
                       <p className="text-xs text-charcoal/40 dark:text-white/40">Switch between light and dark</p>
                    </div>
                    <button onClick={toggleTheme} className="btn-luxury px-6 py-3 bg-primary text-white font-black rounded-full shadow-lg">
                       {userState?.theme === 'dark' ? 'Light' : 'Dark'}
                    </button>
                 </div>
                 <div className="p-8 glass-silk rounded-[3rem] border border-white/60 flex justify-between items-center">
                    <div>
                       <h4 className="font-black text-charcoal dark:text-white">Streak Guard</h4>
                       <p className="text-xs text-charcoal/40 dark:text-white/40">Keep momentum even if you miss</p>
                    </div>
                    <div className="w-12 h-6 bg-primary/20 rounded-full relative">
                       <div className="absolute top-1 left-1 w-4 h-4 bg-primary rounded-full shadow-sm" />
                    </div>
                 </div>
              </div>
           </div>
         )}
      </main>

      {userState?.hasOnboarded && view !== 'onboarding' && (
        <nav className="fixed bottom-0 left-0 right-0 glass-silk border-t border-white/50 dark:border-white/10 safe-bottom flex items-center justify-around px-4 z-20 h-auto">
          {[
            { v: 'ritual', i: <Waves />, l: 'Ritual' },
            { v: 'evidence', i: <History />, l: 'Evidence' },
            { v: 'settings', i: <Settings />, l: 'Settings' },
            { v: 'profile', i: <User />, l: 'Me' }
          ].map(tab => (
            <button 
              key={tab.v} 
              onClick={() => { setView(tab.v as any); if(tab.v === 'ritual') setShowEnergyPicker(true); }} 
              className={`btn-luxury flex flex-col items-center space-y-1.5 transition-all py-5 px-4 min-w-[70px] ${view === tab.v ? 'text-primary' : 'text-charcoal/30 dark:text-white/30'}`}
            >
              <div className={`${view === tab.v ? 'scale-125' : ''} transition-all duration-500`}>
                 {React.cloneElement(tab.i as React.ReactElement<any>, { strokeWidth: view === tab.v ? 2.5 : 2 })}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-[0.3em] transition-opacity ${view === tab.v ? 'opacity-100' : 'opacity-40'}`}>
                {tab.l}
              </span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default App;

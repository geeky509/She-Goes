
export type Category = 'Travel' | 'Career & Money' | 'Confidence' | 'Lifestyle Upgrade';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type AppTheme = 'light' | 'dark';

export interface Dream {
  id: string;
  category: Category;
  title: string;
  createdAt: number;
}

export interface Win {
  id: string;
  dreamId: string;
  action: string;
  timestamp: number;
  reflection?: string;
  energyLevel?: EnergyLevel;
}

export interface UserState {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  hasOnboarded: boolean;
  activeDreamId: string | null;
  dreams: Dream[];
  wins: Win[];
  streak: number;
  lastCompletedDate: string | null; 
  isPremium: boolean;
  streakProtectionEnabled: boolean;
  streakPausedUntil: string | null; // ISO Date for grace period
  milestonesReached: number[];
  preferredEnergy: EnergyLevel;
  theme: AppTheme;
}

export interface MicroAction {
  task: string;
  encouragement: string;
  braveNote?: string;
}

export interface DreamDrop {
  id: string;
  title: string;
  description: string;
  category: Category;
}

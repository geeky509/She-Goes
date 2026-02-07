
export type Category = 'Travel' | 'Career & Money' | 'Confidence' | 'Lifestyle Upgrade';

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
  lastCompletedDate: string | null; // ISO Date YYYY-MM-DD
  isPremium: boolean;
  milestonesReached: number[]; // e.g. [3, 7, 15]
}

export interface MicroAction {
  task: string;
  encouragement: string;
}

export interface DreamDrop {
  id: string;
  title: string;
  description: string;
  category: Category;
}

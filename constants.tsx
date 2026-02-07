
import React from 'react';
import { Plane, Briefcase, Sparkles, Home, Heart } from 'lucide-react';
import { Category, DreamDrop } from './types';

export const COLORS = {
  primary: '#EC4899',   // Pink
  cta: '#8B5CF6',       // Purple
  background: '#FEF3C7', // Warm Cream
  text: '#1F2937',      // Charcoal
  accent: '#F59E0B',    // Orange
  white: '#FFFFFF',
  muted: '#FDE68A'      // Lighter yellow/cream
};

export const CATEGORIES: { name: Category; icon: React.ReactNode; color: string }[] = [
  { name: 'Travel', icon: <Plane className="w-6 h-6" />, color: '#EC4899' },
  { name: 'Career & Money', icon: <Briefcase className="w-6 h-6" />, color: '#8B5CF6' },
  { name: 'Confidence', icon: <Sparkles className="w-6 h-6" />, color: '#F59E0B' },
  { name: 'Lifestyle Upgrade', icon: <Home className="w-6 h-6" />, color: '#1F2937' },
];

export const SUGGESTED_DREAMS: Record<Category, string[]> = {
  'Travel': ['Solo trip to Italy', 'Move to a new city', 'First business class flight', 'Bucket list safari'],
  'Career & Money': ['Negotiate my salary', 'Start a side hustle', 'Save my first $10k', 'Launch a personal brand'],
  'Confidence': ['Speak at a conference', 'Master a new skill', 'Say "no" more often', 'Wear what makes me feel bold'],
  'Lifestyle Upgrade': ['Design my dream home', 'Host a luxury dinner party', 'Join a private club', 'Prioritize daily rest'],
};

export const GABBY_QUOTES = [
  "You've got this, sis. ✨",
  "Your dream is valid. Let's move towards it! 🚀",
  "Permission granted. Now, let's take one step. 💅",
  "Growth happens in the small moments. 🌱",
  "Worldly, wealthy, and well-rested. That's the vibe. 🥂"
];

export const MILESTONES = [3, 7, 15, 30, 50, 100];

export const MONTHLY_DREAM_DROPS: DreamDrop[] = [
  {
    id: 'dd-1',
    title: 'The Wealthy Woman Audit',
    description: 'Look at your bank statement. Not with shame, but with curiosity. Where is your money going? Does it serve your dream?',
    category: 'Career & Money'
  },
  {
    id: 'dd-2',
    title: 'The Solo Date Challenge',
    description: 'Take yourself out. No phone, just you and your thoughts. Practice being your own best company.',
    category: 'Confidence'
  },
  {
    id: 'dd-3',
    title: 'The Passport Refresh',
    description: 'Check your expiration date. Even if you don’t have a trip booked yet, verify your status. Readiness is half the battle.',
    category: 'Travel'
  }
];


import React from 'react';
import { Plane, Briefcase, Sparkles, Home, Heart } from 'lucide-react';
import { Category, DreamDrop } from './types';

export const COLORS = {
  primary: '#EC4899',   // PacksLight Pink
  cta: '#8B5CF6',       // Royal Purple
  background: '#FEF3C7', // Warm Cream
  text: '#1F2937',      // Charcoal
  accent: '#F59E0B',    // Orange
  softPink: '#FFD1E3',
  white: '#FFFFFF',
};

export const CATEGORIES: { name: Category; icon: React.ReactNode; color: string }[] = [
  { name: 'Travel', icon: <Plane className="w-6 h-6" strokeWidth={1.5} />, color: '#EC4899' },
  { name: 'Career & Money', icon: <Briefcase className="w-6 h-6" strokeWidth={1.5} />, color: '#8B5CF6' },
  { name: 'Confidence', icon: <Sparkles className="w-6 h-6" strokeWidth={1.5} />, color: '#F59E0B' },
  { name: 'Lifestyle Upgrade', icon: <Home className="w-6 h-6" strokeWidth={1.5} />, color: '#1F2937' },
];

export const SUGGESTED_DREAMS: Record<Category, string[]> = {
  'Travel': ['Living as a digital nomad in Lisbon', 'First solo luxury getaway', 'Booking a multi-country train tour', 'Starting a travel fund for my parents'],
  'Career & Money': ['Launching my creative studio', 'Negotiating for full remote work', 'Reaching my first $50k net worth', 'Getting paid to speak on stage'],
  'Confidence': ['Reclaiming my voice in meetings', 'Building a capsule wardrobe that feels like ME', 'Setting radical boundaries with family', 'Mastering the art of saying "no"'],
  'Lifestyle Upgrade': ['Finding my perfect morning ritual', 'Upgrading my home office to a sanctuary', 'Investing in daily rest and wellness', 'Hosting curated dinner parties'],
};

export const GABBY_QUOTES = [
  "You are the authority of your own joy.",
  "Permission is already granted. Proceed.",
  "Worldly, wealthy, and well-rested. That's the only plan.",
  "Small steps aren't just progress. They are proof.",
  "You don't have to be 'ready' to be worthy."
];

export const MILESTONES = [3, 7, 14, 30, 90, 365];

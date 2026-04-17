// lib/types.ts

export interface UserProfile {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  summary?: string;
  experience: ExperienceLevel;
  coreSkills: string[];
  industries: string[];
  preferredRoles: string[];
  education?: string[];
  certifications?: string[];
  languages?: string[];
}

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

export interface JobFilters {
  location?: string;
  industry?: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'freelance';
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  employmentType?: string;
  remote?: boolean;
  url: string;
  postedDate?: string;
  source: 'jsearch' | 'mock' | 'supabase' | 'serp';
  isArabic?: boolean;
  isMock?: boolean;  // true when job comes from local mock data (Stage 3 fallback)
}

export interface JobMatch extends Job {
  matchScore: number;
  insights: {
    keyMatches: string[];
    missingSkills: string[];
    actionableInsight: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ProfileUpdateRequest {
  profile: UserProfile;
  instruction: string;
}

// ─── Supabase Preparation ─────────────────────────────────────────────────────
// TODO: Replace with Supabase-generated types after `supabase gen types typescript`

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  isPremium: boolean;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  website?: string;
  industry?: string;
  country?: string;
}

// ─── Paywall / Stripe Preparation ────────────────────────────────────────────
export type PlanTier = 'free' | 'basic' | 'pro';

export interface SubscriptionStatus {
  userId: string;
  tier: PlanTier;
  expiresAt?: string;
}
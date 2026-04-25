// lib/types.ts

export type UserRole = 'candidate' | 'employer';

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
  role?: UserRole;
}

export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'lead' | 'executive';

export interface JobFilters {
  keyword?: string;
  location?: string;
  industry?: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'freelance';
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
}

export type JobSource =
  | 'jsearch'
  | 'mock'
  | 'supabase'
  | 'serp'
  | 'scraped'
  | 'employer_posted';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements?: string;
  salary?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  employmentType?: string;
  remote?: boolean;
  url: string;
  postedDate?: string;
  source: JobSource;
  company_id?: string | null;
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

// B2B Employer Portal — companies row (mirrors Supabase `companies` table)
export interface Company {
  id: string;
  employer_id: string;
  name: string;
  website?: string | null;
  logo_url?: string | null;
  description?: string | null;
  created_at: string;
}

// Input shape used by the upsertCompany Server Action / form
export interface CompanyInput {
  name: string;
  website?: string;
  logo_url?: string;
  description?: string;
}

// Input shape used by the postJob Server Action / form
export interface JobPostInput {
  title: string;
  location: string;
  description: string;
  requirements?: string;
  employment_type?: string;
  remote?: boolean;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;
  url?: string;
}

// ─── Paywall / Stripe Preparation ────────────────────────────────────────────
export type PlanTier = 'free' | 'basic' | 'pro';

export interface SubscriptionStatus {
  userId: string;
  tier: PlanTier;
  expiresAt?: string;
}
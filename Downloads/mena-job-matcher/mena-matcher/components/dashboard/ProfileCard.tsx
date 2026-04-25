'use client';
// components/dashboard/ProfileCard.tsx
import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import {
  User, Briefcase, MapPin, Award, Languages,
  Pencil, Check, X, Loader2, Star, UploadCloud,
} from 'lucide-react';
import { useLang } from '@/lib/i18n/LanguageContext';
import { createClient, saveProfile } from '@/lib/supabase';
import { LocationSelector } from '@/components/ui/LocationSelector';

interface ProfileCardProps {
  profile: UserProfile;
  onProfileUpdate?: (updated: UserProfile) => void;
  onRequestReUpload?: () => void;
  onSaveSuccess?: (updated: UserProfile, previous: UserProfile) => void;
}

const EXP_COLORS: Record<string, string> = {
  entry:     'bg-blue-50 text-blue-700',
  mid:       'bg-emerald-50 text-emerald-700',
  senior:    'bg-orange-50 text-orange-700',
  lead:      'bg-purple-50 text-purple-700',
  executive: 'bg-rose-50 text-rose-700',
};

// ── Profile completeness score ────────────────────────────────────────────────
function calcCompleteness(p: UserProfile): number {
  const checks = [
    !!p.name?.trim(),
    !!p.email?.trim(),
    !!p.location?.trim(),
    !!p.summary?.trim(),
    (p.coreSkills?.length ?? 0) >= 3,
    (p.preferredRoles?.length ?? 0) >= 1,
    (p.education?.length ?? 0) >= 1,
    (p.languages?.length ?? 0) >= 1,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function CompletenessBar({ profile, isAr }: { profile: UserProfile; isAr: boolean }) {
  const pct = calcCompleteness(profile);
  const color =
    pct >= 80 ? 'bg-emerald-500' :
    pct >= 50 ? 'bg-amber-400'   :
                'bg-red-400';

  const tip = pct >= 100
    ? (isAr ? '✨ ملفك مكتمل!' : '✨ Profile complete!')
    : pct >= 70
    ? (isAr ? `${pct}% — أضف المزيد للحصول على تطابقات أفضل` : `${pct}% — Add more to get better matches`)
    : (isAr ? `${pct}% — أكمل ملفك الشخصي` : `${pct}% — Complete your profile`);

  return (
    <div className="px-5 pt-4 pb-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">
          {isAr ? 'اكتمال الملف' : 'Profile completeness'}
        </span>
        <span className="text-[11px] font-bold text-neutral-600">{pct}%</span>
      </div>
      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct < 100 && (
        <p className="text-[11px] text-neutral-400 mt-1.5">{tip}</p>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function ProfileCard({ profile, onProfileUpdate, onRequestReUpload, onSaveSuccess }: ProfileCardProps) {
  const { t, lang } = useLang();
  const isAr = lang === 'ar';

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [saveOk,    setSaveOk]    = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [name,       setName]       = useState(profile.name       ?? '');
  const [summary,    setSummary]    = useState(profile.summary    ?? '');
  const [skillsText, setSkillsText] = useState(profile.coreSkills?.join(', ')     ?? '');
  const [rolesText,  setRolesText]  = useState(profile.preferredRoles?.join(', ') ?? '');
  const [location,   setLocation]   = useState(profile.location   ?? '');

  const expLabels: Record<string, string> = {
    entry: t.entry, mid: t.mid, senior: t.senior,
    lead: t.lead,   executive: t.executive,
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveOk(false);
    try {
      const updated: UserProfile = {
        ...profile,
        name:           name.trim()      || profile.name,
        summary:        summary.trim()   || profile.summary,
        location:       location.trim()  || profile.location,
        coreSkills:     skillsText.split(',').map((s) => s.trim()).filter(Boolean),
        preferredRoles: rolesText.split(',').map((s) => s.trim()).filter(Boolean),
      };
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await saveProfile(updated);
      } catch { /* guest */ }
      onProfileUpdate?.(updated);
      onSaveSuccess?.(updated, profile);  // pass previous for undo
      setSaveOk(true);
      setTimeout(() => { setSaveOk(false); setIsEditing(false); }, 900);
    } catch {
      setSaveError(isAr ? 'فشل الحفظ' : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(profile.name ?? '');
    setSummary(profile.summary ?? '');
    setSkillsText(profile.coreSkills?.join(', ')     ?? '');
    setRolesText(profile.preferredRoles?.join(', ')  ?? '');
    setLocation(profile.location ?? '');
    setSaveError(null);
    setIsEditing(false);
  };

  const inp = 'w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all placeholder:text-slate-300';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
      {/* Gradient header */}
      <div className="bg-gradient-to-br from-primary-500 to-orange-600 px-5 py-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              {isEditing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/20 text-white placeholder-white/50 border border-white/30 rounded-lg px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white/40"
                  placeholder={isAr ? 'الاسم' : 'Full name'}
                />
              ) : (
                <p className="text-white font-semibold text-base leading-tight truncate">
                  {profile.name || t.yourProfile}
                </p>
              )}
              {profile.email && (
                <p className="text-white/60 text-xs mt-0.5 truncate">{profile.email}</p>
              )}
            </div>
          </div>
          {!isEditing ? (
            <div className="flex gap-1.5 flex-shrink-0">
              {/* Re-upload CV */}
              {onRequestReUpload && (
                <button
                  onClick={onRequestReUpload}
                  title={isAr ? 'رفع سيرة ذاتية جديدة' : 'Re-upload CV'}
                  className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-white" />
                </button>
              )}
              {/* Edit profile */}
              <button
                onClick={() => setIsEditing(true)}
                title={isAr ? 'تعديل الملف' : 'Edit profile'}
                className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors"
              >
                <Pencil className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={handleSave} disabled={isSaving} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors disabled:opacity-50">
                {isSaving ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Check className="w-3.5 h-3.5 text-white" />}
              </button>
              <button onClick={handleCancel} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors">
                <X className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Completeness bar */}
      <CompletenessBar profile={profile} isAr={isAr} />

      {/* Body */}
      <div className="px-5 pb-5 space-y-4">
        {saveOk && (
          <div className="flex items-center gap-2 text-emerald-700 text-xs bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg">
            <Check className="w-3.5 h-3.5" />
            {isAr ? 'تم الحفظ بنجاح ✓' : 'Saved successfully ✓'}
          </div>
        )}
        {saveError && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{saveError}</p>
        )}

        {/* Experience */}
        <div>
          <Label icon={<Briefcase className="w-3.5 h-3.5" />} text={t.experienceLevel} />
          <span className={`badge text-xs mt-1 inline-flex ${EXP_COLORS[profile.experience] ?? 'bg-slate-100 text-slate-600'}`}>
            <Star className="w-3 h-3" />
            {expLabels[profile.experience] ?? profile.experience}
          </span>
        </div>

        {/* Location */}
        <div>
          <Label icon={<MapPin className="w-3.5 h-3.5" />} text={t.location} />
          {isEditing ? (
            <div className="mt-1">
              <LocationSelector
                key={`loc-${isEditing}`}
                value={location}
                onChange={setLocation}
                allowCountryOnly
                required={false}
                className="grid grid-cols-2 gap-2"
              />
            </div>
          ) : (
            <p className="text-sm text-neutral-700 mt-1">{profile.location || '—'}</p>
          )}
        </div>

        {/* Skills */}
        <div>
          <Label icon={<Award className="w-3.5 h-3.5" />} text={t.coreSkills} />
          {isEditing ? (
            <textarea value={skillsText} onChange={(e) => setSkillsText(e.target.value)} rows={2} className={inp + ' resize-none mt-1'} placeholder={isAr ? 'مهارات مفصولة بفاصلة' : 'Comma-separated skills'} />
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {profile.coreSkills?.map((s, i) => (
                <span key={i} className="badge bg-primary-50 text-primary-700 text-[11px]">{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Roles */}
        <div>
          <Label icon={<Briefcase className="w-3.5 h-3.5" />} text={isAr ? 'الأدوار المفضلة' : 'Preferred Roles'} />
          {isEditing ? (
            <textarea value={rolesText} onChange={(e) => setRolesText(e.target.value)} rows={2} className={inp + ' resize-none mt-1'} placeholder={isAr ? 'أدوار مفصولة بفاصلة' : 'Comma-separated roles'} />
          ) : (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {profile.preferredRoles?.map((r, i) => (
                <span key={i} className="badge bg-secondary-100 text-secondary-700 text-[11px]">{r}</span>
              ))}
            </div>
          )}
        </div>

        {/* Languages */}
        {(profile.languages?.length ?? 0) > 0 && (
          <div>
            <Label icon={<Languages className="w-3.5 h-3.5" />} text={t.languages} />
            <p className="text-sm text-neutral-600 mt-1">{profile.languages?.join(' · ')}</p>
          </div>
        )}

        {/* Summary */}
        <div>
          {isEditing ? (
            <>
              <Label icon={null} text={isAr ? 'الملخص' : 'Summary'} />
              <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} className={inp + ' resize-none mt-1'} placeholder={isAr ? 'ملخص مهني' : 'Professional summary'} />
            </>
          ) : (
            profile.summary && (
              <p className="text-xs text-neutral-500 italic leading-relaxed border-s-2 border-primary-200 ps-3">
                {profile.summary}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Label({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5">
      {icon}{text}
    </p>
  );
}
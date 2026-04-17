// lib/openai.ts — MENA Edition v3
import OpenAI from 'openai';
import { UserProfile, JobMatch, Job } from './types';
import { Language } from './i18n/translations';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Text Cleaner ─────────────────────────────────────────────────────────────
/**
 * Sanitises raw CV text before sending to OpenAI:
 * 1. Normalise line endings
 * 2. Strip non-printable control characters (null bytes, BOM, etc.)
 * 3. Collapse consecutive whitespace / blank lines
 * 4. Hard-limit to 20,000 characters (~5 k tokens) — safe for 30 k TPM
 */
export function cleanText(raw: string, maxChars = 20_000): string {
  return raw
    .replace(/\r\n|\r/g, '\n')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F\uFEFF]/g, '')
    .replace(/[^\S\n]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, maxChars);
}

// ─── CV Extraction ────────────────────────────────────────────────────────────
export async function extractProfileFromCV(
  cvText: string,
  lang: Language = 'en'
): Promise<UserProfile> {
  const cleaned = cleanText(cvText);
  const isArabic = lang === 'ar';

  // SYSTEM — role + strict no-placeholder rule
  const system = isArabic
    ? `أنت محلل سير ذاتية متخصص في سوق العمل بمنطقة الشرق الأوسط وشمال أفريقيا.

قواعد صارمة:
1. استخرج المعلومات الحقيقية من نص السيرة الذاتية فقط.
2. لا تستخدم أبداً كلمات مثل "مهارة1" أو "قطاع1" أو أي نص من الأمثلة — هذه أمثلة للتنسيق فقط وليست بيانات.
3. إذا لم تجد معلومة في النص، أعد null لذلك الحقل.
4. أعد JSON نظيفاً فقط — بدون أي نص إضافي أو markdown.`
    : `You are a CV analyst specialising in the MENA job market.

Strict rules:
1. Extract ONLY real information found in the CV text below.
2. NEVER output placeholder words like "skill1", "industry1", "role1" — those are format examples only.
3. If a piece of information is not present in the CV text, return null for that field.
4. Return clean JSON only — no extra text, no markdown fences.
5. CRITICAL: ALL output values MUST be in English. If the CV is in German, Arabic, French, or any other language, translate every skill, role, industry, summary and education item into English. Example: "Objektorientierte Programmierung" → "Object-Oriented Programming", "Junior-Entwickler" → "Junior Developer", "Zeitmanagement" → "Time Management".`;

  // USER — schema (NO example values) + the actual CV
  const schema = isArabic
    ? `أعد JSON بالحقول التالية (القيم مستخرجة من النص فقط):
{
  "name": الاسم الكامل أو null,
  "email": البريد الإلكتروني أو null,
  "phone": رقم الهاتف أو null,
  "location": الموقع الجغرافي أو null,
  "summary": ملخص مهني موجز بناءً على المحتوى الفعلي أو null,
  "experience": واحدة من: "entry" أو "mid" أو "senior" أو "lead" أو "executive",
  "coreSkills": مصفوفة بالمهارات الحقيقية (5-10),
  "industries": مصفوفة بالقطاعات الحقيقية,
  "preferredRoles": مصفوفة بالأدوار المناسبة بناءً على الخبرة الفعلية,
  "education": مصفوفة بالمؤهلات الحقيقية أو [],
  "certifications": مصفوفة بالشهادات الحقيقية أو [],
  "languages": مصفوفة باللغات الحقيقية أو []
}`
    : `Return JSON with the following fields (values extracted from the CV only):
{
  "name": full name or null,
  "email": email address or null,
  "phone": phone number or null,
  "location": geographic location or null,
  "summary": short professional summary based on actual content or null,
  "experience": one of "entry" | "mid" | "senior" | "lead" | "executive",
  "coreSkills": array of real skills from the CV (5-10 items),
  "industries": array of actual industries,
  "preferredRoles": array of appropriate roles based on real experience,
  "education": array of actual qualifications or [],
  "certifications": array of actual certifications or [],
  "languages": array of actual languages or []
}`;

  const user = `${schema}

=== CV TEXT ===
${cleaned}
=== END OF CV ===`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: system },
      { role: 'user',   content: user },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');
  return JSON.parse(content);
}

// ─── English Keyword Extraction (for multilingual CVs) ───────────────────────
/**
 * Sends raw CV text to GPT-4o-mini and gets back 15-20 standardised English
 * keywords (skills, titles, industries). Fast + cheap — one small API call.
 */
export async function extractEnglishKeywords(cvText: string): Promise<string[]> {
  const cleaned = cleanText(cvText, 8_000);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a strict data extraction bot. Your ONLY job is to extract core professional skills, tools, and job titles from CV text and translate them into Standard English. ' +
          'RULES: ' +
          '1. ALWAYS translate to English — if input is German, Arabic, French or any other language, translate every item. ' +
          '2. Return ONLY a comma-separated list of 15-20 English terms. ' +
          '3. No explanations, no numbering, no extra text, no markdown. ' +
          'Example output: Java, Object-Oriented Programming, SQL, Problem Solving, Teamwork, Product Management',
      },
      {
        role: 'user',
        content: `Extract and translate to English keywords from this CV:\n\n${cleaned}`,
      },
    ],
    temperature: 0,
    max_tokens:  200,
  });

  const raw = response.choices[0].message.content ?? '';
  return raw
    .split(',')
    .map(k => k.trim())
    .filter(k => k.length > 1 && k.length < 50 && /^[a-zA-Z0-9\s\+\#\.\-\/]+$/.test(k)) // English only
    .slice(0, 20);
}


export async function prescoreJobs(
  jobs: Job[],
  profile: UserProfile
): Promise<{ id: string; score: number }[]> {
  // Build a compact profile summary
  const profileSummary = `${profile.experience} | ${profile.coreSkills.slice(0, 5).join(', ')} | ${profile.preferredRoles.slice(0, 2).join(', ')}`;

  // Score all jobs in one single API call
  const jobList = jobs.map((j, i) =>
    `${i}: ${j.title} at ${j.company} (${j.location}) — ${j.description.slice(0, 150)}`
  ).join('\n');

  const prompt = `Rate how well each job matches this candidate profile.
Profile: ${profileSummary}

Jobs:
${jobList}

Respond with JSON only: {"scores": [{"index": 0, "score": 85}, ...]}
Score 0-100. Be quick and decisive.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    response_format: { type: 'json_object' },
    max_tokens: 500,
  });

  const content = response.choices[0].message.content;
  if (!content) return jobs.map((j) => ({ id: j.id, score: 50 }));

  const parsed = JSON.parse(content);
  return parsed.scores.map((s: { index: number; score: number }) => ({
    id: jobs[s.index]?.id ?? '',
    score: s.score,
  }));
}

// ─── Job Matching ─────────────────────────────────────────────────────────────
export async function matchJobWithProfile(
  job: Job,
  profile: UserProfile,
  lang: Language = 'en'
): Promise<JobMatch> {
  const isArabic = lang === 'ar';

  const prompt = isArabic
    ? `أنت خبير في مطابقة الوظائف. قيّم مدى تطابق هذه الوظيفة مع ملف المرشح.

ملف المرشح:
- مستوى الخبرة: ${profile.experience}
- المهارات الأساسية: ${profile.coreSkills.join('، ')}
- القطاعات: ${profile.industries.join('، ')}
- الأدوار المفضلة: ${profile.preferredRoles.join('، ')}

الوظيفة:
- المسمى: ${job.title}
- الشركة: ${job.company}
- الموقع: ${job.location}
- الوصف: ${job.description.slice(0, 1000)}

أجب فقط بـ JSON:
{
  "matchScore": رقم من 0 إلى 100,
  "keyMatches": مصفوفة 2-4 أسباب حقيقية للتوافق,
  "missingSkills": مصفوفة 1-3 مهارات ناقصة أو مفيدة,
  "actionableInsight": نصيحة واحدة ملموسة للتقديم
}`
    : `You are a job-matching expert. Evaluate how well this job matches the candidate.

CANDIDATE:
- Experience: ${profile.experience}
- Skills: ${profile.coreSkills.join(', ')}
- Industries: ${profile.industries.join(', ')}
- Preferred Roles: ${profile.preferredRoles.join(', ')}

JOB:
- Title: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Description: ${job.description.slice(0, 1000)}

Respond with JSON only:
{
  "matchScore": number 0-100,
  "keyMatches": array of 2-4 real matching reasons,
  "missingSkills": array of 1-3 missing or helpful skills,
  "actionableInsight": one concrete application tip
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');
  const ins = JSON.parse(content);

  return {
    ...job,
    matchScore: ins.matchScore,
    insights: {
      keyMatches: ins.keyMatches,
      missingSkills: ins.missingSkills,
      actionableInsight: ins.actionableInsight,
    },
  };
}

// ─── Chat Profile Update ──────────────────────────────────────────────────────
export async function updateProfileWithChat(
  currentProfile: UserProfile,
  instruction: string,
  lang: Language = 'en'
): Promise<UserProfile> {
  const isArabic = lang === 'ar';

  const prompt = isArabic
    ? `أنت مساعد لتحسين الملف الشخصي. يريد المستخدم تعديل ملفه.

الملف الحالي:
${JSON.stringify(currentProfile, null, 2)}

طلب المستخدم: ${instruction}

أجب فقط بالملف المحدّث كـ JSON بنفس التنسيق. غيّر الحقول ذات الصلة فقط.`
    : `You are a profile assistant. The user wants to update their profile.

CURRENT PROFILE:
${JSON.stringify(currentProfile, null, 2)}

INSTRUCTION: ${instruction}

Respond ONLY with the updated profile JSON. Only change relevant fields.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  if (!content) throw new Error('No response from OpenAI');
  return JSON.parse(content);
}
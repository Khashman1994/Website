// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { UserProfile } from '@/lib/types';
import { Language } from '@/lib/i18n/translations';
import { createServerSupabaseClient, saveProfile, loadProfile } from '@/lib/supabase';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ─── Build the coach persona system prompt ────────────────────────────────────
function buildSystemPrompt(profile: UserProfile, lang: Language): string {
  const isAr   = lang === 'ar';
  const name   = profile.name   ?? (isAr ? 'المستخدم' : 'the user');
  const loc    = profile.location ?? (isAr ? 'المنطقة' : 'the MENA region');
  const skills = profile.coreSkills?.slice(0, 8).join(', ') || (isAr ? 'غير محدد' : 'not specified');
  const roles  = profile.preferredRoles?.slice(0, 4).join(', ') || (isAr ? 'غير محدد' : 'not specified');
  const exp    = profile.experience ?? 'mid';
  const industries = profile.industries?.slice(0, 3).join(', ') || '';

  if (isAr) {
    return `أنت "MENA Matcher Coach" — مساعد مهني متخصص في سوق العمل في منطقة الشرق الأوسط وشمال أفريقيا.

معلومات المستخدم:
- الاسم: ${name}
- الموقع: ${loc}
- مستوى الخبرة: ${exp}
- المهارات: ${skills}
- الأدوار المستهدفة: ${roles}
- القطاعات: ${industries}

قواعد الحوار:
1. تحدث دائماً بالعربية الفصحى البسيطة والمهنية.
2. خاطب المستخدم باسمه "${name.split(' ')[0]}" بشكل طبيعي.
3. اعطِ نصائح مهنية عملية مخصصة لسوق الشرق الأوسط — اذكر شركات مثل NEOM، أرامكو، كاريم، طبي، نون، G42، STC Pay عند الاقتضاء.
4. إذا طلب المستخدم تحديث ملفه (إضافة مهارة، تغيير مستوى، تعديل ملخص)، أجب بـ JSON فقط بتنسيق: {"action":"update_profile","updatedProfile":{...الملف المحدث...}}
5. في جميع الحالات الأخرى، أجب بنص عادي — نصيحة، معلومة، أو تحضير لمقابلة.
6. كن موجزاً — 2-4 جمل كحد أقصى للردود العادية.
7. إذا سئلت عن رواتب، اذكر أرقاماً واقعية بالعملة المحلية (درهم، ريال، كويتي).
8. اقترح كلمات بحث جديدة عند الحاجة بتنسيق: {"action":"suggest_keywords","keywords":["..."]}`;
  }

  return `You are "MENA Matcher Coach" — a professional career assistant specialising in the Middle East & North Africa job market.

User profile:
- Name: ${name}
- Location: ${loc}
- Experience level: ${exp}
- Skills: ${skills}
- Target roles: ${roles}
- Industries: ${industries}

Conversation rules:
1. Always respond in English, professionally yet conversationally.
2. Address the user by their first name "${name.split(' ')[0]}" naturally.
3. Give practical, market-specific advice — mention real MENA companies like NEOM, Saudi Aramco, Careem, Tabby, Noon, G42, STC Pay where relevant.
4. If the user asks to update their profile (add skill, change level, edit summary), respond ONLY with JSON: {"action":"update_profile","updatedProfile":{...full updated profile...}}
5. For all other requests, respond with plain text — advice, information, or interview prep.
6. Be concise — 2-4 sentences max for regular replies.
7. For salary questions, give realistic figures in local currency (AED, SAR, KWD).
8. Suggest new search keywords when helpful: {"action":"suggest_keywords","keywords":["..."]}`;
}

// ─── Route handler ────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      profile: clientProfile,
      instruction,
      lang = 'en',
      conversationHistory = [],
    } = body as {
      profile: UserProfile;
      instruction: string;
      lang?: Language;
      conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
    };

    if (!clientProfile || !instruction) {
      return NextResponse.json({ error: 'Profile and instruction are required' }, { status: 400 });
    }

    // Try to load fresh profile from Supabase (more accurate than client state)
    let profile = clientProfile;
    try {
      const supabase = createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const dbProfile = await loadProfile();
        if (dbProfile) profile = dbProfile;
      }
    } catch { /* guest — use client profile */ }

    const systemPrompt = buildSystemPrompt(profile, lang);

    // Build messages — include conversation history for memory
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-8).map((m) => ({ // keep last 8 exchanges
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: instruction },
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      temperature: 0.6,
      max_tokens: 600,
    });

    const content = response.choices[0].message.content ?? '';

    // Try to parse structured actions
    try {
      // Strip possible markdown fences
      const cleaned = content.replace(/```json|```/g, '').trim();
      if (cleaned.startsWith('{')) {
        const parsed = JSON.parse(cleaned);

        if (parsed.action === 'update_profile' && parsed.updatedProfile) {
          // Save updated profile to Supabase
          try {
            const supabase = createServerSupabaseClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) await saveProfile(parsed.updatedProfile);
          } catch { /* guest */ }
          return NextResponse.json({
            type: 'profile_update',
            profile: parsed.updatedProfile,
            message: lang === 'ar' ? '✅ تم تحديث ملفك الشخصي!' : '✅ Your profile has been updated!',
          });
        }

        if (parsed.action === 'suggest_keywords' && parsed.keywords) {
          return NextResponse.json({
            type: 'keyword_suggestion',
            keywords: parsed.keywords,
            message: lang === 'ar'
              ? `💡 جرّب هذه الكلمات في البحث: ${parsed.keywords.join('، ')}`
              : `💡 Try searching with: ${parsed.keywords.join(', ')}`,
          });
        }
      }
    } catch { /* not JSON — treat as plain text */ }

    return NextResponse.json({ type: 'message', message: content });

  } catch (error) {
    console.error('[chat] Error:', error);
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 });
  }
}
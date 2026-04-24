import { NextRequest, NextResponse } from 'next/server';
import { extractProfileFromCV, extractEnglishKeywords } from '@/lib/openai';
import { Language } from '@/lib/i18n/translations';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const sb = createServerSupabaseClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const body = await req.json();
    const { cvText, lang = 'en' } = body as { cvText: string; lang: Language };

    if (!cvText || typeof cvText !== 'string') {
      return NextResponse.json({ error: 'cvText is required' }, { status: 400 });
    }

    if (cvText.length > 150_000) {
      return NextResponse.json({ error: 'CV text too long (max 150,000 characters)' }, { status: 400 });
    }

    console.log(`[extract-profile] user=${user.id} | cvText: ${cvText.length} chars | lang: ${lang}`);

    const [profile, searchKeywords] = await Promise.all([
      extractProfileFromCV(cvText, lang),
      extractEnglishKeywords(cvText),
    ]);

    console.log(`[extract-profile] Done: ${profile.name ?? 'unknown'} | keywords: ${searchKeywords.slice(0,5).join(', ')}...`);

    return NextResponse.json({ profile, searchKeywords });

  } catch (error) {
    console.error('[extract-profile] Error:', error);
    return NextResponse.json({ error: 'Profile extraction failed' }, { status: 500 });
  }
}

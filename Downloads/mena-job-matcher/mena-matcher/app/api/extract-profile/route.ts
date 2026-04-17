import { NextRequest, NextResponse } from 'next/server';
import { extractProfileFromCV, extractEnglishKeywords } from '@/lib/openai';
import { Language } from '@/lib/i18n/translations';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cvText, lang = 'en' } = body as { cvText: string; lang: Language };

    if (!cvText || typeof cvText !== 'string') {
      return NextResponse.json({ error: 'cvText is required' }, { status: 400 });
    }

    console.log(`[extract-profile] cvText: ${cvText.length} chars | lang: ${lang}`);

    if (cvText.length > 150_000) {
      return NextResponse.json({ error: 'CV text too long (max 150,000 characters)' }, { status: 400 });
    }

    // Run profile extraction + keyword extraction in parallel
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
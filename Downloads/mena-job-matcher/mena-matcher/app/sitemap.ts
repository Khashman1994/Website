// app/sitemap.ts
import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL
              ?? process.env.NEXT_PUBLIC_APP_URL
              ?? 'https://www.menajob-ai.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ── Static routes ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,        lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: `${BASE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE_URL}/about`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/login`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/signup`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // ── Dynamic job routes ─────────────────────────────────────────────────────
  let jobRoutes: MetadataRoute.Sitemap = [];
  try {
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: jobs } = await sb
      .from('jobs')
      .select('id, fetched_at')
      .gt('expires_at', new Date().toISOString())
      .limit(5000);

    if (jobs?.length) {
      jobRoutes = jobs.map(job => ({
        url:             `${BASE_URL}/jobs/${job.id}`,
        lastModified:    job.fetched_at ? new Date(job.fetched_at) : new Date(),
        changeFrequency: 'weekly' as const,
        priority:        0.8,
      }));
    }
  } catch (err) {
    console.error('[sitemap] Failed to fetch jobs:', err);
  }

  return [...staticRoutes, ...jobRoutes];
}
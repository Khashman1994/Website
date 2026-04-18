// app/robots.ts
import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.menajob-ai.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/login', '/signup', '/auth/'],
      },
      {
        // Allow Googlebot to crawl job pages fully
        userAgent: 'Googlebot',
        allow: ['/jobs/', '/'],
        disallow: ['/api/', '/dashboard'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
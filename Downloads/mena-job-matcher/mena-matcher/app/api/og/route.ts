// app/api/og/route.ts — Dynamic OG image using SVG
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title    = searchParams.get('title')    ?? 'Job Opportunity';
  const company  = searchParams.get('company')  ?? '';
  const location = searchParams.get('location') ?? 'MENA Region';

  const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a"/>
      <stop offset="100%" style="stop-color:#1e293b"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Orange accent bar -->
  <rect x="0" y="0" width="8" height="630" fill="#f97316"/>

  <!-- Logo area -->
  <rect x="60" y="50" width="56" height="56" rx="14" fill="#f97316"/>
  <text x="88" y="90" font-family="Georgia,serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">M</text>
  <text x="130" y="88" font-family="Arial,sans-serif" font-size="22" font-weight="bold" fill="white">MenaJob AI</text>

  <!-- Job Title -->
  <text x="60" y="220" font-family="Arial,sans-serif" font-size="52" font-weight="bold" fill="white">
    ${title.length > 38 ? title.slice(0, 38) + '…' : title}
  </text>

  <!-- Company -->
  ${company ? `<text x="60" y="295" font-family="Arial,sans-serif" font-size="32" fill="#f97316" font-weight="600">${company}</text>` : ''}

  <!-- Location pill -->
  <rect x="60" y="335" width="${Math.min(location.length * 14 + 40, 400)}" height="48" rx="24" fill="#1e293b" stroke="#334155" stroke-width="1.5"/>
  <text x="84" y="366" font-family="Arial,sans-serif" font-size="22" fill="#94a3b8">📍 ${location}</text>

  <!-- Divider -->
  <line x1="60" y1="430" x2="1140" y2="430" stroke="#334155" stroke-width="1"/>

  <!-- Footer -->
  <text x="60" y="480" font-family="Arial,sans-serif" font-size="22" fill="#64748b">Find your dream job in the MENA region with AI-powered matching</text>
  <text x="60" y="520" font-family="Arial,sans-serif" font-size="20" fill="#f97316">www.menajob-ai.com</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type':  'image/svg+xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
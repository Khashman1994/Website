// lib/apply-href.ts
//
// Employer-posted jobs accept either a careers-page URL or a plain HR
// email address in `job.url`. This helper normalises the value into a
// safe href for an <a> tag.
//
//   "https://acme.com/careers/123" → "https://acme.com/careers/123"
//   "hr@acme.com"                  → "mailto:hr@acme.com"
//   "acme.com/careers/123"         → "https://acme.com/careers/123" (defensive)
//   "" / null                      → "#"

export function applyHref(raw?: string | null): string {
  const v = (raw ?? '').trim();
  if (!v) return '#';

  // Already a fully-qualified link of any scheme (http, https, mailto, tel…)
  if (/^[a-z][a-z0-9+\-.]*:/i.test(v)) return v;

  // Looks like an email address — has @ but no scheme.
  if (v.includes('@') && !v.includes('/')) return `mailto:${v}`;

  // Bare hostname/path — assume http(s) so it doesn't open as a relative link.
  return `https://${v}`;
}

/** True when the resolved href is an email link — useful for swapping the icon/label. */
export function isEmailApply(raw?: string | null): boolean {
  return applyHref(raw).startsWith('mailto:');
}

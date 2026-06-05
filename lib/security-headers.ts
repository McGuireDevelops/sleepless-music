/**
 * Security headers for all routes. CSP is tuned for this static site:
 * self-hosted assets, ReelCrafter embed, Vercel Analytics / Speed Insights.
 */
export function buildContentSecurityPolicy(): string {
  const isDev = process.env.NODE_ENV === "development";
  const scriptSrc = isDev
    ? "'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com"
    : "'self' 'unsafe-inline' https://va.vercel-scripts.com";

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.reelcrafter.com",
    "font-src 'self'",
    "frame-src https://*.reelcrafter.com",
    "connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com https://*.reelcrafter.com",
    "upgrade-insecure-requests",
  ].join("; ");
}

export const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Content-Security-Policy",
    value: buildContentSecurityPolicy(),
  },
] as const;

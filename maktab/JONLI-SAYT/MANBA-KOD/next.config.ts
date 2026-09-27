import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Native / heavy packages used only server-side (webhook + admin reads).
  // Keep them as runtime node_modules instead of bundling them.
  serverExternalPackages: ["sharp", "firebase-admin"],
  // Defence-in-depth hardening headers on every response (HSTS is added by
  // Vercel). A strict CSP is intentionally omitted — it needs careful testing
  // against Next.js inline scripts + the several image CDNs.
  async headers() {
    const base = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
    ];
    return [
      // Everything except the Telegram mini-app: block cross-origin framing.
      {
        source: "/((?!bot-admin).*)",
        headers: [...base, { key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
      // The bot admin mini-app must be embeddable by the Telegram webview.
      // no-store: Telegram's in-app WebView aggressively caches Mini App
      // pages, so a stale build (old password gate, old bundle) can keep
      // showing after a redeploy unless every response says "don't cache".
      {
        source: "/bot-admin",
        headers: [
          ...base,
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors https://web.telegram.org https://telegram.org 'self';",
          },
          { key: "Cache-Control", value: "no-store, must-revalidate" },
        ],
      },
      {
        source: "/api/bot-admin/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ];
  },
  async redirects() {
    return [
      // Old direction slug (renamed: boshlang'ich -> 5-7-sinflar).
      {
        source: "/yonalishlar/boshlangich-talim",
        destination: "/yonalishlar/5-7-sinflar",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "*.firebasestorage.app",
      },
      // Public certificate images served from the dedicated GCS bucket.
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      // Telegram channel preview images (t.me/s/<channel>).
      {
        protocol: "https",
        hostname: "*.cdn-telegram.org",
      },
      {
        protocol: "https",
        hostname: "*.telesco.pe",
      },
      // YouTube lite-embed thumbnail.
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
  },
};

export default nextConfig;

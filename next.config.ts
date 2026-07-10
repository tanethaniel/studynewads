import type { NextConfig } from "next";

// Ad creative used to come from whatever host the research step happened to
// find (news sites, brand CDNs, ad blogs) — a different domain per ad, which
// made a fixed remotePatterns allowlist unworkable. Now that
// scripts/backfill-image-storage.mjs re-hosts images into this project's own
// Supabase Storage bucket, that one known domain can be optimized normally;
// anything still pointing at an un-migrated external URL (or the local
// /public/seed placeholder SVGs) stays unoptimized — see components/AdImage.tsx.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseHostname = supabaseUrl ? new URL(supabaseUrl).hostname : undefined;

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default nextConfig;

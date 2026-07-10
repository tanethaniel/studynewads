import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Seed/demo art is a handful of generated SVGs bundled under /public/seed.
    // Real ad creative that Gumloop ingests will be hotlinked from the Meta
    // Ad Library CDN or a Supabase Storage bucket — add those hostnames to
    // remotePatterns once wired up.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
  },
};

export default nextConfig;

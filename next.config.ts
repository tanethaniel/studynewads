import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // dangerouslyAllowSVG covers the local /public/seed placeholder art.
    // All <Image> usages also pass `unoptimized` regardless of source: ad
    // creative comes from whatever host Gumloop's research happens to find
    // (news sites, brand CDNs, ad-industry blogs — a different domain per
    // ad), so a fixed remotePatterns allowlist isn't workable here.
    dangerouslyAllowSVG: true,
    contentDispositionType: "inline",
  },
};

export default nextConfig;

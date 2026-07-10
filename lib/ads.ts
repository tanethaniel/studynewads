import type { Ad } from "@/lib/types";
import seedAds from "@/data/seed-ads.json";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const BASE = SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : null;

const headers = SUPABASE_KEY ? { apikey: SUPABASE_KEY } : undefined;

const SELECT = "*,images:ad_images(*)";

// Local fallback so the site is browsable before a Supabase project exists —
// the seed script and Gumloop both write into the same `ads`/`ad_images`
// shape, so this is only ever a stand-in for local dev/demo, never used
// once env vars are set.
function localAds(): Ad[] {
  return seedAds as unknown as Ad[];
}

export async function getAds(): Promise<Ad[]> {
  if (!BASE || !headers) {
    return [...localAds()].sort(
      (a, b) => (b.year ?? 0) - (a.year ?? 0) || b.created_at.localeCompare(a.created_at)
    );
  }
  const res = await fetch(
    `${BASE}/ads?select=${SELECT}&order=year.desc,created_at.desc`,
    { headers, next: { revalidate: 120, tags: ["ads"] } }
  );
  if (!res.ok) return [];
  return res.json();
}

export async function getAdBySlug(slug: string): Promise<Ad | null> {
  if (!BASE || !headers) {
    return localAds().find((ad) => ad.slug === slug) ?? null;
  }
  const res = await fetch(
    `${BASE}/ads?select=${SELECT}&slug=eq.${encodeURIComponent(slug)}`,
    { headers, next: { revalidate: 120, tags: ["ads"] } }
  );
  if (!res.ok) return null;
  const rows: Ad[] = await res.json();
  return rows[0] ?? null;
}

export async function getAdsByYear(year: string): Promise<Ad[]> {
  const ads = await getAds();
  return ads.filter((ad) => String(ad.year) === year);
}

export async function getRelatedAds(ad: Ad, limit = 6): Promise<Ad[]> {
  const ads = await getAds();
  const sameBrand = ads.filter(
    (other) => other.slug !== ad.slug && other.brand_name === ad.brand_name
  );
  const rest = ads.filter(
    (other) => other.slug !== ad.slug && other.brand_name !== ad.brand_name
  );
  return [...sameBrand, ...rest].slice(0, limit);
}

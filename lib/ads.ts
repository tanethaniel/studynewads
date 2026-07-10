import type { Ad } from "@/lib/types";
import seedAds from "@/data/seed-ads.json";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const BASE = SUPABASE_URL ? `${SUPABASE_URL}/rest/v1` : null;

const headers = SUPABASE_KEY ? { apikey: SUPABASE_KEY } : undefined;

// Local fallback so the site is browsable before a Supabase project exists —
// Gumloop and the seed script both write into the same `ads` shape, so this
// is only ever a stand-in for local dev/demo, never used once env vars are set.
function localAds(): Ad[] {
  return (seedAds as Array<Partial<Ad> & { id: string; slug: string }>)
    .filter((ad) => ad.is_published !== false)
    .map((ad) => ({
      created_at: ad.launch_date ?? new Date().toISOString(),
      updated_at: ad.launch_date ?? new Date().toISOString(),
      ...ad,
    })) as Ad[];
}

export async function getAds(): Promise<Ad[]> {
  if (!BASE || !headers) {
    return localAds().sort((a, b) =>
      (b.launch_date ?? "").localeCompare(a.launch_date ?? "")
    );
  }
  const res = await fetch(
    `${BASE}/ads?select=*&is_published=eq.true&order=launch_date.desc`,
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
    `${BASE}/ads?select=*&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true`,
    { headers, next: { revalidate: 120, tags: ["ads"] } }
  );
  if (!res.ok) return null;
  const rows: Ad[] = await res.json();
  return rows[0] ?? null;
}

export async function getAdsByVertical(vertical: string): Promise<Ad[]> {
  const ads = await getAds();
  return ads.filter((ad) => ad.vertical === vertical);
}

export async function getAdsByMonth(month: string): Promise<Ad[]> {
  const ads = await getAds();
  return ads.filter((ad) => ad.launch_date?.startsWith(month));
}

export async function getRelatedAds(ad: Ad, limit = 6): Promise<Ad[]> {
  const ads = await getAds();
  return ads
    .filter(
      (other) =>
        other.slug !== ad.slug &&
        (other.brand === ad.brand || other.vertical === ad.vertical)
    )
    .sort((a) => (a.brand === ad.brand ? -1 : 1))
    .slice(0, limit);
}

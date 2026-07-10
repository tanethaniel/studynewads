# studynewads

A living archive of notable digital ad campaigns from the last ~2 years — the
`studyoldads.com` idea, rebuilt for the Meta/TikTok/Instagram era instead of
print, and kept up to date by an automated research pipeline instead of a
static scan library.

Built with Next.js (App Router) + TypeScript + Tailwind, reading from
Supabase, deployed on Vercel. Ad discovery and write-up runs in Gumloop.

## What's here

- `app/page.tsx` — dense homepage grid of ad tiles
- `app/ad/[slug]/page.tsx` — detail page: hero creative, brand/headline,
  fact-checked context, metadata sidebar, sources, "More to study" related strip
- `app/category/[vertical]/page.tsx` — ads grouped by vertical
- `app/month/[month]/page.tsx` — ads grouped by launch month (`2024-06`, etc.)
- `app/api/revalidate/route.ts` — on-demand cache revalidation, called by Gumloop after every write
- `lib/ads.ts` — data layer (direct PostgREST calls, tag-based fetch caching)
- `data/seed-ads.json` — 15 hand-picked real campaigns so the site isn't empty
  before Supabase/Gumloop exist; also the source for `supabase/seed.sql` and
  the local dev fallback (see below)
- `supabase/schema.sql` — the `ads` table, indexes, RLS policy
- `supabase/seed.sql` — generated insert statements for the seed data
- `public/seed/*.svg` — generated placeholder art standing in for real ad
  creative (Gumloop will populate `media_url` with real Ad Library images later)

## Running locally

```bash
npm install
npm run dev
```

With no env vars set, `lib/ads.ts` falls back to `data/seed-ads.json` so the
whole site is browsable with zero external services. This is the state the
repo ships in.

To point it at a real Supabase project instead, copy `.env.local.example` to
`.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
REVALIDATE_SECRET=<any random string>
```

Only the publishable key goes here — it's safe in the browser bundle and
respects the read-only RLS policy. The `sb_secret_...` key is never used by
this app; it lives only inside Gumloop's stored credentials for writes.

## Setting up Supabase

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql` to load the 15 seed ads (optional, but recommended
   so the deployed site isn't empty before Gumloop is wired up).
4. Grab the project URL and `sb_publishable_...` key for `.env.local` /
   Vercel env vars.

## Deploying

Push to Vercel, set the three env vars above in the project settings, done.
`app/api/revalidate` gives Gumloop a way to bust the cache instantly after a
write; without it the site still self-updates within 2 minutes via the
`next: { revalidate: 120 }` fetch option in `lib/ads.ts`.

## Wiring up Gumloop

Flow construction happens by hand in the Gumloop canvas (no API for creating
flows, only running/reading them). Two flows to build, in this order:

1. **Add one ad manually** — paste a URL, scrape it, extract fields into the
   `ads` schema below, upsert via Supabase Table Writer, call
   `POST /api/revalidate?secret=...`. Build and test this one first — it's
   the simplest end-to-end proof and the one to demo live.
2. **Discover new ads** (scheduled/manual) — Facebook Ad Library Scraper per
   vertical → filter to last 24 months → AI quality filter → web research for
   context → extract into the same schema → same upsert + revalidate steps.

### `ads` table shape both flows write into

| column | notes |
|---|---|
| `slug` | unique, slugified `brand + headline` |
| `brand`, `headline`, `dek` | dek = short descriptor, e.g. "Luxury sports watch" |
| `vertical` | category used for `/category/[vertical]` |
| `platforms` | `text[]`, e.g. `{meta, instagram, tiktok}` |
| `format` | `image \| video \| carousel \| reel` |
| `launch_date` | drives `/month/[month]` and homepage ordering |
| `still_running` | powers the live "still running" badge |
| `media_url`, `media_type` | the creative itself |
| `copy_notes` | 2–3 sentence fact-checked writeup — required, this is the "article" |
| `origin` | which flow/source produced the row, e.g. `gumloop-flow-1`, `seed` |
| `sources` | `jsonb` array of `{ label, url }` |
| `is_published` | gates what the public site can read (RLS) |

Credentials: store the Supabase `sb_secret_...` key as a Gumloop credential
(bypasses RLS for writes) and the same `REVALIDATE_SECRET` value as a Gumloop
secret for the `Call API` node. Neither belongs in this repo.

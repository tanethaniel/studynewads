# studynewads

A living archive of notable digital ad campaigns from the last ~2 years — the
`studyoldads.com` idea, rebuilt for the Meta/TikTok/Instagram era instead of
print, and kept up to date by an automated research pipeline instead of a
static scan library.

Built with Next.js (App Router) + TypeScript + Tailwind, reading from
Supabase, deployed on Vercel at [studynewads.vercel.app](https://studynewads.vercel.app/)
(custom domain: `studynewads.com`). Ad discovery and write-up runs in Gumloop.

## What's here

- `app/page.tsx` — dense homepage grid of ad tiles
- `app/ad/[slug]/page.tsx` — detail page: hero creative (+ extra images if
  present), brand/title, fact-checked description, metadata sidebar, "More to
  study" related strip
- `app/year/[year]/page.tsx` — ads grouped by year
- `app/api/revalidate/route.ts` — on-demand cache revalidation, called by Gumloop after every write
- `lib/ads.ts` — data layer (direct PostgREST calls, tag-based fetch caching,
  joins `ad_images` per ad)
- `data/seed-ads.json` — 15 hand-picked real campaigns so the site isn't empty
  before Supabase/Gumloop exist; also the source for `supabase/seed.sql` and
  the local dev fallback (see below)
- `supabase/schema.sql` — the `ads` + `ad_images` tables, indexes, RLS policy
- `supabase/seed.sql` — generated insert statements for the seed data
- `public/seed/*.svg` — generated placeholder art standing in for real ad
  creative (Gumloop will populate `ad_images.image_url` with real Ad Library
  images later)

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
   schema below, upsert via Supabase Table Writer, call
   `POST /api/revalidate?secret=...`. Build and test this one first — it's
   the simplest end-to-end proof and the one to demo live.
2. **Discover new ads** (scheduled/manual) — Facebook Ad Library Scraper →
   filter to last 24 months → AI quality filter → web research for context →
   extract into the same schema → same upsert + revalidate steps.

### Table shape both flows write into

This intentionally matches Gumloop's own field list — no category/platform/
still-running/publish-gate columns, since those aren't part of what Gumloop's
extract step produces. `ads`:

| column | notes |
|---|---|
| `id` | uuid, PK |
| `brand_name`, `title` | title = the campaign line/hook |
| `year` | int; drives `/year/[year]` and homepage ordering |
| `description` | 2–3 sentence fact-checked writeup — required, this is the "article" |
| `origin` | which flow/source produced the row, e.g. `gumloop-flow-1`, `seed` |
| `source_name`, `source_url` | single citation link shown on the detail page |
| `seed_thread_url` | link to the research thread/conversation that surfaced the ad, shown as "View thread" if present |
| `slug` | unique, slugified `brand + title` |
| `created_at` | timestamptz |

`ad_images` (one-to-many per ad):

| column | notes |
|---|---|
| `id` | uuid, PK |
| `ad_id` | FK -> `ads.id` |
| `image_url` | full-size creative |
| `thumbnail_url` | used on grid tiles; falls back to `image_url` if null |
| `width`, `height` | int, optional |

The first image row returned for an ad is used as the hero on its detail page;
any additional rows render as a small gallery strip beneath it.

Everything Gumloop writes goes live immediately — there's no `is_published`
gate in this schema. If a review queue turns out to be needed later, add that
column back and update the RLS policy in `supabase/schema.sql` to check it.

Credentials: store the Supabase `sb_secret_...` key as a Gumloop credential
(bypasses RLS for writes) and the same `REVALIDATE_SECRET` value as a Gumloop
secret for the `Call API` node. Neither belongs in this repo.

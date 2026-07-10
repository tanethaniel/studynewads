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
- `data/seed-ads.json` — 15 hand-picked real campaigns for local dev / a
  brand-new Supabase project; also the source for `supabase/seed.sql`
- `supabase/schema.sql` — idempotent: creates `ads` + `ad_images` on a fresh
  project, or adds the missing columns/trigger to the existing production DB
- `supabase/one_time_backfill.sql` — one-time data fix, see below
- `supabase/seed.sql` — insert statements for the 15 local demo ads. **Only
  for a fresh project** — do not run against the already-populated production
  database
- `public/seed/*.svg` — generated placeholder art used by the local demo data

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

## The production schema is not what this site was originally built around

Worth understanding if you're touching the data layer: this site's code reads
a simplified set of fields (`brand_name`, `title`, `year`, `description`,
`origin`, `source_name`, `source_url`, `seed_thread_url` on `ads`), but the
research agent/Gumloop flow that's actually populating the database wrote the
original, richer buildspec schema instead (`brand`, `headline`, `dek`,
`vertical`, `platforms`, `format`, `launch_date`, `still_running`,
`media_url`, `media_type`, `advertiser_page_url`, `body_copy`, `copy_notes`,
`sources`, `is_published`).

Rather than rewrite the site around whichever shape a given flow happens to
write, `supabase/schema.sql` adds the simplified columns alongside the rich
ones and keeps them in sync with a trigger (`sync_simplified_ad_fields`) —
so it doesn't matter whether a future Gumloop flow writes the rich shape,
the simplified shape, or a mix; the columns this site actually reads end up
populated either way. The trigger only fills gaps, never overwrites a value
a writer set explicitly.

`ad_images` similarly already exists in production with its own shape
(`image_url`, `storage_path`, `caption`, `is_primary`, `source_url`) rather
than the `thumbnail_url`/`width`/`height` this site was first built against —
the site's `AdImage` type and components were updated to match that instead
of the other way around. The `is_primary`-flagged image (if any) is used as
each ad's hero/thumbnail.

## Setting up Supabase

**On the existing production project** (already has real Gumloop-written
rows):
1. Run `supabase/schema.sql` — safe, additive only, does not touch existing
   data or existing RLS policies with the same names.
2. Run `supabase/one_time_backfill.sql` **once** — backfills the simplified
   columns for rows written before the trigger existed, and publishes
   (`is_published = true`) every row currently sitting unpublished. Don't
   re-run this one; the `is_published` gate should stay in place for
   whatever gets written next, so new unpublished rows aren't meant to be
   force-published automatically.
3. Grab the project URL and `sb_publishable_...` key for `.env.local` /
   Vercel env vars, if not already set.

**On a brand-new Supabase project** (nothing written yet):
1. Run `supabase/schema.sql`.
2. Run `supabase/seed.sql` to load the 15 local demo ads (optional, but
   recommended so the site isn't empty before Gumloop is wired up).

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

### Fields this site's code reads from `ads`

| column | notes |
|---|---|
| `id` | uuid, PK |
| `brand_name`, `title` | title = the campaign line/hook |
| `year` | int; drives `/year/[year]` and homepage ordering |
| `description` | 2–3 sentence fact-checked writeup — this is the "article" |
| `origin` | which flow/source produced the row, e.g. `gumloop-flow-1`, `seed`, `agent` |
| `source_name`, `source_url` | single citation link shown on the detail page |
| `seed_thread_url` | link to the research thread/conversation that surfaced the ad, shown as "View thread" if present |
| `slug` | unique |
| `is_published` | gates what the public site can read (RLS) — new rows should default to `false` until reviewed |

A writer can populate these directly, or populate the richer original columns
(`brand`, `headline`, `launch_date`, `copy_notes`, `sources`, etc.) and let
the `ads_sync_simplified` trigger derive the fields above automatically.

### Fields this site's code reads from `ad_images`

| column | notes |
|---|---|
| `id` | uuid, PK |
| `ad_id` | FK -> `ads.id` |
| `image_url` | the creative |
| `caption` | used as alt text if present |
| `is_primary` | the primary-flagged image is used as the hero/thumbnail; others render as a gallery strip on the detail page |
| `source_url` | optional, not currently rendered separately from the ad-level source |

Credentials: store the Supabase `sb_secret_...` key as a Gumloop credential
(bypasses RLS for writes) and the same `REVALIDATE_SECRET` value as a Gumloop
secret for the `Call API` node. Neither belongs in this repo.

## A security note worth checking

The diagnostic query used to debug this showed an `ad_images` RLS policy
named "Service role can manage ad_images" with `cmd: ALL` and `roles:
{public}`. In Postgres, `public` is a pseudo-role every role belongs to —
if that policy's `USING`/`WITH CHECK` clause is permissive (e.g. `true`),
it could mean the `sb_publishable_...` key (safe to expose in the browser
by design) can also insert/update/delete `ad_images` rows, not just read
them. Worth checking that policy's actual definition in the Supabase
dashboard (Authentication → Policies) and tightening it to `to service_role`
if it isn't already scoped that way — this repo doesn't touch that policy
since its exact definition wasn't visible from here.

-- studynewads schema
-- Matches the fields Gumloop's research/extract step populates directly —
-- no vertical/category, platform, still-running, or publish-gate columns.
-- Run in the Supabase SQL editor once, before wiring up Gumloop.

create extension if not exists pgcrypto;

create table public.ads (
  id                uuid primary key default gen_random_uuid(),
  brand_name        text not null,
  title             text not null,
  year              int,
  description       text not null,        -- fact-checked 2-3 sentence writeup, the "article" text
  origin            text,                 -- which Gumloop flow/source produced this row
  source_name       text,                 -- human-readable label for the citation link
  source_url        text,
  seed_thread_url   text,                 -- link to the research thread/conversation that surfaced this ad
  slug              text unique not null,
  created_at        timestamptz not null default now()
);

create table public.ad_images (
  id             uuid primary key default gen_random_uuid(),
  ad_id          uuid not null references public.ads (id) on delete cascade,
  image_url      text not null,
  thumbnail_url  text,
  width          int,
  height         int
);

create index ads_brand_name_idx on public.ads (brand_name);
create index ads_year_idx on public.ads (year desc);
create index ad_images_ad_id_idx on public.ad_images (ad_id);

alter table public.ads enable row level security;
alter table public.ad_images enable row level security;

-- No is_published column in this schema: everything Gumloop writes is
-- immediately public. If a review queue is ever needed, add the column
-- back and gate these policies on it.
create policy "Public can read ads"
  on public.ads for select
  to anon, authenticated
  using (true);

create policy "Public can read ad images"
  on public.ad_images for select
  to anon, authenticated
  using (true);

-- No insert/update/delete policies are created on purpose.
-- Writes only ever happen with the secret key (bypasses RLS), used only inside Gumloop / server code.

-- studynewads schema
-- Run in the Supabase SQL editor once, before wiring up Gumloop.

create extension if not exists pgcrypto;

create table public.ads (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  brand               text not null,
  headline            text not null,        -- the campaign line/hook, shown in quotes
  dek                 text,                  -- short descriptor, e.g. "Luxury sports watch" (maps to "Period" on the original)
  vertical            text not null,         -- watch, fintech, ai-tool, beverage, fitness, food, automotive, etc.
  platforms           text[] not null default '{}',  -- {meta, instagram, tiktok, youtube, linkedin}
  format              text,                  -- image | video | carousel | reel
  launch_date         date,                  -- from Ad Library "Start Date" or research
  still_running       boolean default false,
  media_url           text not null,
  media_type          text not null default 'image',  -- image | video
  advertiser_page_url text,
  body_copy           text,                  -- the ad's own on-screen/caption text (short, optional)
  copy_notes          text not null,         -- 2–3 sentence fact-checked writeup — this is the "article" text
  origin              text,                  -- which flow/source produced this row
  sources             jsonb not null default '[]',   -- [{ "label": "...", "url": "..." }]
  is_published        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index ads_brand_idx on public.ads (brand);
create index ads_vertical_idx on public.ads (vertical);
create index ads_launch_date_idx on public.ads (launch_date desc);
create index ads_published_idx on public.ads (is_published);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger ads_set_updated_at
before update on public.ads
for each row execute function public.set_updated_at();

alter table public.ads enable row level security;

create policy "Public can read published ads"
  on public.ads for select
  to anon, authenticated
  using (is_published = true);

-- No insert/update/delete policies are created on purpose.
-- Writes only ever happen with the secret key (bypasses RLS), used only inside Gumloop / server code.

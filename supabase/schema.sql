-- studynewads schema
-- Idempotent: safe to run against a brand-new Supabase project, and safe to
-- re-run against the existing production database.
--
-- Context: the actual `ads` table in production was populated using the
-- original, richer buildspec columns (brand, headline, dek, vertical,
-- platforms, format, launch_date, still_running, media_url, media_type,
-- advertiser_page_url, body_copy, copy_notes, sources, is_published) rather
-- than the simplified fields this site's code reads (brand_name, title,
-- year, description, source_name, source_url, seed_thread_url). Rather than
-- migrate away from whatever a given Gumloop flow writes, this file adds the
-- simplified columns alongside the rich ones and keeps them in sync with a
-- trigger — so it doesn't matter whether a flow writes the rich shape, the
-- simplified shape, or a mix of both.
--
-- `ad_images` similarly already exists in production with image_url /
-- storage_path / caption / is_primary / source_url — that shape is left as
-- the source of truth; this file only adds it if missing.

create extension if not exists pgcrypto;

create table if not exists public.ads (
  id                  uuid primary key default gen_random_uuid(),
  slug                text unique not null,
  brand               text,
  headline            text,
  dek                 text,
  vertical            text,
  platforms           text[] default '{}',
  format              text,
  launch_date         date,
  still_running       boolean default false,
  media_url           text,
  media_type          text default 'image',
  advertiser_page_url text,
  body_copy           text,
  copy_notes          text,
  origin              text,
  sources             jsonb default '[]',
  is_published        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- Simplified fields this site's code actually reads.
  brand_name          text,
  title               text,
  year                int,
  description         text,
  source_name         text,
  source_url          text,
  seed_thread_url     text
);

-- In case `ads` already existed with only the rich columns, add the
-- simplified ones without touching any existing data.
alter table public.ads add column if not exists brand_name text;
alter table public.ads add column if not exists title text;
alter table public.ads add column if not exists year int;
alter table public.ads add column if not exists description text;
alter table public.ads add column if not exists source_name text;
alter table public.ads add column if not exists source_url text;
alter table public.ads add column if not exists seed_thread_url text;

create table if not exists public.ad_images (
  id            uuid primary key default gen_random_uuid(),
  ad_id         uuid not null references public.ads (id) on delete cascade,
  image_url     text not null,
  storage_path  text,
  caption       text,
  is_primary    boolean not null default false,
  source_url    text,
  created_at    timestamptz not null default now()
);

create index if not exists ads_brand_name_idx on public.ads (brand_name);
create index if not exists ads_year_idx on public.ads (year desc);
create index if not exists ads_published_idx on public.ads (is_published);
create index if not exists ad_images_ad_id_idx on public.ad_images (ad_id);

-- Keep the simplified fields populated regardless of which columns a given
-- insert/update actually targets. Only fills gaps — never overwrites a
-- simplified field a writer already set explicitly.
create or replace function public.sync_simplified_ad_fields()
returns trigger language plpgsql as $$
begin
  if new.brand_name is null then new.brand_name := new.brand; end if;
  if new.title is null then new.title := new.headline; end if;
  if new.year is null and new.launch_date is not null then
    new.year := extract(year from new.launch_date)::int;
  end if;
  if new.description is null then new.description := new.copy_notes; end if;
  if new.source_name is null and new.sources is not null and jsonb_array_length(new.sources) > 0 then
    new.source_name := new.sources -> 0 ->> 'label';
  end if;
  if new.source_url is null and new.sources is not null and jsonb_array_length(new.sources) > 0 then
    new.source_url := new.sources -> 0 ->> 'url';
  end if;
  return new;
end $$;

drop trigger if exists ads_sync_simplified on public.ads;
create trigger ads_sync_simplified
before insert or update on public.ads
for each row execute function public.sync_simplified_ad_fields();

alter table public.ads enable row level security;
alter table public.ad_images enable row level security;

-- These already exist in production with these exact names/shapes; created
-- here only so a fresh project ends up with the same policies.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ads' and policyname = 'Public can read published ads'
  ) then
    create policy "Public can read published ads"
      on public.ads for select
      to anon, authenticated
      using (is_published = true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'ad_images' and policyname = 'Anyone can read ad_images'
  ) then
    create policy "Anyone can read ad_images"
      on public.ad_images for select
      to anon, authenticated
      using (true);
  end if;
end $$;

-- No insert/update/delete policies for anon/authenticated on purpose.
-- Writes only ever happen with the secret key (bypasses RLS), used only inside Gumloop / server code.

-- One-time fix for the 22 ads that already existed before schema.sql added
-- the simplified columns and sync trigger. Run this ONCE, after running
-- schema.sql, then don't re-run it — new rows going forward are handled
-- automatically by the ads_sync_simplified trigger, and should keep
-- is_published = false until reviewed rather than being force-published.

-- Backfill simplified fields for rows the trigger never touched (it only
-- fires on insert/update, not retroactively).
update public.ads set
  brand_name = coalesce(brand_name, brand),
  title = coalesce(title, headline),
  year = coalesce(year, extract(year from launch_date)::int),
  description = coalesce(description, copy_notes),
  source_name = coalesce(source_name, sources -> 0 ->> 'label'),
  source_url = coalesce(source_url, sources -> 0 ->> 'url')
where brand_name is null or title is null or year is null or description is null;

-- Publish everything currently sitting unpublished. This is a one-time
-- catch-up for existing rows only — the is_published gate stays in place
-- for whatever Gumloop/the research agent writes next.
update public.ads set is_published = true where is_published = false;

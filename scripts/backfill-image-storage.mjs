#!/usr/bin/env node
// One-time (and safely re-runnable) backfill: downloads every ad_images row
// that still points at an external URL, re-hosts it in Supabase Storage, and
// updates the row to point at the Storage copy instead.
//
// Fixes two things that a live external image_url can't:
//  - Referer-based hotlink protection (this script fetches server-side with
//    a normal browser User-Agent and no cross-site Referer, which is what
//    that protection actually keys on)
//  - Images the original host later moves, deletes, or rate-limits
//
// Run locally (never pass the secret key through chat/a shared terminal):
//
//   SUPABASE_URL=https://<project-ref>.supabase.co \
//   SUPABASE_SECRET_KEY=sb_secret_... \
//   node scripts/backfill-image-storage.mjs
//
// Requires Node 18+ (built-in fetch). Safe to re-run — already-migrated
// rows (storage_path already set) are skipped automatically.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const BUCKET = process.env.SUPABASE_BUCKET ?? "ad-images";
const MIN_BYTES = 5000; // filters out tracking pixels / error placeholders

if (!SUPABASE_URL || !SECRET_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SECRET_KEY env vars first.");
  process.exit(1);
}

const headers = {
  apikey: SECRET_KEY,
  Authorization: `Bearer ${SECRET_KEY}`,
};

async function ensureBucket() {
  const check = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, { headers });
  if (check.ok) return;
  const create = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (!create.ok) {
    throw new Error(`Failed to create bucket: ${create.status} ${await create.text()}`);
  }
  console.log(`Created public bucket "${BUCKET}"`);
}

async function rehostImage(row) {
  const imgRes = await fetch(row.image_url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      Accept: "image/*",
    },
    redirect: "follow",
  });
  if (!imgRes.ok) throw new Error(`fetch failed: ${imgRes.status}`);

  const contentType = imgRes.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`not an image (content-type: ${contentType || "none"})`);
  }

  const buf = Buffer.from(await imgRes.arrayBuffer());
  if (buf.byteLength < MIN_BYTES) {
    throw new Error(`too small (${buf.byteLength} bytes) -- likely a placeholder/error image`);
  }

  const ext = contentType.split("/")[1]?.split(";")[0] || "jpg";
  const path = `${row.ad_id}/${row.id}.${ext}`;

  const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
    method: "POST",
    headers: { ...headers, "Content-Type": contentType, "x-upsert": "true" },
    body: buf,
  });
  if (!upload.ok) {
    throw new Error(`upload failed: ${upload.status} ${await upload.text()}`);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

  const update = await fetch(`${SUPABASE_URL}/rest/v1/ad_images?id=eq.${row.id}`, {
    method: "PATCH",
    headers: { ...headers, "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ image_url: publicUrl, storage_path: path }),
  });
  if (!update.ok) {
    throw new Error(`db update failed: ${update.status} ${await update.text()}`);
  }
}

async function main() {
  await ensureBucket();

  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/ad_images?select=id,ad_id,image_url,storage_path&storage_path=is.null`,
    { headers }
  );
  if (!res.ok) throw new Error(`Failed to list ad_images: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  console.log(`Found ${rows.length} image(s) to back-fill`);

  let ok = 0;
  let failed = 0;
  for (const row of rows) {
    try {
      await rehostImage(row);
      ok++;
      console.log(`  ok    ${row.id}`);
    } catch (err) {
      failed++;
      console.error(`  fail  ${row.id}: ${err.message}`);
    }
  }
  console.log(`\nDone. ${ok} re-hosted, ${failed} failed (left pointing at their original URL).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

const BUCKET = "ad-images";
const MIN_BYTES = 5000; // filters out tracking pixels / error placeholders
const FETCH_TIMEOUT_MS = 15000;
const DEFAULT_LIMIT = 6;
const MAX_LIMIT = 15;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

function headers() {
  return { apikey: SECRET_KEY!, Authorization: `Bearer ${SECRET_KEY}` };
}

async function ensureBucket() {
  const check = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, {
    headers: headers(),
  });
  if (check.ok) return;
  const create = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  if (!create.ok) {
    throw new Error(`bucket create failed: ${create.status} ${await create.text()}`);
  }
}

interface AdImageRow {
  id: string;
  ad_id: string;
  image_url: string;
}

async function rehostImage(row: AdImageRow) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let imgRes: Response;
  try {
    imgRes = await fetch(row.image_url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "image/*",
      },
      redirect: "follow",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
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
    headers: { ...headers(), "Content-Type": contentType, "x-upsert": "true" },
    body: buf,
  });
  if (!upload.ok) {
    throw new Error(`upload failed: ${upload.status} ${await upload.text()}`);
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;

  const update = await fetch(`${SUPABASE_URL}/rest/v1/ad_images?id=eq.${row.id}`, {
    method: "PATCH",
    headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ image_url: publicUrl, storage_path: path }),
  });
  if (!update.ok) {
    throw new Error(`db update failed: ${update.status} ${await update.text()}`);
  }
}

async function handle(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 });
  }
  if (!SUPABASE_URL || !SECRET_KEY) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY not set" },
      { status: 500 }
    );
  }

  const limit = Math.min(
    Number(req.nextUrl.searchParams.get("limit")) || DEFAULT_LIMIT,
    MAX_LIMIT
  );

  try {
    await ensureBucket();
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  const listRes = await fetch(
    `${SUPABASE_URL}/rest/v1/ad_images?select=id,ad_id,image_url,storage_path&storage_path=is.null&limit=${limit + 1}`,
    { headers: headers() }
  );
  if (!listRes.ok) {
    return NextResponse.json(
      { error: `failed to list ad_images: ${listRes.status} ${await listRes.text()}` },
      { status: 502 }
    );
  }
  const rows: AdImageRow[] = await listRes.json();
  const batch = rows.slice(0, limit);
  const hasMore = rows.length > limit;

  const results = await Promise.allSettled(batch.map((row) => rehostImage(row)));
  const ok = results.filter((r) => r.status === "fulfilled").length;
  const failed = results
    .map((r, i) => (r.status === "rejected" ? { id: batch[i].id, error: String(r.reason) } : null))
    .filter(Boolean);

  return NextResponse.json({
    processed: batch.length,
    ok,
    failed,
    more_remaining: hasMore,
    hint: hasMore
      ? "Call this URL again to process the next batch."
      : "No more un-migrated images found.",
  });
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

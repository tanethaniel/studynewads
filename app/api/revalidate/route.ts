import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

function handle(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "invalid secret" }, { status: 401 });
  }
  revalidateTag("ads", "max");
  return NextResponse.json({ revalidated: true, now: Date.now() });
}

// GET is supported so this can be triggered by just visiting the URL in a
// browser (no terminal/REST client needed) — POST remains for Gumloop's
// Call API node.
export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}

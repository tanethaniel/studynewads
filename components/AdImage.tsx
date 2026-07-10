"use client";

import { useState } from "react";
import { placeholderColors } from "@/lib/placeholderColor";

const SUPABASE_STORAGE_PREFIX = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`
  : null;

// Only images re-hosted into our own Supabase Storage bucket (via
// scripts/backfill-image-storage.mjs) are on a domain next.config.ts
// whitelists, so only those can go through Next's image optimizer.
function canOptimize(src: string) {
  if (src.endsWith(".svg")) return false;
  return Boolean(SUPABASE_STORAGE_PREFIX && src.startsWith(SUPABASE_STORAGE_PREFIX));
}

// Renders through Next's built-in resizer (still get compression/format
// conversion) without using the <Image> component itself, which requires a
// fixed width/height or a sized ancestor -- exactly what a masonry layout
// doesn't have, since every tile's size follows its own image's natural
// aspect ratio (no cropping, no letterbox gaps).
function displaySrc(src: string) {
  if (!canOptimize(src)) return src;
  const params = new URLSearchParams({ url: src, w: "828", q: "75" });
  return `/_next/image?${params.toString()}`;
}

export function AdImage({
  src,
  alt,
  brandName,
  className,
  priority,
}: {
  src: string | null | undefined;
  alt: string;
  brandName: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const { from, to, text } = placeholderColors(brandName);
    return (
      <div
        className={`flex aspect-square items-center justify-center ${className ?? "w-full"}`}
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        <span className="font-serif text-6xl opacity-80" style={{ color: text }}>
          {brandName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- natural sizing needs a real <img>, see displaySrc above
    <img
      src={displaySrc(src)}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      className={`block ${className ?? "h-auto w-full"}`}
      onError={() => setFailed(true)}
    />
  );
}

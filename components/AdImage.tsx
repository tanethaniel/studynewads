"use client";

import Image from "next/image";
import { useState } from "react";
import { placeholderColors } from "@/lib/placeholderColor";

const SUPABASE_STORAGE_PREFIX = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`
  : null;

// Only images re-hosted into our own Supabase Storage bucket (via
// scripts/backfill-image-storage.mjs) are on a domain next.config.ts
// whitelists, so only those get Next's real resize/crop optimization.
// Local placeholder SVGs keep unoptimized (see the CSP/hsl() bug noted where
// dangerouslyAllowSVG is set), and anything still pointing at a live
// external host isn't in remotePatterns and would 400 if optimized.
function canOptimize(src: string) {
  if (src.endsWith(".svg")) return false;
  return Boolean(SUPABASE_STORAGE_PREFIX && src.startsWith(SUPABASE_STORAGE_PREFIX));
}

export function AdImage({
  src,
  alt,
  brandName,
  sizes,
  className,
  priority,
}: {
  src: string | null | undefined;
  alt: string;
  brandName: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const { from, to, text } = placeholderColors(brandName);
    return (
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      >
        <span className="font-serif text-6xl opacity-80" style={{ color: text }}>
          {brandName.charAt(0).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized={!canOptimize(src)}
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

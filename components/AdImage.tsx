"use client";

import Image from "next/image";
import { useState } from "react";
import { placeholderColors } from "@/lib/placeholderColor";

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
      unoptimized
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

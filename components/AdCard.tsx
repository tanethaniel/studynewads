import Image from "next/image";
import Link from "next/link";
import type { Ad } from "@/lib/types";

export function AdCard({ ad }: { ad: Ad }) {
  const primary = ad.images[0];

  return (
    <Link
      href={`/ad/${ad.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-bg-raised"
    >
      {primary && (
        <Image
          src={primary.thumbnail_url ?? primary.image_url}
          alt={`${ad.brand_name} — ${ad.title}`}
          fill
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300">
        <p className="text-white font-semibold leading-tight">
          {ad.brand_name}
        </p>
        <p className="text-white/70 text-sm leading-snug line-clamp-2">
          &ldquo;{ad.title}&rdquo;
        </p>
        {ad.year && (
          <p className="mt-1 text-[11px] font-mono-tag uppercase text-accent">
            {ad.year}
          </p>
        )}
      </div>
    </Link>
  );
}

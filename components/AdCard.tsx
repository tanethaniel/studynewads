import Image from "next/image";
import Link from "next/link";
import type { Ad } from "@/lib/types";
import { titleCase } from "@/lib/format";
import { StillRunningBadge } from "@/components/StillRunningBadge";

export function AdCard({ ad }: { ad: Ad }) {
  return (
    <Link
      href={`/ad/${ad.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-lg bg-bg-raised"
    >
      <Image
        src={ad.media_url}
        alt={`${ad.brand} — ${ad.headline}`}
        fill
        sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
        className="object-cover transition duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
      {ad.still_running && (
        <div className="absolute top-3 left-3">
          <StillRunningBadge compact />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300">
        <p className="text-white font-semibold leading-tight">{ad.brand}</p>
        <p className="text-white/70 text-sm leading-snug line-clamp-2">
          &ldquo;{ad.headline}&rdquo;
        </p>
        <p className="mt-1 text-[11px] font-mono-tag uppercase text-accent">
          {titleCase(ad.vertical)}
        </p>
      </div>
    </Link>
  );
}

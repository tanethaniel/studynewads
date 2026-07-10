import Image from "next/image";
import Link from "next/link";
import type { Ad } from "@/lib/types";

function driftSeed(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return {
    "--drift-duration": `${7 + (h % 5)}s`,
    "--drift-delay": `-${h % 9}s`,
    "--drift-x": `${((h % 7) - 3) * 2}px`,
    "--drift-y": `-${4 + (h % 5)}px`,
  } as React.CSSProperties;
}

export function AdCard({ ad }: { ad: Ad }) {
  const primary = ad.images[0];
  const src = primary?.image_url;

  return (
    <Link
      href={`/ad/${ad.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-lg border border-line bg-bg-raised"
    >
      {src && (
        <div className="drift-media absolute inset-0" style={driftSeed(ad.slug)}>
          <Image
            src={src}
            alt={primary?.caption ?? `${ad.brand_name} — ${ad.title}`}
            fill
            unoptimized={src.endsWith(".svg")}
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/5 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <p className="font-semibold leading-tight text-white">
          {ad.brand_name}
        </p>
        <p className="line-clamp-2 text-sm leading-snug text-white/70">
          &ldquo;{ad.title}&rdquo;
        </p>
        {ad.year && (
          <p className="mt-1 font-mono-tag text-[11px] uppercase text-white/60">
            {ad.year}
          </p>
        )}
      </div>
    </Link>
  );
}

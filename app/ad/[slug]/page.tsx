import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdBySlug, getAds, getRelatedAds } from "@/lib/ads";
import { titleCase } from "@/lib/format";
import { MetadataSidebar } from "@/components/MetadataSidebar";
import { SourcesList } from "@/components/SourcesList";
import { RelatedAdsStrip } from "@/components/RelatedAdsStrip";

export async function generateStaticParams() {
  const ads = await getAds();
  return ads.map((ad) => ({ slug: ad.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ad = await getAdBySlug(slug);
  if (!ad) return {};
  return {
    title: `${ad.brand} — "${ad.headline}" | studynewads`,
    description: ad.copy_notes,
  };
}

export default async function AdDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ad = await getAdBySlug(slug);
  if (!ad) notFound();

  const related = await getRelatedAds(ad);
  const year = ad.launch_date?.slice(0, 4);

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-ink-dim mb-6">
        <Link href="/" className="hover:text-accent transition">
          Home
        </Link>
        <span>/</span>
        <Link
          href={`/category/${ad.vertical}`}
          className="hover:text-accent transition"
        >
          {titleCase(ad.vertical)}
        </Link>
      </nav>

      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-bg-raised">
        {ad.media_type === "video" ? (
          <video
            src={ad.media_url}
            controls
            className="h-full w-full object-cover"
          />
        ) : (
          <Image
            src={ad.media_url}
            alt={`${ad.brand} — ${ad.headline}`}
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
            priority
          />
        )}
      </div>

      <p className="mt-6 text-xs font-mono-tag uppercase text-ink-dim">
        {year} · {titleCase(ad.vertical)}
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        {ad.brand}
      </h1>
      <h2 className="mt-2 text-xl text-ink-dim">&ldquo;{ad.headline}&rdquo;</h2>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-10">
        <div>
          <p className="text-base leading-relaxed text-ink/90">
            {ad.copy_notes}
          </p>
          <SourcesList sources={ad.sources} />
        </div>
        <MetadataSidebar ad={ad} />
      </div>

      <RelatedAdsStrip ads={related} />
    </div>
  );
}

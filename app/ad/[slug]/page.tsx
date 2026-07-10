import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdBySlug, getAds, getRelatedAds } from "@/lib/ads";
import { MetadataSidebar } from "@/components/MetadataSidebar";
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
    title: `${ad.brand_name} — "${ad.title}" | studynewads`,
    description: ad.description,
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
  const [hero, ...rest] = ad.images;

  return (
    <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm text-ink-dim mb-6">
        <Link
          href="/"
          className="underline decoration-line underline-offset-4 transition hover:decoration-ink"
        >
          Home
        </Link>
      </nav>

      {hero && (
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-line bg-bg-raised">
          <Image
            src={hero.image_url}
            alt={`${ad.brand_name} — ${ad.title}`}
            fill
            unoptimized={hero.image_url.endsWith(".svg")}
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
            priority
          />
        </div>
      )}

      {rest.length > 0 && (
        <div className="mt-3 grid grid-cols-4 sm:grid-cols-6 gap-3">
          {rest.map((image) => {
            const src = image.thumbnail_url ?? image.image_url;
            return (
              <div
                key={image.id}
                className="relative aspect-[4/5] overflow-hidden rounded-lg border border-line bg-bg-raised"
              >
                <Image
                  src={src}
                  alt={`${ad.brand_name} — ${ad.title}`}
                  fill
                  unoptimized={src.endsWith(".svg")}
                  sizes="200px"
                  className="object-cover"
                />
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-xs font-mono-tag uppercase text-ink-dim">
        {ad.year ?? "Undated"}
      </p>
      <h1 className="mt-2 text-4xl font-semibold tracking-tight">
        {ad.brand_name}
      </h1>
      <h2 className="mt-2 text-xl text-ink-dim">&ldquo;{ad.title}&rdquo;</h2>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-10">
        <p className="text-base leading-relaxed text-ink/90">
          {ad.description}
        </p>
        <MetadataSidebar ad={ad} />
      </div>

      <RelatedAdsStrip ads={related} />
    </div>
  );
}

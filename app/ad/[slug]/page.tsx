import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdBySlug, getAds, getRelatedAds } from "@/lib/ads";
import { MetadataSidebar } from "@/components/MetadataSidebar";
import { RelatedAdsStrip } from "@/components/RelatedAdsStrip";
import { EscapeToHome } from "@/components/EscapeToHome";
import { AdImage } from "@/components/AdImage";

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
      <EscapeToHome />
      <nav className="flex items-center gap-2 text-sm text-ink-dim mb-6">
        <Link
          href="/"
          className="underline decoration-line underline-offset-4 transition hover:decoration-ink"
        >
          Home
        </Link>
      </nav>

      <div className="mx-auto max-h-[70vh] w-fit overflow-hidden rounded-xl border border-line bg-bg-raised">
        <AdImage
          src={hero?.image_url}
          alt={hero?.caption ?? `${ad.brand_name} — ${ad.title}`}
          brandName={ad.brand_name}
          className="max-h-[70vh] w-auto"
          priority
        />
      </div>

      {rest.length > 0 && (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
          {rest.map((image) => (
            <div
              key={image.id}
              className="aspect-square overflow-hidden rounded-lg border border-line bg-bg-raised"
            >
              <AdImage
                src={image.image_url}
                alt={image.caption ?? `${ad.brand_name} — ${ad.title}`}
                brandName={ad.brand_name}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
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

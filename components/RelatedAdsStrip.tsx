import type { Ad } from "@/lib/types";
import { AdCard } from "@/components/AdCard";

export function RelatedAdsStrip({ ads }: { ads: Ad[] }) {
  if (!ads.length) return null;
  return (
    <section className="mt-16">
      <h2 className="text-sm font-mono-tag uppercase text-ink-dim mb-4">
        More to study
      </h2>
      <div className="columns-2 gap-3 sm:columns-3 lg:columns-6">
        {ads.map((ad) => (
          <AdCard key={ad.slug} ad={ad} />
        ))}
      </div>
    </section>
  );
}

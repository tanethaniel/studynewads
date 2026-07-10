import { computeScatterLayout } from "@/lib/scatterLayout";
import { AdCard } from "@/components/AdCard";
import type { Ad } from "@/lib/types";

export function ScatteredGallery({ ads }: { ads: Ad[] }) {
  const columns = 5;
  const { positions, height } = computeScatterLayout(
    ads.map((ad) => ad.slug),
    columns
  );

  return (
    <div className="relative" style={{ height }}>
      {ads.map((ad, i) => (
        <AdCard key={ad.slug} ad={ad} scatter={positions[i]} />
      ))}
    </div>
  );
}

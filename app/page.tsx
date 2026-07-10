import { getAds } from "@/lib/ads";
import { AdCard } from "@/components/AdCard";

export default async function HomePage() {
  const ads = await getAds();

  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ads.map((ad) => (
          <AdCard key={ad.slug} ad={ad} />
        ))}
      </div>
      {ads.length === 0 && (
        <p className="text-ink-dim text-sm py-24 text-center">
          No ads published yet. Run the Gumloop pipeline or seed the
          database to populate the archive.
        </p>
      )}
    </div>
  );
}

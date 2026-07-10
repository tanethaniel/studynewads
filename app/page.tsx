import { getAds } from "@/lib/ads";
import { AdCard } from "@/components/AdCard";
import { ScatteredGallery } from "@/components/ScatteredGallery";

export default async function HomePage() {
  const ads = await getAds();

  return (
    <div className="mx-auto max-w-[1600px] px-6 sm:px-10 py-12">
      <div className="hidden md:block">
        <ScatteredGallery ads={ads} />
      </div>
      <div className="columns-2 gap-6 md:hidden">
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

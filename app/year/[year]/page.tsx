import type { Metadata } from "next";
import { getAdsByYear } from "@/lib/ads";
import { AdCard } from "@/components/AdCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  return { title: `${year} ads | studynewads` };
}

export default async function YearPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  const ads = await getAdsByYear(year);

  return (
    <div className="mx-auto max-w-[1600px] px-6 sm:px-10 py-12">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">{year}</h1>
      <p className="text-sm text-ink-dim mb-8 font-mono-tag uppercase">
        {ads.length} {ads.length === 1 ? "ad" : "ads"}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
        {ads.map((ad) => (
          <AdCard key={ad.slug} ad={ad} />
        ))}
      </div>
      {ads.length === 0 && (
        <p className="text-ink-dim text-sm py-24 text-center">
          Nothing archived for this year yet.
        </p>
      )}
    </div>
  );
}

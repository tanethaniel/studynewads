import type { Metadata } from "next";
import { getAdsByMonth } from "@/lib/ads";
import { formatMonth } from "@/lib/format";
import { AdCard } from "@/components/AdCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ month: string }>;
}): Promise<Metadata> {
  const { month } = await params;
  return { title: `${formatMonth(month)} ads | studynewads` };
}

export default async function MonthPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  const ads = await getAdsByMonth(month);

  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">
        {formatMonth(month)}
      </h1>
      <p className="text-sm text-ink-dim mb-6 font-mono-tag uppercase">
        {ads.length} {ads.length === 1 ? "ad" : "ads"}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {ads.map((ad) => (
          <AdCard key={ad.slug} ad={ad} />
        ))}
      </div>
      {ads.length === 0 && (
        <p className="text-ink-dim text-sm py-24 text-center">
          Nothing archived for this month yet.
        </p>
      )}
    </div>
  );
}

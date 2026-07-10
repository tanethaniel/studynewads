import type { Metadata } from "next";
import { getAdsByVertical } from "@/lib/ads";
import { titleCase } from "@/lib/format";
import { AdCard } from "@/components/AdCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vertical: string }>;
}): Promise<Metadata> {
  const { vertical } = await params;
  return { title: `${titleCase(vertical)} ads | studynewads` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ vertical: string }>;
}) {
  const { vertical } = await params;
  const ads = await getAdsByVertical(vertical);

  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">
        {titleCase(vertical)}
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
          Nothing archived in this category yet.
        </p>
      )}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import type { Ad } from "@/lib/types";
import { AdCard } from "@/components/AdCard";
import { ScatteredGallery } from "@/components/ScatteredGallery";

function titleCase(slug: string) {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function HomeGallery({ ads }: { ads: Ad[] }) {
  const verticals = useMemo(() => {
    const set = new Set<string>();
    for (const ad of ads) if (ad.vertical) set.add(ad.vertical);
    return Array.from(set).sort();
  }, [ads]);

  const [selected, setSelected] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = selected ? ads.filter((ad) => ad.vertical === selected) : ads;

  if (verticals.length === 0) {
    return (
      <>
        <div className="hidden md:block">
          <ScatteredGallery ads={ads} />
        </div>
        <div className="grid grid-cols-2 gap-6 md:hidden">
          {ads.map((ad) => (
            <AdCard key={ad.slug} ad={ad} />
          ))}
        </div>
      </>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono-tag uppercase tracking-wide">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className={
            filtersOpen || selected !== null
              ? "text-ink underline underline-offset-4"
              : "text-ink-dim transition hover:text-ink"
          }
        >
          Filter{selected ? ` · ${titleCase(selected)}` : ""}
        </button>
        {filtersOpen && (
          <>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className={
                "roll-in " +
                (selected === null
                  ? "text-ink underline underline-offset-4"
                  : "text-ink-dim transition hover:text-ink")
              }
              style={{ animationDelay: "0ms" }}
            >
              All
            </button>
            {verticals.map((v, i) => (
              <button
                key={v}
                type="button"
                onClick={() => setSelected(v)}
                className={
                  "roll-in " +
                  (selected === v
                    ? "text-ink underline underline-offset-4"
                    : "text-ink-dim transition hover:text-ink")
                }
                style={{ animationDelay: `${(i + 1) * 60}ms` }}
              >
                {titleCase(v)}
              </button>
            ))}
          </>
        )}
      </div>

      <div className="hidden md:block">
        <ScatteredGallery ads={filtered} />
      </div>
      <div className="grid grid-cols-2 gap-6 md:hidden">
        {filtered.map((ad) => (
          <AdCard key={ad.slug} ad={ad} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-ink-dim text-sm py-24 text-center">
          Nothing archived in this category yet.
        </p>
      )}
    </div>
  );
}

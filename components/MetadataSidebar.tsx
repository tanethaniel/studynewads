import type { Ad } from "@/lib/types";
import { formatDate, formatLabel, platformLabel, titleCase } from "@/lib/format";
import { StillRunningBadge } from "@/components/StillRunningBadge";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="py-3 border-b border-line last:border-b-0">
      <dt className="text-[11px] font-mono-tag uppercase text-ink-dim">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

export function MetadataSidebar({ ad }: { ad: Ad }) {
  return (
    <dl className="rounded-lg border border-line bg-bg-raised px-4">
      <Row label="Category">
        <a
          href={`/category/${ad.vertical}`}
          className="hover:text-accent transition"
        >
          {titleCase(ad.vertical)}
        </a>
      </Row>
      <Row label="Period">{ad.dek ?? "—"}</Row>
      <Row label="Launched">{formatDate(ad.launch_date)}</Row>
      <Row label="Platform(s)">{ad.platforms.map(platformLabel).join(", ")}</Row>
      <Row label="Format">{formatLabel(ad.format)}</Row>
      <Row label="Origin">{ad.origin ?? "Unknown"}</Row>
      {ad.still_running && (
        <div className="py-3">
          <StillRunningBadge />
        </div>
      )}
    </dl>
  );
}

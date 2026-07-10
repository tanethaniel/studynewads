import type { Ad } from "@/lib/types";

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
      <Row label="Year">{ad.year ?? "Undated"}</Row>
      {ad.advertiser_page_url && (
        <Row label="Ad">
          <a
            href={ad.advertiser_page_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline decoration-line underline-offset-4 transition hover:decoration-ink"
          >
            Visit the ad
          </a>
        </Row>
      )}
      {ad.origin && ad.origin.toLowerCase() !== "agent" && (
        <Row label="Origin">{ad.origin}</Row>
      )}
      {ad.source_url && (
        <Row label="Source">
          <a
            href={ad.source_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline decoration-line underline-offset-4 transition hover:decoration-ink"
          >
            {ad.source_name ?? ad.source_url}
          </a>
        </Row>
      )}
      {ad.seed_thread_url && (
        <Row label="Research thread">
          <a
            href={ad.seed_thread_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="underline decoration-line underline-offset-4 transition hover:decoration-ink"
          >
            View thread
          </a>
        </Row>
      )}
    </dl>
  );
}

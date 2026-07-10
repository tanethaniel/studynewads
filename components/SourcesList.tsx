import type { AdSource } from "@/lib/types";

export function SourcesList({ sources }: { sources: AdSource[] }) {
  if (!sources.length) return null;
  return (
    <div className="mt-8">
      <h3 className="text-[11px] font-mono-tag uppercase text-ink-dim mb-2">
        Sources
      </h3>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {sources.map((source) => (
          <li key={source.url}>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-sm underline decoration-line underline-offset-4 hover:text-accent hover:decoration-accent transition"
            >
              {source.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

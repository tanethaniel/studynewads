export function StillRunningBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-accent/10 text-accent font-mono-tag uppercase ${
        compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent pulse-dot" />
      Still running
    </span>
  );
}

export interface ScatterPosition {
  left: string;
  top: number;
  width: number;
  zIndex: number;
}

function seedFromString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// Deterministic (server-renderable, no hydration mismatch) scattered layout:
// a coarse grid gives even coverage of the canvas, then each tile gets a
// small per-slug seeded jitter/size so it doesn't read as a strict grid,
// without drifting far enough to cause heavy overlap. All tiles stay
// upright (no rotation) -- only position and size vary. Each tile's height
// is left to the image's own aspect ratio, so nothing gets cropped
// regardless of its natural shape.
export function computeScatterLayout(
  slugs: string[],
  columns: number
): { positions: ScatterPosition[]; height: number } {
  const cellWidthPct = 100 / columns;
  const rowHeight = 380;

  const positions = slugs.map((slug, i) => {
    const seed = seedFromString(slug);
    const col = i % columns;
    const row = Math.floor(i / columns);

    const jitterX = ((seed % 100) / 100 - 0.5) * cellWidthPct * 0.15;
    const jitterY = (((seed >> 8) % 100) / 100 - 0.5) * rowHeight * 0.08;
    const width = 150 + (seed % 5) * 20;
    const zIndex = 1 + (seed % 10);

    return {
      left: `${col * cellWidthPct + cellWidthPct / 2 + jitterX}%`,
      top: row * rowHeight + rowHeight / 2 + jitterY,
      width,
      zIndex,
    };
  });

  const rows = Math.ceil(slugs.length / columns);
  const height = rows * rowHeight + rowHeight;

  return { positions, height };
}

export interface ScatterPosition {
  left: string;
  top: number;
  width: number;
  rotate: number;
  zIndex: number;
}

function seedFromString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

// Deterministic (server-renderable, no hydration mismatch) scattered layout:
// a coarse grid gives even coverage of the canvas, then each tile gets a
// per-slug seeded jitter/size/rotation so it doesn't read as a strict grid.
// Widths vary but each tile's height is left to the image's own aspect
// ratio, so nothing gets cropped regardless of its natural shape.
export function computeScatterLayout(
  slugs: string[],
  columns: number
): { positions: ScatterPosition[]; height: number } {
  const cellWidthPct = 100 / columns;
  const rowHeight = 260;

  const positions = slugs.map((slug, i) => {
    const seed = seedFromString(slug);
    const col = i % columns;
    const row = Math.floor(i / columns);

    const jitterX = ((seed % 100) / 100 - 0.5) * cellWidthPct * 0.6;
    const jitterY = (((seed >> 8) % 100) / 100 - 0.5) * rowHeight * 0.7;
    const width = 160 + (seed % 6) * 24;
    const rotate = ((seed >> 4) % 13) - 6;
    const zIndex = 1 + (seed % 10);

    return {
      left: `${col * cellWidthPct + cellWidthPct / 2 + jitterX}%`,
      top: row * rowHeight + rowHeight / 2 + jitterY,
      width,
      rotate,
      zIndex,
    };
  });

  const rows = Math.ceil(slugs.length / columns);
  const height = rows * rowHeight + rowHeight;

  return { positions, height };
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (n: number) => Math.round(255 * f(n)).toString(16).padStart(2, "0");
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`;
}

// Deterministic pastel gradient from a brand name, used whenever an ad's
// real image is missing or fails to load (some hosts hotlink-block images
// requested from a different origin than their own site).
export function placeholderColors(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  const hue2 = (hue + 30) % 360;
  return {
    from: hslToHex(hue, 28, 93),
    to: hslToHex(hue2, 22, 87),
    text: hslToHex(hue, 18, 22),
  };
}

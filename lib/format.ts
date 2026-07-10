export function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Undated";
  const [year, month] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function platformLabel(platform: string): string {
  const labels: Record<string, string> = {
    meta: "Meta",
    instagram: "Instagram",
    tiktok: "TikTok",
    youtube: "YouTube",
    linkedin: "LinkedIn",
  };
  return labels[platform] ?? titleCase(platform);
}

export function formatLabel(format: string | null): string {
  if (!format) return "Unspecified";
  const labels: Record<string, string> = {
    image: "Static image",
    video: "Video",
    carousel: "Carousel",
    reel: "Vertical reel",
  };
  return labels[format] ?? titleCase(format);
}

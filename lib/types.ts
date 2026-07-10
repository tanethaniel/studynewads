export type Platform = "meta" | "instagram" | "tiktok" | "youtube" | "linkedin";
export type MediaType = "image" | "video";
export type Format = "image" | "video" | "carousel" | "reel";

export interface AdSource {
  label: string;
  url: string;
}

export interface Ad {
  id: string;
  slug: string;
  brand: string;
  headline: string;
  dek: string | null;
  vertical: string;
  platforms: Platform[];
  format: Format | null;
  launch_date: string | null;
  still_running: boolean;
  media_url: string;
  media_type: MediaType;
  advertiser_page_url: string | null;
  body_copy: string | null;
  copy_notes: string;
  origin: string | null;
  sources: AdSource[];
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

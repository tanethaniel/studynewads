export interface AdImage {
  id: string;
  ad_id: string;
  image_url: string;
  storage_path: string | null;
  caption: string | null;
  is_primary: boolean;
  source_url: string | null;
  created_at: string;
}

export interface Ad {
  id: string;
  slug: string;
  brand_name: string;
  title: string;
  year: number | null;
  description: string;
  origin: string | null;
  source_name: string | null;
  source_url: string | null;
  seed_thread_url: string | null;
  created_at: string;
  images: AdImage[];
}

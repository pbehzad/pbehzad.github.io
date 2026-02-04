export interface Composition {
  id: string;
  slug: string;
  title: string;
  year: string;
  instruments: string;
  duration?: string | null;
  description?: string | null;
  program_notes?: string | null;
  score_url?: string | null;
  audio_urls?: string[];
  video_url?: string | null;
  tags?: string[];
  featured?: boolean;
  status: 'draft' | 'published';
  premiere?: {
    date?: string;
    location?: string;
    performers?: string;
  } | null;
  related_texts?: string[];
  created_at: string;
  updated_at: string;
}

export interface CompositionMetadata {
  total: number;
  years: number[];
  instruments: string[];
  tags: string[];
}

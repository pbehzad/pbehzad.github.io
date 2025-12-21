export interface Composition {
  id: string;
  slug: string;
  title: string;
  year: number;
  instruments: string;
  duration?: string;
  description?: string;
  program_notes?: string;
  score_url?: string;
  audio_urls?: string[];
  video_url?: string;
  tags?: string[];
  featured?: boolean;
  status: 'draft' | 'published';
  premiere?: {
    date?: string;
    location?: string;
    performers?: string;
  };
  related_texts?: string[]; // IDs of related texts
  created_at: string;
  updated_at: string;
}

export interface CompositionMetadata {
  total: number;
  years: number[];
  instruments: string[];
  tags: string[];
}

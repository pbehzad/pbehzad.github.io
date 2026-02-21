export interface Text {
  id: string;
  slug: string;
  title: string;
  year: number;
  type: 'essay' | 'article' | 'paper' | 'note';
  description?: string | null;
  abstract?: string | null;
  content_file?: string | null;
  pdf_url?: string | null;
  external_url?: string | null;
  tags?: string[];
  featured?: boolean;
  status: 'draft' | 'published';
  published_in?: string | null;
  related_compositions?: string[];
  created_at: string;
  updated_at: string;
}

export interface TextMetadata {
  total: number;
  years: number[];
  types: string[];
  tags: string[];
}

export interface TextContent {
  metadata: Text;
  content: string; // Rendered HTML from markdown
  raw: string; // Raw markdown
}

export interface Text {
  id: string;
  slug: string;
  title: string;
  year: number;
  type: 'essay' | 'article' | 'paper' | 'note';
  description?: string;
  abstract?: string;
  content_file?: string; // Markdown file path
  pdf_url?: string;
  external_url?: string;
  tags?: string[];
  featured?: boolean;
  status: 'draft' | 'published';
  published_in?: string;
  related_compositions?: string[]; // IDs of related compositions
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

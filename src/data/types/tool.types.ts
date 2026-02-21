export interface Tool {
  id: string;
  slug: string;
  name: string;
  year: string;
  description?: string | null;
  category?: 'web-audio' | 'max-msp' | 'notation' | 'composition' | 'other';
  technologies?: string[];
  url?: string | null;
  github_url?: string | null;
  image_url?: string | null;
  featured?: boolean;
  status: 'draft' | 'published' | 'in-progress' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ToolMetadata {
  total: number;
  categories: string[];
  technologies: string[];
}

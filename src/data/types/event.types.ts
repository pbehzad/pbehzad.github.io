export interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  country?: string | null;
  role: string;
  program?: string | null;
  ensemble?: string | null;
  url?: string | null;
  description?: string | null;
  html_content?: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

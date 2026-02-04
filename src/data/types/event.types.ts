export interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  venue: string;
  city: string;
  country?: string;
  role: string;
  program?: string;
  ensemble?: string;
  url?: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

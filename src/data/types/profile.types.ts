export interface Profile {
  name: string;
  title: string;
  subtitle: string;
  tagline: string;
  bio: string;
  specializations: string[];
  skills: {
    category: string;
    items: string[];
  }[];
  education?: {
    degree: string;
    institution: string;
    year: string;
  }[];
  awards?: {
    title: string;
    year: string;
    organization?: string;
  }[];
  updated_at: string;
}

export interface ContactInfo {
  email: string;
  github?: string | null;
  website?: string | null;
  linkedin?: string | null;
  soundcloud?: string | null;
  bandcamp?: string | null;
  availability_status: string;
  updated_at: string;
}

export interface HomeContent {
  hero: {
    name: string;
    title: string;
    subtitle: string;
    tagline: string;
  };
  recent_works: {
    title: string;
    year: number;
  }[];
  updated_at: string;
}

import { z } from 'zod';

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional().default(''),
  subtitle: z.string().optional().default(''),
  tagline: z.string().optional().default(''),
  bio: z.string().min(1),
  html_content: z.string().nullable().optional(),
  specializations: z.array(z.string()).optional().default([]),
  skills: z.array(z.object({
    category: z.string(),
    items: z.array(z.string()),
  })).optional().default([]),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string(),
  })).optional().default([]),
  awards: z.array(z.object({
    title: z.string(),
    year: z.string(),
    organization: z.string().optional(),
  })).optional().default([]),
  updated_at: z.string().datetime(),
});

export const contactSchema = z.object({
  email: z.string().email(),
  github: z.string().nullable().optional(),
  website: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  soundcloud: z.string().nullable().optional(),
  bandcamp: z.string().nullable().optional(),
  availability_status: z.string(),
  updated_at: z.string().datetime(),
});

export const homeContentSchema = z.object({
  hero: z.object({
    name: z.string().min(1),
    title: z.string().min(1),
    subtitle: z.string().min(1),
    tagline: z.string().min(1),
  }),
  recent_works: z.array(z.object({
    title: z.string(),
    year: z.number(),
  })),
  updated_at: z.string().datetime(),
});

export type ProfileSchema = z.infer<typeof profileSchema>;
export type ContactSchema = z.infer<typeof contactSchema>;
export type HomeContentSchema = z.infer<typeof homeContentSchema>;

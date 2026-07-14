import { z } from 'zod';

const storedFileUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\/(?!\/)/, 'Must be an absolute URL or a site-relative path'),
]);

export const profileSchema = z.object({
  name: z.string().min(1),
  title: z.string().optional().default(''),
  subtitle: z.string().optional().default(''),
  tagline: z.string().optional().default(''),
  bio: z.string().min(1),
  html_content: z.string().nullable().optional(),
  about_sections: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    html_content: z.string(),
    link_url: storedFileUrlSchema.nullable().optional(),
    link_label: z.string().optional(),
    visible: z.boolean().default(true),
    initially_open: z.boolean().optional().default(false),
  })).optional().default([]),
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

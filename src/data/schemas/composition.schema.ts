import { z } from 'zod';

const storedFileUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\/(?!\/)/, 'Must be an absolute URL or a site-relative path'),
]);

export const compositionSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  year: z.string().min(4),
  instruments: z.string().min(1),
  duration: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  program_notes: z.string().nullable().optional(),
  score_url: storedFileUrlSchema.nullable().optional(),
  audio_urls: z.array(storedFileUrlSchema).optional().default([]),
  video_url: z.string().url().nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
  status: z.enum(['draft', 'published']).default('published'),
  premiere: z.object({
    date: z.string().optional(),
    location: z.string().optional(),
    performers: z.string().optional(),
  }).nullable().optional(),
  related_texts: z.array(z.string()).optional().default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const compositionsArraySchema = z.array(compositionSchema);

export type CompositionSchema = z.infer<typeof compositionSchema>;

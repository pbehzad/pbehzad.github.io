import { z } from 'zod';

export const textSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  type: z.enum(['essay', 'article', 'paper', 'note']),
  description: z.string().nullable().optional(),
  abstract: z.string().nullable().optional(),
  content_file: z.string().nullable().optional(),
  pdf_url: z.string().url().nullable().optional(),
  external_url: z.string().url().nullable().optional(),
  tags: z.array(z.string()).optional().default([]),
  featured: z.boolean().optional().default(false),
  status: z.enum(['draft', 'published']).default('published'),
  published_in: z.string().nullable().optional(),
  related_compositions: z.array(z.string()).optional().default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const textsArraySchema = z.array(textSchema);

export type TextSchema = z.infer<typeof textSchema>;

import { z } from 'zod';

export const toolSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  year: z.string().min(1),
  description: z.string().nullable().optional(),
  category: z.enum(['web-audio', 'max-msp', 'notation', 'composition', 'other']).optional(),
  technologies: z.array(z.string()).optional().default([]),
  url: z.string().url().nullable().optional(),
  github_url: z.string().url().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  featured: z.boolean().optional().default(false),
  status: z.enum(['draft', 'published', 'in-progress', 'archived']).default('published'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const toolsArraySchema = z.array(toolSchema);

export type ToolSchema = z.infer<typeof toolSchema>;

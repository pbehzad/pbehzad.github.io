import { z } from 'zod';

export const eventSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  title: z.string().min(1),
  date: z.string().min(1),
  venue: z.string().min(1),
  city: z.string().min(1),
  country: z.string().nullable().optional(),
  role: z.string().min(1),
  program: z.string().nullable().optional(),
  ensemble: z.string().nullable().optional(),
  url: z.string().url().nullable().optional(),
  description: z.string().nullable().optional(),
  html_content: z.string().nullable().optional(),
  status: z.enum(['draft', 'published']).default('published'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const eventsArraySchema = z.array(eventSchema);

export type EventSchema = z.infer<typeof eventSchema>;

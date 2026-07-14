import type { MetadataRoute } from 'next';
import { getAllCompositions, getAllEvents, getAllTexts } from '@/services/contentService';

const BASE_URL = 'https://www.parhambehzad.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/compositions`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/texts`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.5 },
  ];

  try {
    const [{ data: compositions }, { data: events }, { data: texts }] = await Promise.all([
      getAllCompositions(),
      getAllEvents(),
      getAllTexts(),
    ]);

    const compositionRoutes: MetadataRoute.Sitemap = compositions.map((c) => ({
      url: `${BASE_URL}/compositions/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

    const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
      url: `${BASE_URL}/events/${e.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    }));

    // Only texts with managed bodies have in-app detail pages.
    const textRoutes: MetadataRoute.Sitemap = texts
      .filter((t) => t.content_file)
      .map((t) => ({
        url: `${BASE_URL}/texts/${t.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      }));

    return [...staticRoutes, ...compositionRoutes, ...eventRoutes, ...textRoutes];
  } catch {
    return staticRoutes;
  }
}

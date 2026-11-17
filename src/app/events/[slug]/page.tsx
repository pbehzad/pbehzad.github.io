import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventBySlug, getProfile } from '@/services/contentService';
import { SiteShell } from '@/app/ui/SiteShell';
import { EventArticle } from '@/app/ui/EventArticle';
import { formattedTextToPlain } from '@/app/ui/inlineFormatting';

const getEvent = cache(async (slug: string) => (await getEventBySlug(slug)).data);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event || event.status !== 'published') return {};
  return {
    title: `${event.title} — Parham Behzad`,
    description:
      formattedTextToPlain(event.description) ??
      `${event.date} — ${[event.venue, event.city].filter(Boolean).join(', ')}`,
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [event, { data: profile }] = await Promise.all([getEvent(slug), getProfile()]);

  if (!event || event.status !== 'published') {
    notFound();
  }

  return (
    <SiteShell brandName={profile.name}>
      <EventArticle event={event} />
    </SiteShell>
  );
}

import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getEventBySlug } from '@/services/contentService';
import DetailShell from '@/app/components/DetailShell';

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
      event.description ?? `${event.date} — ${[event.venue, event.city].filter(Boolean).join(', ')}`,
  };
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event || event.status !== 'published') {
    notFound();
  }

  return (
    <DetailShell backHref="/events" backLabel="events">
      {/* Header */}
      <header className="mt-8 mb-12">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wider">
          {event.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm opacity-50">
          <span>{event.date}</span>
          <span>{event.venue}, {event.city}{event.country ? `, ${event.country}` : ''}</span>
          {event.role && <span>{event.role}</span>}
        </div>
      </header>

      {/* Program / Ensemble */}
      {(event.program || event.ensemble) && (
        <div className="mb-12 text-sm opacity-40 flex flex-col gap-1">
          {event.program && <div>Program: {event.program}</div>}
          {event.ensemble && <div>Ensemble: {event.ensemble}</div>}
        </div>
      )}

      {/* Description */}
      {event.description && (
        <p className="mb-12 max-w-2xl text-sm opacity-60 leading-relaxed whitespace-pre-line">
          {event.description}
        </p>
      )}

      {/* Rich HTML content */}
      {event.html_content && (
        <div
          className="prose prose-invert prose-sm max-w-2xl mb-12"
          dangerouslySetInnerHTML={{ __html: event.html_content }}
        />
      )}

      {/* External link */}
      {event.url && (
        <div className="border-t border-white/10 pt-8 mt-12">
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm opacity-50 hover:opacity-100 transition-opacity"
          >
            More info &rarr;
          </a>
        </div>
      )}
    </DetailShell>
  );
}

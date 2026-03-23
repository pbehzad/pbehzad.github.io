import { notFound } from 'next/navigation';
import { getEventBySlug } from '@/services/contentService';
import Link from 'next/link';

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: event } = await getEventBySlug(slug);

  if (!event || event.status !== 'published') {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Name — fixed top-right, matching homepage */}
      <div className="fixed top-6 right-6 md:top-12 md:right-12 z-50">
        <Link
          href="/"
          className="text-sm font-normal tracking-wide no-underline hover:opacity-70 transition-opacity"
        >
          parham behzad
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 md:pb-24" style={{ paddingTop: '80px' }}>
        {/* Back link */}
        <Link
          href="/events"
          className="text-xs uppercase tracking-wider no-underline opacity-40 hover:opacity-70 transition-opacity"
        >
          &larr; Events
        </Link>

        {/* Header */}
        <header className="mt-12 mb-16">
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
          <p className="mb-12 text-sm opacity-60 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>
        )}

        {/* Rich HTML content */}
        {event.html_content && (
          <div
            className="prose prose-invert prose-sm max-w-none mb-12"
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
      </div>
    </div>
  );
}

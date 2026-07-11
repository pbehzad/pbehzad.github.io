import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCompositionBySlug } from '@/lib/content-manager';
import DetailShell from '@/app/components/DetailShell';

const getComposition = cache(getCompositionBySlug);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const composition = await getComposition(slug);
  if (!composition || composition.status !== 'published') return {};
  return {
    title: `${composition.title} — Parham Behzad`,
    description:
      composition.description ??
      `${composition.title} (${composition.year.substring(0, 4)}) — ${composition.instruments}`,
  };
}

export default async function CompositionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const composition = await getComposition(slug);

  if (!composition || composition.status !== 'published') {
    notFound();
  }

  const year = composition.year.substring(0, 4);

  return (
    <DetailShell backHref="/compositions" backLabel="compositions">
      {/* Header */}
      <header className="mt-8 mb-12">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wider">
          {composition.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm opacity-50">
          <span>{year}</span>
          <span>{composition.instruments}</span>
          {composition.duration && <span>{composition.duration}&apos;</span>}
        </div>
      </header>

      {/* Premiere info */}
      {composition.premiere && (
        <div className="mb-12 text-sm opacity-40">
          {composition.premiere.date && (
            <div>Premiere: {composition.premiere.date}</div>
          )}
          {composition.premiere.location && (
            <div>{composition.premiere.location}</div>
          )}
          {composition.premiere.performers && (
            <div>{composition.premiere.performers}</div>
          )}
        </div>
      )}

      {/* Description */}
      {composition.description && (
        <p className="mb-12 max-w-2xl text-sm opacity-60 leading-relaxed">
          {composition.description}
        </p>
      )}

      {/* Program notes */}
      {composition.program_notes && (
        <div className="mb-12 max-w-2xl">
          <h2 className="text-xs uppercase tracking-wider opacity-40 mb-4">Program Notes</h2>
          <p className="text-sm opacity-60 leading-relaxed whitespace-pre-line">
            {composition.program_notes}
          </p>
        </div>
      )}

      {/* Rich HTML content */}
      {composition.html_content && (
        <div
          className="prose prose-invert prose-sm max-w-2xl mb-12"
          dangerouslySetInnerHTML={{ __html: composition.html_content }}
        />
      )}

      {/* Media links */}
      {(composition.score_url || composition.video_url || (composition.audio_urls && composition.audio_urls.length > 0)) && (
        <div className="border-t border-white/10 pt-8 mt-12">
          <h2 className="text-xs uppercase tracking-wider opacity-40 mb-4">Media</h2>
          <div className="flex flex-col gap-2 text-sm">
            {composition.score_url && (
              <a
                href={composition.score_url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                Score
              </a>
            )}
            {composition.video_url && (
              <a
                href={composition.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                Video
              </a>
            )}
            {composition.audio_urls?.map((url, i) => (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-50 hover:opacity-100 transition-opacity"
              >
                Audio {composition.audio_urls!.length > 1 ? i + 1 : ''}
              </a>
            ))}
          </div>
        </div>
      )}
    </DetailShell>
  );
}

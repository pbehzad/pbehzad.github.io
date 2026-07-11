import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTextBySlug } from '@/services/contentService';
import { getTextHtml } from '@/lib/text-content-manager';
import DetailShell from '@/app/components/DetailShell';

const getText = cache(async (slug: string) => (await getTextBySlug(slug)).data);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const text = await getText(slug);
  if (!text || text.status !== 'published') return {};
  return {
    title: `${text.title} — Parham Behzad`,
    description: text.description ?? text.abstract ?? `${text.title} (${text.year}) — ${text.type}`,
  };
}

export default async function TextPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const text = await getText(slug);

  if (!text || text.status !== 'published') {
    notFound();
  }

  const contentHtml = text.content_file ? await getTextHtml(text.content_file) : null;

  return (
    <DetailShell backHref="/texts" backLabel="texts">
      {/* Header */}
      <header className="mt-8 mb-12">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wider">
          {text.title}
        </h1>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm opacity-50">
          <span>{text.year}</span>
          <span>{text.type}</span>
          {text.published_in && <span>{text.published_in}</span>}
        </div>
      </header>

      {/* Abstract */}
      {text.abstract && (
        <p className="mb-12 max-w-2xl text-sm opacity-60 leading-relaxed italic">
          {text.abstract}
        </p>
      )}

      {/* Body */}
      {contentHtml && (
        <div
          className="prose prose-invert prose-sm max-w-2xl mb-12"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      )}

      {/* External / PDF links */}
      {(text.external_url || text.pdf_url) && (
        <div className="border-t border-white/10 pt-8 mt-12 flex flex-col gap-2 text-sm">
          {text.external_url && (
            <a
              href={text.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              Read online &rarr;
            </a>
          )}
          {text.pdf_url && (
            <a
              href={text.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="opacity-50 hover:opacity-100 transition-opacity"
            >
              PDF &rarr;
            </a>
          )}
        </div>
      )}
    </DetailShell>
  );
}

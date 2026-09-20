import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProfile, getTextBySlug } from '@/services/contentService';
import { getTextHtml } from '@/lib/text-content-manager';
import { SiteShell } from '@/app/ui/SiteShell';
import { TextArticle } from '@/app/ui/TextArticle';

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
  const [text, { data: profile }] = await Promise.all([getText(slug), getProfile()]);

  if (!text || text.status !== 'published') {
    notFound();
  }

  const contentHtml = text.content_file ? await getTextHtml(text.content_file) : null;

  return (
    <SiteShell brandName={profile.name}>
      <TextArticle text={text} contentHtml={contentHtml} />
    </SiteShell>
  );
}

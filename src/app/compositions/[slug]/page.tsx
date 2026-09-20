import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCompositionBySlug } from '@/lib/content-manager';
import { getProfile } from '@/services/contentService';
import { SiteShell } from '@/app/ui/SiteShell';
import { CompositionArticle } from '@/app/ui/CompositionArticle';

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
  const [composition, { data: profile }] = await Promise.all([getComposition(slug), getProfile()]);

  if (!composition || composition.status !== 'published') {
    notFound();
  }

  return (
    <SiteShell brandName={profile.name}>
      <CompositionArticle composition={composition} />
    </SiteShell>
  );
}

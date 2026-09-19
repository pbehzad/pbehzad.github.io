import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCompositions, getProfile } from '@/services/contentService';
import { SiteShell } from '../../ui/SiteShell';
import { StatusMessage } from '../../ui/StatusMessage';

// Temporary review surface for the public tokens, primitives, and shell.
// Remove once the page views (R3–R6) replace it.

export const metadata: Metadata = {
  title: 'Design Lab — Primitives',
  robots: { index: false, follow: false },
};

export default async function PrimitivesPreviewPage() {
  const [{ data: profile }, { data: compositions, error }] = await Promise.all([
    getProfile(),
    getAllCompositions(),
  ]);

  return (
    <SiteShell brandName={profile.name}>
      <div className="flex flex-col gap-[var(--space-9)] px-[var(--gutter)] py-[var(--space-9)]">
        <section className="ui-index-column" aria-labelledby="preview-title">
          <h1 id="preview-title" className="ui-label">primitives</h1>
          {error ? (
            <div className="mt-[var(--space-6)]">
              <StatusMessage kind="error">Works could not be loaded.</StatusMessage>
            </div>
          ) : (
            <ul className="mt-[var(--space-6)] flex flex-col gap-[var(--space-7)]">
              {compositions.map((composition) => (
                <li key={composition.id}>
                  <Link className="ui-title" href={`/compositions/${composition.slug}`}>
                    {composition.title}
                  </Link>
                  <p className="ui-meta">
                    {composition.instruments} · {composition.year}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ui-measure" aria-labelledby="preview-measure">
          <h2 id="preview-measure" className="ui-label">measure</h2>
          <p className="mt-[var(--space-5)]">
            {profile.bio}{' '}
            <Link className="ui-link" href="/about">About</Link>
          </p>
        </section>

        <section className="ui-index-column" aria-labelledby="preview-states">
          <h2 id="preview-states" className="ui-label">states</h2>
          <div className="mt-[var(--space-5)] flex flex-col gap-[var(--space-3)]">
            <StatusMessage kind="empty">Empty state example.</StatusMessage>
            <StatusMessage kind="loading">Loading state example.</StatusMessage>
            <StatusMessage kind="error">Error state example.</StatusMessage>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllCompositions, getProfile } from '@/services/contentService';
import { BrandLink } from '../../ui/BrandLink';
import { MenuButton } from '../../ui/MenuButton';
import { SkipLink } from '../../ui/SkipLink';
import { StatusMessage } from '../../ui/StatusMessage';

// Temporary R1 review surface for the public tokens and primitives.
// Remove once the shared shell (R2) and page views replace it.

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
    <div className="ui">
      <SkipLink targetId="main" />

      <header className="flex items-start justify-between ps-[var(--gutter-inline-start)] pe-[var(--gutter-inline-end)] pt-[var(--gutter-block-start)]">
        <BrandLink name={profile.name} />
        <MenuButton controls="preview-menu" expanded={false} />
        <nav id="preview-menu" aria-label="Preview menu" hidden>
          <ul>
            <li><Link href="/compositions">Works</Link></li>
          </ul>
        </nav>
      </header>

      <main id="main" tabIndex={-1} className="flex flex-col gap-[var(--space-9)] px-[var(--gutter)] py-[var(--space-9)]">
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

        <section className="ui-index-column" aria-labelledby="preview-menu-states">
          <h2 id="preview-menu-states" className="ui-label">menu button, expanded</h2>
          <div className="mt-[var(--space-5)]">
            <MenuButton controls="preview-menu" expanded label="Close menu" />
          </div>
        </section>
      </main>
    </div>
  );
}

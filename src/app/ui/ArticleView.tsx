import Link from 'next/link';
import type { ReactNode } from 'react';

type ArticleViewProps = {
  /** The index this article belongs to; the one step the trail goes back. */
  section: { href: string; label: string };
  title: string;
  /** Identifying metadata, joined into the one muted line under the title. */
  meta?: readonly (string | null | undefined)[];
  children: ReactNode;
};

const TITLE_ID = 'article-title';

/**
 * Shared reading shell for composition, event, and text pages. It spans the
 * shared frame, and running text inside it keeps the reading measure (see
 * article.css), floating on the background: no glass, canvas, panel, or
 * backdrop filter. The section adapters supply the title, the metadata line,
 * and the body.
 */
export function ArticleView({ section, title, meta, children }: ArticleViewProps) {
  const metaLine = meta?.map((part) => part?.trim()).filter(Boolean).join(' · ');

  return (
    <article className="ui-article" aria-labelledby={TITLE_ID}>
      <div className="ui-frame">
        {/* One step back to the parent index. The `h1` below names the current
            page and the menu already lists every section, so the trail stops
            at the parent rather than restating either. */}
        <nav className="ui-article__nav" aria-label="Breadcrumb">
          <Link className="ui-article__back" href={section.href}>
            <span aria-hidden="true">←</span>
            {section.label}
          </Link>
        </nav>

        <header className="ui-article__header">
          <h1 id={TITLE_ID} className="ui-article__title">
            {title}
          </h1>
          {metaLine && <p className="ui-article__meta">{metaLine}</p>}
        </header>

        <div className="ui-article__body">{children}</div>
      </div>
    </article>
  );
}

/** A labelled part of an article body: a small heading and its content. */
export function ArticleSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="ui-article__section">
      <h2 className="ui-label">{title}</h2>
      {children}
    </section>
  );
}

export type Fact = { term: string; value: string };

/** Named metadata (premiere, programme, ensemble) as a description list. */
export function ArticleFacts({ facts }: { facts: readonly Fact[] }) {
  return (
    <dl className="ui-facts">
      {facts.map((fact) => (
        <div key={fact.term} className="ui-facts__row">
          <dt>{fact.term}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export type ArticleLink = { key: string; href: string; label: string };

/** Off-site and media destinations, one link per row. */
export function ArticleLinks({ links }: { links: readonly ArticleLink[] }) {
  return (
    <ul className="ui-article__links">
      {links.map((link) => (
        <li key={link.key}>
          <a
            className="ui-article__link"
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {link.label}
            <span className="ui-visually-hidden"> (opens in a new tab)</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

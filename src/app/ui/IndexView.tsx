import Link from 'next/link';
import { StatusMessage } from './StatusMessage';

export type IndexItem = {
  key: string;
  /** Omitted when an entry has no destination; the row is then plain text. */
  href?: string;
  title: string;
  meta?: string;
  /** Leaves the site, so the row is a plain anchor rather than a route link. */
  external?: boolean;
};

export type IndexGroup = {
  key: string;
  /** Sub-heading above the group. Omit it for a single ungrouped list. */
  label?: string;
  items: readonly IndexItem[];
};

type IndexViewProps = {
  label: string;
  groups: readonly IndexGroup[];
  /** Shown instead of the list when the content could not be loaded. */
  errorMessage?: string;
  emptyMessage: string;
};

/** Title and metadata as one row, so a linked row has one purpose and one focus ring. */
function IndexRowContent({ item }: { item: IndexItem }) {
  return (
    <>
      <span className="ui-index__title">{item.title}</span>
      {item.meta && <span className="ui-index__meta">{item.meta}</span>}
    </>
  );
}

function IndexRow({ item }: { item: IndexItem }) {
  if (!item.href) {
    return (
      <div className="ui-index__row">
        <IndexRowContent item={item} />
      </div>
    );
  }

  if (item.external) {
    return (
      <a className="ui-index__link" href={item.href} target="_blank" rel="noopener noreferrer">
        <IndexRowContent item={item} />
        <span className="ui-visually-hidden"> (opens in a new tab)</span>
      </a>
    );
  }

  return (
    <Link className="ui-index__link" href={item.href}>
      <IndexRowContent item={item} />
    </Link>
  );
}

/**
 * Shared section index: a small label and a sparse vertical list floating
 * directly on the background. No cards, rules, or highlights; the section
 * adapters (Works, Events, Texts) only map content to items and groups.
 */
export function IndexView({ label, groups, errorMessage, emptyMessage }: IndexViewProps) {
  const total = groups.reduce((count, group) => count + group.items.length, 0);

  return (
    <section className="ui-index" aria-labelledby="index-title">
      <div className="ui-index-column">
        <h1 id="index-title" className="ui-label">
          {label}
        </h1>
        <div className="ui-index__body">
          {errorMessage ? (
            <StatusMessage kind="error">{errorMessage}</StatusMessage>
          ) : total === 0 ? (
            <StatusMessage kind="empty">{emptyMessage}</StatusMessage>
          ) : (
            groups.map((group) => (
              <div key={group.key} className="ui-index__group">
                {group.label && <h2 className="ui-label">{group.label}</h2>}
                <ul className="ui-index__list">
                  {group.items.map((item) => (
                    <li key={item.key}>
                      <IndexRow item={item} />
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

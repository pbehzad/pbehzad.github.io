import Link from 'next/link';
import { StatusMessage } from './StatusMessage';

export type IndexItem = {
  key: string;
  href: string;
  title: string;
  meta?: string;
};

type IndexViewProps = {
  label: string;
  items: readonly IndexItem[];
  /** Shown instead of the list when the content could not be loaded. */
  errorMessage?: string;
  emptyMessage: string;
};

/**
 * Shared section index: a small label and a sparse vertical list of links
 * floating directly on the background. No cards, rules, or highlights; the
 * section adapters (Works, Events, Texts) only map content to items.
 */
export function IndexView({ label, items, errorMessage, emptyMessage }: IndexViewProps) {
  return (
    <section className="ui-index" aria-labelledby="index-title">
      <div className="ui-index-column">
        <h1 id="index-title" className="ui-label">
          {label}
        </h1>
        <div className="ui-index__body">
          {errorMessage ? (
            <StatusMessage kind="error">{errorMessage}</StatusMessage>
          ) : items.length === 0 ? (
            <StatusMessage kind="empty">{emptyMessage}</StatusMessage>
          ) : (
            <ul className="ui-index__list">
              {items.map((item) => (
                <li key={item.key}>
                  <Link className="ui-index__link" href={item.href}>
                    <span className="ui-index__title">{item.title}</span>
                    {item.meta && <span className="ui-index__meta">{item.meta}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

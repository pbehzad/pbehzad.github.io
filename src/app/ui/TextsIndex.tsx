import type { Text } from '@/data/types';
import { IndexView } from './IndexView';
import type { IndexItem } from './IndexView';

type TextsIndexProps = {
  texts: readonly Text[];
  hasError: boolean;
};

function toIndexItem(text: Text): IndexItem {
  // A managed body or PDF is read on the detail route; an entry with neither
  // falls back to its external publication, and one with none is plain text.
  const hasDetailPage = Boolean(text.content_file || text.pdf_url);
  const external = hasDetailPage ? undefined : text.external_url?.trim() || undefined;
  const meta = [String(text.year), text.type.trim()].filter(Boolean).join(' · ');
  return {
    key: text.id,
    href: hasDetailPage ? `/texts/${text.slug}` : external,
    title: text.title,
    meta: meta || undefined,
    external: Boolean(external),
  };
}

/** Texts adapter: published texts, newest first, as index items. */
export function TextsIndex({ texts, hasError }: TextsIndexProps) {
  const ordered = [...texts].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));

  return (
    <IndexView
      label="texts"
      groups={[{ key: 'texts', items: ordered.map(toIndexItem) }]}
      errorMessage={hasError ? 'Texts could not be loaded.' : undefined}
      emptyMessage="No texts are published yet."
    />
  );
}

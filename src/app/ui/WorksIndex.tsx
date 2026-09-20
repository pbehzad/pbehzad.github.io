import type { Composition } from '@/data/types';
import { IndexView } from './IndexView';
import type { IndexItem } from './IndexView';

type WorksIndexProps = {
  compositions: readonly Composition[];
  hasError: boolean;
};

// `year` holds a full date such as 2025-06-01; the index shows the year only.
function toDisplayYear(year: string) {
  return year.match(/^\d{4}/)?.[0] ?? year;
}

function toIndexItem(composition: Composition): IndexItem {
  const meta = [composition.instruments.trim(), toDisplayYear(composition.year.trim())]
    .filter(Boolean)
    .join(' · ');
  return {
    key: composition.id,
    href: `/compositions/${composition.slug}`,
    title: composition.title,
    meta: meta || undefined,
  };
}

/** Works adapter: published compositions, newest first, as index items. */
export function WorksIndex({ compositions, hasError }: WorksIndexProps) {
  return (
    <IndexView
      label="works"
      groups={[{ key: 'works', items: compositions.map(toIndexItem) }]}
      errorMessage={hasError ? 'Works could not be loaded.' : undefined}
      emptyMessage="No works are published yet."
    />
  );
}

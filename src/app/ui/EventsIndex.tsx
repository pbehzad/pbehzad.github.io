import type { Event } from '@/data/types';
import { IndexView } from './IndexView';
import type { IndexGroup, IndexItem } from './IndexView';

type EventsIndexProps = {
  events: readonly Event[];
  hasError: boolean;
};

/**
 * Local date, not `toISOString()` (UTC): near midnight the grouping would
 * otherwise flip an event between upcoming and past.
 */
function todayLocalIsoDate() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

function toIndexItem(event: Event): IndexItem {
  const place = [event.venue, event.city]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
  // The stored ISO date stays as it is: unambiguous, and it aligns in mono.
  const meta = [event.date.trim(), place].filter(Boolean).join(' · ');
  return {
    key: event.id,
    href: `/events/${event.slug}`,
    title: event.title,
    meta: meta || undefined,
  };
}

/**
 * Events adapter: published events split into upcoming (soonest first) and
 * past (most recent first). The split is a heading, not a container.
 */
export function EventsIndex({ events, hasError }: EventsIndexProps) {
  const today = todayLocalIsoDate();
  const upcoming = events
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = events
    .filter((event) => event.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  const groups: IndexGroup[] = [];
  if (upcoming.length) {
    groups.push({ key: 'upcoming', label: 'upcoming', items: upcoming.map(toIndexItem) });
  }
  if (past.length) {
    groups.push({ key: 'past', label: 'past', items: past.map(toIndexItem) });
  }

  return (
    <IndexView
      label="events"
      groups={groups}
      errorMessage={hasError ? 'Events could not be loaded.' : undefined}
      emptyMessage="No events are published yet."
    />
  );
}

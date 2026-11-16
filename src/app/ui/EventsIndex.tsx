import type { Event } from '@/data/types';
import { IndexView } from './IndexView';
import type { IndexGroup } from './IndexView';
import { splitEventsByDate, toEventItem } from './eventSchedule';

type EventsIndexProps = {
  events: readonly Event[];
  hasError: boolean;
};

/**
 * Events adapter: published events split into upcoming (soonest first) and
 * past (most recent first). The split is a heading, not a container.
 */
export function EventsIndex({ events, hasError }: EventsIndexProps) {
  const { upcoming, past } = splitEventsByDate(events);

  const groups: IndexGroup[] = [];
  if (upcoming.length) {
    groups.push({ key: 'upcoming', label: 'upcoming', items: upcoming.map(toEventItem) });
  }
  if (past.length) {
    groups.push({ key: 'past', label: 'past', items: past.map(toEventItem) });
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

import type { Event } from '@/data/types';
import type { IndexItem } from './IndexView';

/**
 * Local date, not `toISOString()` (UTC): near midnight the grouping would
 * otherwise flip an event between upcoming and past.
 */
export function todayLocalIsoDate() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

/**
 * Events split on today's local date: upcoming soonest first, past most
 * recent first. An event dated today is still upcoming.
 */
export function splitEventsByDate(events: readonly Event[], today = todayLocalIsoDate()) {
  const upcoming = events
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = events
    .filter((event) => event.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));
  return { upcoming, past };
}

/** One event as an index row: its title, then the date and `venue, city`. */
export function toEventItem(event: Event): IndexItem {
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

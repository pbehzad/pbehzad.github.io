import Link from 'next/link';
import type { Event } from '@/data/types';
import { HomePortrait } from './HomePortrait';
import { IndexRow } from './IndexView';
import { splitEventsByDate, toEventItem } from './eventSchedule';

/** How many events the home preview shows. */
const PREVIEW_LIMIT = 3;

type HomeViewProps = {
  name: string;
  /** Published events; empty when they could not be loaded. */
  events: readonly Event[];
};

/**
 * Home: the portrait in its liquid form, and beside it a short preview of
 * events. The preview shows the next few upcoming events; when none are
 * announced it shows the most recent ones under "recent" instead, so the
 * page never shows a schedule it does not have. With no events at all, the
 * portrait stands alone.
 *
 * The name is the page heading for assistive technology only; visually the
 * brand link already carries it.
 */
export function HomeView({ name, events }: HomeViewProps) {
  const { upcoming, past } = splitEventsByDate(events);
  const preview =
    upcoming.length > 0
      ? { label: 'upcoming', events: upcoming.slice(0, PREVIEW_LIMIT) }
      : { label: 'recent', events: past.slice(0, PREVIEW_LIMIT) };

  return (
    <section className="ui-home" aria-labelledby="home-title">
      <h1 id="home-title" className="ui-visually-hidden">
        {name}
      </h1>
      <div className="ui-home__layout">
        <div className="ui-home__portrait">
          <HomePortrait alt={`Portrait of ${name}`} />
        </div>

        {preview.events.length > 0 && (
          <section className="ui-home__events" aria-labelledby="home-events-title">
            <h2 id="home-events-title" className="ui-label">
              {preview.label}
            </h2>
            <ul className="ui-home__events-list">
              {preview.events.map((event) => (
                <li key={event.id}>
                  <IndexRow item={toEventItem(event)} />
                </li>
              ))}
            </ul>
            <Link className="ui-home__more" href="/events">
              all events
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        )}
      </div>
    </section>
  );
}

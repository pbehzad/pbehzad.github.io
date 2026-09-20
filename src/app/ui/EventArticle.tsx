import type { Event } from '@/data/types';
import { ArticleFacts, ArticleLinks, ArticleSection, ArticleView } from './ArticleView';
import type { Fact } from './ArticleView';

type EventArticleProps = {
  event: Event;
};

function toFacts(event: Event): Fact[] {
  return [
    { term: 'program', value: event.program?.trim() ?? '' },
    { term: 'ensemble', value: event.ensemble?.trim() ?? '' },
  ].filter((fact) => fact.value);
}

/** Events adapter: one event as a reading page. */
export function EventArticle({ event }: EventArticleProps) {
  const place = [event.venue, event.city, event.country]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(', ');
  const facts = toFacts(event);
  const description = event.description?.trim();
  const html = event.html_content?.trim();
  const url = event.url?.trim();

  return (
    <ArticleView
      section={{ href: '/events', label: 'events' }}
      title={event.title}
      // The stored ISO date stays as it is: unambiguous, and it aligns in
      // mono, as on the index.
      meta={[event.date, place, event.role]}
    >
      {facts.length > 0 && <ArticleFacts facts={facts} />}

      {description && <p className="ui-article__lede">{description}</p>}

      {html && <div className="ui-prose" dangerouslySetInnerHTML={{ __html: html }} />}

      {url && (
        <ArticleSection title="elsewhere">
          <ArticleLinks links={[{ key: 'event', href: url, label: 'More information' }]} />
        </ArticleSection>
      )}
    </ArticleView>
  );
}

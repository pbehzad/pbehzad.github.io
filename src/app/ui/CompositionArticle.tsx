import type { Composition } from '@/data/types';
import type { CompositionWithContent } from '@/lib/content-manager';
import { getPublicMediaUrl } from '@/lib/media-storage';
import { ArticleFacts, ArticleLinks, ArticleSection, ArticleView } from './ArticleView';
import type { ArticleLink, Fact } from './ArticleView';
import { FormattedText } from './FormattedText';
import { PdfReader } from './PdfReader';

type CompositionArticleProps = {
  composition: CompositionWithContent;
};

// `year` holds a full date such as 2025-06-01; the page shows the year only,
// as the index does.
function toDisplayYear(year: string) {
  return year.match(/^\d{4}/)?.[0] ?? year;
}

function toPremiereFacts(composition: Composition): Fact[] {
  const premiere = composition.premiere;
  if (!premiere) return [];
  return [
    { term: 'date', value: premiere.date?.trim() ?? '' },
    { term: 'place', value: premiere.location?.trim() ?? '' },
    { term: 'performers', value: premiere.performers?.trim() ?? '' },
  ].filter((fact) => fact.value);
}

function toMediaLinks(composition: Composition): ArticleLink[] {
  const links: ArticleLink[] = [];
  const video = composition.video_url?.trim();
  if (video) links.push({ key: 'video', href: video, label: 'Video' });

  const audio = composition.audio_urls?.filter((url) => url.trim()) ?? [];
  audio.forEach((url, index) => {
    links.push({
      key: `audio-${index}`,
      href: getPublicMediaUrl(url),
      label: audio.length > 1 ? `Audio ${index + 1}` : 'Audio',
    });
  });

  return links;
}

/** Works adapter: one composition as a reading page. */
export function CompositionArticle({ composition }: CompositionArticleProps) {
  const premiere = toPremiereFacts(composition);
  const media = toMediaLinks(composition);
  const description = composition.description?.trim();
  const programNotes = composition.program_notes?.trim();
  const html = composition.html_content?.trim();
  const score = composition.score_url?.trim();

  return (
    <ArticleView
      section={{ href: '/compositions', label: 'works' }}
      title={composition.title}
      meta={[
        composition.instruments,
        toDisplayYear(composition.year),
        composition.duration ? `${composition.duration}′` : null,
      ]}
    >
      {premiere.length > 0 && (
        <ArticleSection title="premiere">
          <ArticleFacts facts={premiere} />
        </ArticleSection>
      )}

      {description && (
        <p className="ui-article__lede">
          <FormattedText source={description} />
        </p>
      )}

      {programNotes && (
        <ArticleSection title="program notes">
          <p className="ui-article__text">{programNotes}</p>
        </ArticleSection>
      )}

      {html && <div className="ui-prose" dangerouslySetInnerHTML={{ __html: html }} />}

      {score && <PdfReader pdfUrl={score} title={`${composition.title} score`} />}

      {media.length > 0 && (
        <ArticleSection title="media">
          <ArticleLinks links={media} />
        </ArticleSection>
      )}
    </ArticleView>
  );
}

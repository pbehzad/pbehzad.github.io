import type { Text } from '@/data/types';
import { ArticleLinks, ArticleSection, ArticleView } from './ArticleView';
import { FormattedText } from './FormattedText';
import { PdfReader } from './PdfReader';

type TextArticleProps = {
  text: Text;
  /** The managed body, already resolved from `content_file`. */
  contentHtml: string | null;
};

/** Texts adapter: one text as a reading page. */
export function TextArticle({ text, contentHtml }: TextArticleProps) {
  const description = text.description?.trim();
  const abstract = text.abstract?.trim();
  const body = contentHtml?.trim();
  const pdf = text.pdf_url?.trim();
  const externalUrl = text.external_url?.trim();

  return (
    <ArticleView
      section={{ href: '/texts', label: 'texts' }}
      title={text.title}
      meta={[String(text.year), text.type, text.published_in]}
    >
      {description && (
        <p className="ui-article__lede">
          <FormattedText source={description} />
        </p>
      )}

      {abstract && (
        <ArticleSection title="abstract">
          <p className="ui-article__abstract">{abstract}</p>
        </ArticleSection>
      )}

      {body && <div className="ui-prose" dangerouslySetInnerHTML={{ __html: body }} />}

      {pdf && <PdfReader pdfUrl={pdf} title={text.title} />}

      {externalUrl && (
        <ArticleSection title="elsewhere">
          <ArticleLinks links={[{ key: 'external', href: externalUrl, label: 'Read online' }]} />
        </ArticleSection>
      )}
    </ArticleView>
  );
}

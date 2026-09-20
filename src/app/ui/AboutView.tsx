import type { AboutSection, Profile } from '@/data/types';
import { StatusMessage } from './StatusMessage';

type AboutViewProps = {
  profile: Profile;
  /** Visible sections with any managed link already resolved to a public URL. */
  sections: readonly AboutSection[];
};

/**
 * About: the profile's own prose at a readable measure. Sections keep the
 * disclosure the content model gives them (`initially_open`), so a collapsed
 * section stays collapsed here; `<details>` needs no script.
 */
export function AboutView({ profile, sections }: AboutViewProps) {
  const bio = profile.bio?.trim();
  const tagline = profile.tagline?.trim();
  const specializations = profile.specializations?.filter((item) => item.trim()) ?? [];
  const isEmpty = !bio && sections.length === 0 && !tagline && specializations.length === 0;

  return (
    <section className="ui-page" aria-labelledby="page-title">
      <div className="ui-measure">
        <h1 id="page-title" className="ui-label">
          about
        </h1>
        <div className="ui-page__body">
          {isEmpty && <StatusMessage kind="empty">No profile information is published yet.</StatusMessage>}

          {bio && <p className="ui-page__lede">{bio}</p>}

          {sections.map((section) => (
            <details key={section.id} className="ui-disclosure" open={section.initially_open || undefined}>
              <summary className="ui-disclosure__summary">
                {/* Heading inside `summary` is valid, and it puts the sections
                    in the document's heading outline. */}
                <h2 className="ui-disclosure__title">{section.title}</h2>
              </summary>
              <div className="ui-disclosure__body">
                {section.html_content && (
                  <div className="ui-prose" dangerouslySetInnerHTML={{ __html: section.html_content }} />
                )}
                {section.link_url && (
                  <p>
                    <a
                      className="ui-link"
                      href={section.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {section.link_label || 'Open'}
                      <span className="ui-visually-hidden"> (opens in a new tab)</span>
                    </a>
                  </p>
                )}
              </div>
            </details>
          ))}

          {sections.length === 0 && tagline && <p className="ui-page__note">{tagline}</p>}

          {sections.length === 0 && specializations.length > 0 && (
            <ul className="ui-page__terms" aria-label="Specializations">
              {specializations.map((specialization) => (
                <li key={specialization} className="ui-meta">
                  {specialization}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

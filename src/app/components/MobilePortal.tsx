'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import LiquidPortrait from './LiquidPortrait';
import type { ColumnPortalData } from './PortalTypes';
import type { Event, Text } from '@/data/types';

const AmbientAsciiSpace = dynamic(() => import('./AsciiSpace'), { ssr: false });
const MobileIdentityGlass = dynamic(() => import('./IdentityGlass'), {
  ssr: false,
  loading: () => <MobilePortrait />,
});
const MobileGlassPane = dynamic(() => import('./MobileSectionGlass'), {
  ssr: false,
});

type MobilePortalProps = {
  data: ColumnPortalData;
  initialPath?: string;
};

type SectionId = 'home' | 'works' | 'events' | 'texts' | 'info' | 'contact';

function MobilePortrait() {
  return (
    <LiquidPortrait
      src="/ParhamBehzad-display.jpg"
      alt="Portrait of Parham Behzad"
      priority
      sizes="100vw"
      unoptimized
    />
  );
}

const NAV_ITEMS: { id: Exclude<SectionId, 'home' | 'contact'>; label: string; href: string }[] = [
  { id: 'works', label: 'Works', href: '/compositions' },
  { id: 'events', label: 'Events', href: '/events' },
  { id: 'texts', label: 'Texts', href: '/texts' },
  { id: 'info', label: 'Info', href: '/about' },
];

function getSection(path: string): SectionId {
  const normalized = path === '/' ? path : path.replace(/\/+$/, '');
  if (normalized.startsWith('/compositions')) return 'works';
  if (normalized.startsWith('/events')) return 'events';
  if (normalized.startsWith('/texts')) return 'texts';
  if (normalized.startsWith('/about')) return 'info';
  if (normalized.startsWith('/contact')) return 'contact';
  return 'home';
}

function yearFrom(value: string | number): string {
  return String(value).slice(0, 4);
}

function localIsoDate(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

function formatEventDate(value: string): string {
  const parsed = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

function externalHref(value: string): string {
  if (/^(https?:|mailto:)/i.test(value)) return value;
  return `https://${value}`;
}

function textLink(text: Text): { href?: string; external: boolean } {
  if (text.content_file || text.pdf_url) {
    return { href: `/texts/${text.slug}`, external: false };
  }
  return { href: text.external_url || undefined, external: Boolean(text.external_url) };
}

function IndexNumber({ value }: { value: number }) {
  return (
    <span className="index" aria-hidden="true">
      {String(value + 1).padStart(2, '0')}
    </span>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="sectionHeading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p className="sectionIntro">{description}</p>}
    </header>
  );
}

function WorksView({ data }: { data: ColumnPortalData }) {
  return (
    <section className="section" aria-labelledby="mobile-works-heading">
      <div id="mobile-works-heading">
        <SectionHeading eyebrow="Catalogue" title="Works" description="Compositions, scores and listening." />
      </div>
      {data.compositions.length ? (
        <ol className="list">
          {data.compositions.map((composition, index) => (
            <li key={composition.id}>
              <Link className="row" href={`/compositions/${composition.slug}`}>
                <IndexNumber value={index} />
                <span className="rowBody">
                  <span className="rowTitle">{composition.title}</span>
                  <span className="rowMeta">
                    {[composition.instruments, yearFrom(composition.year)].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span className="rowArrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      ) : (
        <p className="empty">New work will appear here.</p>
      )}
    </section>
  );
}

function EventRows({ events, startIndex = 0 }: { events: Event[]; startIndex?: number }) {
  return (
    <ol className="list">
      {events.map((event, index) => (
        <li key={event.id}>
          <Link className="row" href={`/events/${event.slug}`}>
            <IndexNumber value={startIndex + index} />
            <span className="rowBody">
              <span className="rowTitle">{event.title}</span>
              <span className="rowMeta">{formatEventDate(event.date)}</span>
              {(event.venue || event.city) && (
                <span className="rowMeta">{[event.venue, event.city].filter(Boolean).join(', ')}</span>
              )}
            </span>
            <span className="rowArrow" aria-hidden="true">
              →
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}

function EventsView({ data, currentDate }: { data: ColumnPortalData; currentDate: string }) {
  const today = currentDate;
  const upcoming = data.events
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const past = data.events
    .filter((event) => event.date < today)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <section className="section" aria-labelledby="mobile-events-heading">
      <div id="mobile-events-heading">
        <SectionHeading eyebrow="Calendar" title="Events" description="Performances, gatherings and appearances." />
      </div>
      {!data.events.length && <p className="empty">New dates will appear here.</p>}
      {upcoming.length > 0 && (
        <div className="group">
          <h2>Upcoming</h2>
          <EventRows events={upcoming} />
        </div>
      )}
      {past.length > 0 && (
        <div className="group">
          <h2>Archive</h2>
          <EventRows events={past} startIndex={upcoming.length} />
        </div>
      )}
    </section>
  );
}

function TextsView({ data }: { data: ColumnPortalData }) {
  return (
    <section className="section" aria-labelledby="mobile-texts-heading">
      <div id="mobile-texts-heading">
        <SectionHeading eyebrow="Reading" title="Texts" description="Essays, articles, papers and notes." />
      </div>
      {data.texts.length ? (
        <ol className="list">
          {data.texts.map((text, index) => {
            const link = textLink(text);
            const content = (
              <>
                <IndexNumber value={index} />
                <span className="rowBody">
                  <span className="rowTitle">{text.title}</span>
                  <span className="rowMeta">
                    {text.year} · {text.type}
                  </span>
                </span>
                <span className="rowArrow" aria-hidden="true">
                  {link.external ? '↗' : '→'}
                </span>
              </>
            );

            return (
              <li key={text.id}>
                {link.href ? (
                  link.external ? (
                    <a className="row" href={link.href} target="_blank" rel="noopener noreferrer">
                      {content}
                    </a>
                  ) : (
                    <Link className="row" href={link.href}>
                      {content}
                    </Link>
                  )
                ) : (
                  <div className="row rowStatic">{content}</div>
                )}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="empty">New texts will appear here.</p>
      )}
    </section>
  );
}

function InfoView({ data }: { data: ColumnPortalData }) {
  const profile = data.profile;
  const visibleSections = profile?.about_sections?.filter((section) => section.visible) || [];

  return (
    <section className="section" aria-labelledby="mobile-info-heading">
      <div id="mobile-info-heading">
        <SectionHeading eyebrow="Biography" title="Info" description={profile?.tagline || profile?.subtitle} />
      </div>
      {profile?.bio && <p className="bio">{profile.bio}</p>}

      {visibleSections.length > 0 && (
        <div className="disclosures">
          {visibleSections.map((item) => (
            <details key={item.id} open={item.initially_open || undefined}>
              <summary>{item.title}</summary>
              {item.html_content && (
                <div className="richText" dangerouslySetInnerHTML={{ __html: item.html_content }} />
              )}
              {item.link_url && (
                <a className="detailLink" href={item.link_url} target="_blank" rel="noopener noreferrer">
                  {item.link_label || 'Open'} <span aria-hidden="true">↗</span>
                </a>
              )}
            </details>
          ))}
        </div>
      )}

      {!visibleSections.length && profile?.specializations?.length ? (
        <ul className="tags" aria-label="Specializations">
          {profile.specializations.map((specialization) => (
            <li key={specialization}>{specialization}</li>
          ))}
        </ul>
      ) : null}

      {!profile && <p className="empty">Profile information is coming soon.</p>}
    </section>
  );
}

function ContactView({ data }: { data: ColumnPortalData }) {
  const contact = data.contact;
  const channels = [
    contact?.email
      ? { label: 'Email', value: contact.email, href: `mailto:${contact.email}`, external: false }
      : null,
    contact?.website
      ? { label: 'Website', value: contact.website, href: externalHref(contact.website), external: true }
      : null,
    contact?.github
      ? { label: 'GitHub', value: contact.github, href: externalHref(contact.github), external: true }
      : null,
    contact?.linkedin
      ? { label: 'LinkedIn', value: contact.linkedin, href: externalHref(contact.linkedin), external: true }
      : null,
    contact?.soundcloud
      ? { label: 'SoundCloud', value: contact.soundcloud, href: externalHref(contact.soundcloud), external: true }
      : null,
    contact?.bandcamp
      ? { label: 'Bandcamp', value: contact.bandcamp, href: externalHref(contact.bandcamp), external: true }
      : null,
  ].filter((channel): channel is NonNullable<typeof channel> => channel !== null);

  return (
    <section className="section contactSection" aria-labelledby="mobile-contact-heading">
      <div id="mobile-contact-heading">
        <SectionHeading eyebrow="Get in touch" title="Contact" />
      </div>
      {contact?.availability_status && <p className="availability">{contact.availability_status}</p>}
      {channels.length ? (
        <ul className="list">
          {channels.map((channel) => (
            <li key={channel.label}>
              <a
                className="row contactRow"
                href={channel.href}
                target={channel.external ? '_blank' : undefined}
                rel={channel.external ? 'noopener noreferrer' : undefined}
              >
                <span className="contactLabel">{channel.label}</span>
                <span className="contactValue">{channel.value}</span>
                <span className="rowArrow" aria-hidden="true">
                  {channel.external ? '↗' : '→'}
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty">Contact details are coming soon.</p>
      )}
    </section>
  );
}

function PreviewLink({
  eyebrow,
  title,
  meta,
  href,
}: {
  eyebrow: string;
  title: string;
  meta?: string;
  href: string;
}) {
  return (
    <Link className="preview" href={href}>
      <span className="previewEyebrow">{eyebrow}</span>
      <span className="previewTitle">{title}</span>
      {meta && <span className="previewMeta">{meta}</span>}
      <span className="previewArrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}

function HomeView({ data, currentDate }: { data: ColumnPortalData; currentDate: string }) {
  const profile = data.profile;
  const featuredWork = data.compositions.find((composition) => composition.featured) || data.compositions[0];
  const today = currentDate;
  const nextEvent = [...data.events]
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0];

  return (
    <>
      <section className="cover" aria-labelledby="mobile-home-heading">
        <div className="portraitFrame column-surface">
          <MobileIdentityGlass media={<MobilePortrait />} refractBackground={false} />
          <div className="portraitWash" aria-hidden="true" />
          <div className="coverType">
            <p className="coverRole">{profile?.title || 'Composer'}</p>
            <h1 id="mobile-home-heading">Parham Behzad</h1>
            {(profile?.tagline || profile?.subtitle) && (
              <p className="coverTagline">{profile?.tagline || profile?.subtitle}</p>
            )}
          </div>
          <span className="coverMark" aria-hidden="true">
            PB
          </span>
        </div>
      </section>

      {(featuredWork || nextEvent) && (
        <section className="now" aria-labelledby="mobile-now-heading">
          <MobileGlassPane className="mobile-now-glass" trackScroll />
          <div className="nowHeading">
            <p id="mobile-now-heading">Now</p>
            <span aria-hidden="true">{featuredWork && nextEvent ? '01—02' : '01'}</span>
          </div>
          <div className="previews">
            {featuredWork && (
              <PreviewLink
                eyebrow="Selected work"
                title={featuredWork.title}
                meta={[featuredWork.instruments, yearFrom(featuredWork.year)].filter(Boolean).join(' · ')}
                href={`/compositions/${featuredWork.slug}`}
              />
            )}
            {nextEvent && (
              <PreviewLink
                eyebrow="Next event"
                title={nextEvent.title}
                meta={[formatEventDate(nextEvent.date), nextEvent.city].filter(Boolean).join(' · ')}
                href={`/events/${nextEvent.slug}`}
              />
            )}
          </div>
        </section>
      )}

      <footer className="homeFooter">
        <span>© {currentDate.slice(0, 4)} Parham Behzad</span>
        <Link href="/contact">Contact</Link>
      </footer>
    </>
  );
}

export default function MobilePortal({ data, initialPath = '/' }: MobilePortalProps) {
  const section = getSection(initialPath);
  const [currentDate, setCurrentDate] = useState(() => data.renderedAt.slice(0, 10));

  useEffect(() => {
    const syncDate = () => setCurrentDate(localIsoDate());
    syncDate();
    document.addEventListener('visibilitychange', syncDate);
    return () => document.removeEventListener('visibilitychange', syncDate);
  }, []);

  return (
    <main className="pocket">
      <div className="ambientField">
        <AmbientAsciiSpace mobileMode="ambient" fixedOnMobile />
      </div>
      <div className="ambientScrim" data-view={section === 'home' ? 'cover' : 'reading'} aria-hidden />
      {section !== 'home' && <MobileGlassPane />}

      <header className="topbar">
        <Link className="brand" href="/" aria-label="Parham Behzad, home">
          Parham Behzad
        </Link>
        <Link className="topContact" href="/contact" aria-current={section === 'contact' ? 'page' : undefined}>
          Contact
        </Link>
      </header>

      <div className="content">
        {section === 'home' && <HomeView data={data} currentDate={currentDate} />}
        {section === 'works' && <WorksView data={data} />}
        {section === 'events' && <EventsView data={data} currentDate={currentDate} />}
        {section === 'texts' && <TextsView data={data} />}
        {section === 'info' && <InfoView data={data} />}
        {section === 'contact' && <ContactView data={data} />}
      </div>

      <nav className="bottomNav" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => {
          const active = section === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="navItem"
              data-active={active ? 'true' : undefined}
              aria-current={active ? 'page' : undefined}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <style jsx global>{`
        .pocket {
          --paper: #f1eee6;
          --muted: rgba(241, 238, 230, 0.57);
          --faint: rgba(241, 238, 230, 0.12);
          --surface: #090a09;
          position: relative;
          isolation: isolate;
          min-height: 100vh;
          min-height: 100svh;
          overflow-x: clip;
          background:
            radial-gradient(circle at 86% 2%, rgba(116, 126, 115, 0.12), transparent 31rem),
            var(--surface);
          color: var(--paper);
          font-family: 'JetBrains Mono', monospace !important;
          font-weight: 400;
          padding-bottom: calc(64px + env(safe-area-inset-bottom));
        }

        .pocket a {
          color: inherit;
          border: 0;
          background: transparent;
          text-decoration: none;
        }

        .pocket a:hover {
          color: inherit;
          background: transparent;
        }

        .pocket a:focus-visible,
        .pocket summary:focus-visible {
          outline: 1px solid var(--paper);
          outline-offset: -3px;
          box-shadow: none;
        }

        .pocket .ambientField,
        .pocket .ambientScrim {
          position: fixed;
          inset: 0;
          pointer-events: none;
        }

        .pocket .ambientField {
          z-index: 0;
          overflow: hidden;
          background: #050605;
          contain: strict;
        }

        .pocket .ambientField .ascii-space-host {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .pocket .ambientScrim {
          z-index: 1;
          background:
            linear-gradient(rgba(7, 8, 7, 0.3), rgba(7, 8, 7, 0.3)),
            radial-gradient(circle at 86% 2%, rgba(80, 94, 84, 0.06), transparent 32rem);
        }

        .pocket .ambientScrim[data-view='reading'] {
          background:
            linear-gradient(180deg, rgba(7, 8, 7, 0.3), rgba(7, 8, 7, 0.4)),
            radial-gradient(circle at 50% 0%, rgba(101, 115, 103, 0.04), transparent 34rem);
        }

        .pocket .mobile-section-glass {
          --glass-density: 0.18 !important;
          --glass-tint-alpha: 0.025 !important;
          position: fixed;
          z-index: 2;
          top: calc(52px + env(safe-area-inset-top) + 12px);
          right: max(12px, env(safe-area-inset-right));
          bottom: calc(64px + env(safe-area-inset-bottom) + 12px);
          left: max(12px, env(safe-area-inset-left));
          border-radius: 28px;
          pointer-events: none;
        }

        .pocket .topbar {
          position: sticky;
          z-index: 50;
          top: 0;
          display: flex;
          min-height: calc(52px + env(safe-area-inset-top));
          align-items: flex-end;
          justify-content: space-between;
          padding:
            env(safe-area-inset-top) max(20px, env(safe-area-inset-right)) 0
            max(20px, env(safe-area-inset-left));
          border-bottom: 1px solid var(--faint);
          background: rgba(9, 10, 9, 0.86);
          backdrop-filter: blur(18px) saturate(120%);
          -webkit-backdrop-filter: blur(18px) saturate(120%);
        }

        .pocket .brand,
        .pocket .topContact {
          display: flex;
          min-height: 52px;
          align-items: center;
          font-size: 11px;
          line-height: 1;
          text-transform: uppercase;
        }

        .pocket .brand {
          letter-spacing: 0.16em;
        }

        .pocket .topContact {
          color: var(--muted) !important;
          letter-spacing: 0.12em;
        }

        .pocket .topContact[aria-current='page'] {
          color: var(--paper) !important;
        }

        .pocket .content {
          position: relative;
          z-index: 3;
          width: 100%;
        }

        .pocket .cover {
          padding:
            12px max(12px, env(safe-area-inset-right)) 12px
            max(12px, env(safe-area-inset-left));
        }

        .pocket .portraitFrame {
          position: relative;
          min-height: min(690px, calc(100svh - 140px));
          aspect-ratio: 3 / 4;
          overflow: hidden;
          background: #161815;
        }

        .pocket .portraitFrame .identity-portrait {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        .pocket .portraitFrame img {
          filter: grayscale(0.18) contrast(1.06) brightness(0.88);
        }

        .pocket .portraitWash {
          position: absolute;
          z-index: 1;
          inset: 0;
          border: 1px solid rgba(241, 238, 230, 0.13);
          background:
            linear-gradient(180deg, rgba(6, 7, 6, 0.06) 28%, rgba(6, 7, 6, 0.18) 58%, rgba(6, 7, 6, 0.88) 100%),
            linear-gradient(105deg, rgba(8, 9, 8, 0.3), transparent 48%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12);
          pointer-events: none;
        }

        .pocket .coverType {
          position: absolute;
          z-index: 2;
          right: 20px;
          bottom: 22px;
          left: 20px;
        }

        .pocket .coverRole {
          margin-bottom: 10px;
          color: rgba(241, 238, 230, 0.7);
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.2em;
          line-height: 1.3;
          text-transform: uppercase;
        }

        .pocket .coverType h1,
        .pocket .sectionHeading h1 {
          margin: 0;
          color: var(--paper);
          font-family: 'Major Mono Display', monospace !important;
          font-weight: 400;
          letter-spacing: -0.055em;
          text-transform: lowercase;
        }

        .pocket .coverType h1 {
          max-width: 11ch;
          font-size: clamp(39px, 12.5vw, 64px);
          line-height: 0.95;
        }

        .pocket .coverTagline {
          max-width: 34rem;
          margin-top: 16px;
          color: rgba(241, 238, 230, 0.72);
          font-size: 12px;
          font-weight: 300;
          line-height: 1.55;
        }

        .pocket .coverMark {
          position: absolute;
          z-index: 2;
          top: 18px;
          right: 17px;
          display: grid;
          width: 34px;
          height: 34px;
          place-items: center;
          border: 1px solid rgba(241, 238, 230, 0.42);
          border-radius: 50%;
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.08em;
        }

        .pocket .now {
          position: relative;
          padding:
            54px max(20px, env(safe-area-inset-right)) 28px
            max(20px, env(safe-area-inset-left));
        }

        .pocket .mobile-now-glass {
          --glass-density: 0.18 !important;
          --glass-tint-alpha: 0.025 !important;
          position: absolute;
          z-index: 0;
          top: 24px;
          right: max(12px, env(safe-area-inset-right));
          bottom: 10px;
          left: max(12px, env(safe-area-inset-left));
          border-radius: 28px;
          pointer-events: none;
        }

        .pocket .now > :not(.mobile-now-glass) {
          position: relative;
          z-index: 1;
        }

        .pocket .nowHeading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
          color: var(--muted);
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.18em;
          line-height: 1;
          text-transform: uppercase;
        }

        .pocket .previews {
          border-top: 1px solid rgba(241, 238, 230, 0.28);
        }

        .pocket .preview {
          position: relative;
          display: flex;
          min-height: 132px;
          flex-direction: column;
          justify-content: center;
          padding: 22px 38px 22px 0;
          border-bottom: 1px solid var(--faint) !important;
        }

        .pocket .previewEyebrow,
        .pocket .previewMeta {
          color: var(--muted);
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.1em;
          line-height: 1.45;
          text-transform: uppercase;
        }

        .pocket .previewTitle {
          margin: 7px 0;
          font-size: clamp(18px, 5.5vw, 25px);
          font-weight: 300;
          letter-spacing: -0.035em;
          line-height: 1.2;
        }

        .pocket .previewArrow {
          position: absolute;
          right: 0;
          font-size: 17px;
          font-weight: 300;
        }

        .pocket .homeFooter {
          display: flex;
          justify-content: space-between;
          padding:
            48px max(20px, env(safe-area-inset-right)) 30px
            max(20px, env(safe-area-inset-left));
          color: var(--muted);
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.08em;
          line-height: 1.4;
          text-transform: uppercase;
        }

        .pocket .homeFooter a {
          padding-bottom: 2px;
          border-bottom: 1px solid rgba(241, 238, 230, 0.35);
        }

        .pocket .section {
          width: 100%;
          max-width: 52rem;
          min-height: calc(100svh - 116px - env(safe-area-inset-top) - env(safe-area-inset-bottom));
          margin: 0 auto;
          padding:
            52px max(20px, env(safe-area-inset-right)) 48px
            max(20px, env(safe-area-inset-left));
        }

        .pocket .sectionHeading {
          padding-bottom: 40px;
          border-bottom: 1px solid rgba(241, 238, 230, 0.28);
        }

        .pocket .eyebrow {
          margin-bottom: 16px;
          color: var(--muted);
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.2em;
          line-height: 1;
          text-transform: uppercase;
        }

        .pocket .sectionHeading h1 {
          font-size: clamp(42px, 14vw, 76px);
          line-height: 0.9;
        }

        .pocket .sectionIntro {
          max-width: 38rem;
          margin-top: 20px;
          color: var(--muted);
          font-size: 12px;
          font-weight: 300;
          line-height: 1.6;
        }

        .pocket .list {
          list-style: none;
        }

        .pocket .row {
          display: grid;
          min-height: 86px;
          grid-template-columns: 34px minmax(0, 1fr) 24px;
          align-items: center;
          gap: 5px;
          border-bottom: 1px solid var(--faint) !important;
        }

        .pocket .index {
          align-self: start;
          padding-top: 27px;
          color: rgba(241, 238, 230, 0.4);
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.06em;
          line-height: 1;
        }

        .pocket .rowBody {
          display: flex;
          min-width: 0;
          flex-direction: column;
          padding: 20px 0;
        }

        .pocket .rowTitle {
          overflow-wrap: anywhere;
          font-size: 17px;
          font-weight: 300;
          letter-spacing: -0.025em;
          line-height: 1.32;
        }

        .pocket .rowMeta {
          margin-top: 5px;
          overflow-wrap: anywhere;
          color: var(--muted);
          font-size: 10px;
          font-weight: 300;
          letter-spacing: 0.025em;
          line-height: 1.45;
        }

        .pocket .rowArrow {
          justify-self: end;
          color: rgba(241, 238, 230, 0.62);
          font-size: 16px;
          font-weight: 300;
        }

        .pocket .rowStatic {
          opacity: 0.62;
        }

        .pocket .empty {
          padding: 28px 0;
          color: var(--muted);
          font-size: 12px;
          font-weight: 300;
          line-height: 1.6;
        }

        .pocket .group {
          margin-top: 34px;
        }

        .pocket .group + .group {
          margin-top: 52px;
        }

        .pocket .group h2 {
          margin: 0 0 8px;
          color: var(--muted);
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.18em;
          line-height: 1;
          text-transform: uppercase;
        }

        .pocket .bio {
          padding: 32px 0 36px;
          border-bottom: 1px solid var(--faint);
          color: rgba(241, 238, 230, 0.84);
          font-size: 14px;
          font-weight: 300;
          line-height: 1.75;
          white-space: pre-line;
        }

        .pocket .disclosures details {
          border-bottom: 1px solid var(--faint);
        }

        .pocket .disclosures summary {
          display: flex;
          min-height: 64px;
          cursor: pointer;
          list-style: none;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.1em;
          line-height: 1.4;
          text-transform: uppercase;
        }

        .pocket .disclosures summary::-webkit-details-marker {
          display: none;
        }

        .pocket .disclosures summary::after {
          content: '+';
          color: var(--muted);
          font-size: 16px;
          font-weight: 300;
        }

        .pocket .disclosures details[open] summary::after {
          content: '−';
        }

        .pocket .richText {
          padding: 0 0 24px;
          color: rgba(241, 238, 230, 0.72);
          font-size: 13px;
          font-weight: 300;
          line-height: 1.75;
        }

        .pocket .richText * + * {
          margin-top: 0.9em;
        }

        .pocket .richText a {
          border-bottom: 1px solid rgba(241, 238, 230, 0.35);
        }

        .pocket .richText ul,
        .pocket .richText ol {
          padding-left: 1.35rem;
        }

        .pocket .detailLink {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
          border-bottom: 1px solid rgba(241, 238, 230, 0.35) !important;
          color: var(--muted) !important;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .pocket .tags {
          display: flex;
          list-style: none;
          flex-wrap: wrap;
          gap: 8px;
          padding-top: 28px;
        }

        .pocket .tags li {
          padding: 9px 11px;
          border: 1px solid var(--faint);
          color: var(--muted);
          font-size: 10px;
          font-weight: 300;
          line-height: 1.25;
        }

        .pocket .contactSection {
          display: flex;
          flex-direction: column;
        }

        .pocket .availability {
          max-width: 32rem;
          padding: 30px 0;
          color: rgba(241, 238, 230, 0.82);
          font-size: 14px;
          font-weight: 300;
          line-height: 1.65;
        }

        .pocket .contactRow {
          grid-template-columns: 82px minmax(0, 1fr) 24px;
        }

        .pocket .contactLabel {
          color: var(--muted);
          font-size: 9px;
          font-weight: 400;
          letter-spacing: 0.08em;
          line-height: 1.3;
          text-transform: uppercase;
        }

        .pocket .contactValue {
          overflow-wrap: anywhere;
          font-size: 13px;
          font-weight: 300;
          line-height: 1.4;
        }

        .pocket .bottomNav {
          position: fixed;
          z-index: 60;
          right: 0;
          bottom: 0;
          left: 0;
          display: grid;
          min-height: calc(64px + env(safe-area-inset-bottom));
          grid-template-columns: repeat(4, minmax(0, 1fr));
          padding:
            0 env(safe-area-inset-right) env(safe-area-inset-bottom)
            env(safe-area-inset-left);
          border-top: 1px solid rgba(241, 238, 230, 0.16);
          background: rgba(9, 10, 9, 0.93);
          backdrop-filter: blur(20px) saturate(120%);
          -webkit-backdrop-filter: blur(20px) saturate(120%);
        }

        .pocket .navItem {
          position: relative;
          display: flex;
          min-width: 0;
          min-height: 64px;
          align-items: center;
          justify-content: center;
          color: rgba(241, 238, 230, 0.48) !important;
          font-size: 10px;
          font-weight: 400;
          letter-spacing: 0.06em;
          line-height: 1;
          text-transform: uppercase;
        }

        .pocket .navItem[data-active='true'] {
          color: var(--paper) !important;
        }

        .pocket .navItem[data-active='true']::before {
          position: absolute;
          top: -1px;
          right: 25%;
          left: 25%;
          height: 1px;
          background: var(--paper);
          content: '';
        }

        @media (min-width: 560px) {
          .pocket .cover {
            padding:
              20px max(20px, env(safe-area-inset-right)) 20px
              max(20px, env(safe-area-inset-left));
          }

          .pocket .portraitFrame {
            max-width: 36rem;
            min-height: 640px;
            margin: 0 auto;
          }

          .pocket .now,
          .pocket .homeFooter {
            max-width: 36rem;
            margin-right: auto;
            margin-left: auto;
          }
        }

        @media (max-height: 600px) and (orientation: landscape) {
          .pocket {
            padding-bottom: calc(52px + env(safe-area-inset-bottom));
          }

          .pocket .cover {
            padding-top: 10px;
            padding-bottom: 10px;
          }

          .pocket .portraitFrame {
            width: 100%;
            max-width: none;
            height: calc(100svh - 124px);
            min-height: 240px;
            aspect-ratio: auto;
          }

          .pocket .portraitFrame img {
            object-position: center 30%;
          }

          .pocket .coverType {
            right: 18px;
            bottom: 16px;
            left: 18px;
          }

          .pocket .coverType h1 {
            max-width: 10ch;
            font-size: clamp(30px, 6vw, 48px);
          }

          .pocket .coverRole {
            margin-bottom: 6px;
          }

          .pocket .coverTagline {
            display: none;
          }

          .pocket .section {
            padding-top: 32px;
          }

          .pocket .sectionHeading {
            padding-bottom: 24px;
          }

          .pocket .sectionHeading h1 {
            font-size: 48px;
          }

          .pocket .bottomNav {
            min-height: calc(52px + env(safe-area-inset-bottom));
          }

          .pocket .mobile-section-glass {
            bottom: calc(52px + env(safe-area-inset-bottom) + 10px);
          }

          .pocket .navItem {
            min-height: 52px;
          }
        }

        @media (prefers-reduced-motion: no-preference) {
          .pocket .row,
          .pocket .preview,
          .pocket .navItem {
            transition:
              color 160ms ease,
              opacity 160ms ease,
              background 160ms ease;
          }

          .pocket .row:active,
          .pocket .preview:active {
            opacity: 0.65;
          }
        }
      `}</style>
    </main>
  );
}

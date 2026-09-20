import type { ContactInfo } from '@/data/types';
import { StatusMessage } from './StatusMessage';

type ContactViewProps = {
  contact: ContactInfo | null;
  hasError: boolean;
};

type Channel = {
  label: string;
  value: string;
  href: string;
  external: boolean;
};

/** A stored value may omit its scheme; the href restores one, the display does not. */
function toExternalHref(value: string) {
  if (/^https?:/i.test(value)) return value;
  return `https://${value}`;
}

function toChannels(contact: ContactInfo): Channel[] {
  const entries: readonly (readonly [string, string | null | undefined])[] = [
    ['email', contact.email],
    ['website', contact.website],
    ['github', contact.github],
    ['linkedin', contact.linkedin],
    ['soundcloud', contact.soundcloud],
    ['bandcamp', contact.bandcamp],
  ];

  return entries.flatMap(([label, raw]) => {
    const value = raw?.trim();
    if (!value) return [];
    const isEmail = label === 'email';
    return [
      {
        label,
        value,
        href: isEmail ? `mailto:${value}` : toExternalHref(value),
        external: !isEmail,
      },
    ];
  });
}

/**
 * Contact: the stored channels as links, one per line. The label sits inside
 * the link, so the accessible name is "email <address>" and the row keeps one
 * focus ring.
 */
export function ContactView({ contact, hasError }: ContactViewProps) {
  const channels = contact ? toChannels(contact) : [];
  const availability = contact?.availability_status?.trim();

  return (
    <section className="ui-page" aria-labelledby="page-title">
      <div className="ui-index-column">
        <h1 id="page-title" className="ui-label">
          contact
        </h1>
        <div className="ui-page__body">
          {hasError ? (
            <StatusMessage kind="error">Contact details could not be loaded.</StatusMessage>
          ) : channels.length === 0 ? (
            <StatusMessage kind="empty">No contact details are published yet.</StatusMessage>
          ) : (
            <ul className="ui-channels">
              {channels.map((channel) => (
                <li key={channel.label}>
                  <a
                    className="ui-channel"
                    href={channel.href}
                    target={channel.external ? '_blank' : undefined}
                    rel={channel.external ? 'noopener noreferrer' : undefined}
                  >
                    <span className="ui-channel__label">{channel.label}</span>
                    <span className="ui-channel__value">{channel.value}</span>
                    {channel.external && <span className="ui-visually-hidden"> (opens in a new tab)</span>}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {!hasError && availability && <p className="ui-page__note">{availability}</p>}
        </div>
      </div>
    </section>
  );
}

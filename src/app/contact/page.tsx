import type { Metadata } from 'next';
import type { ContactInfo } from '@/data/types';
import { getContactInfo, getProfile } from '@/services/contentService';
import { SiteShell } from '../ui/SiteShell';
import { ContactView } from '../ui/ContactView';

export const metadata: Metadata = {
  title: 'Contact — Parham Behzad',
  description: 'Get in touch with composer Parham Behzad.',
};

// `getContactInfo` throws when contact.json is missing or fails validation.
// The page still has the profile, so it renders the shell and says so.
async function readContact(): Promise<{ contact: ContactInfo | null; hasError: boolean }> {
  try {
    const { data, error } = await getContactInfo();
    return { contact: data, hasError: Boolean(error) };
  } catch {
    return { contact: null, hasError: true };
  }
}

export default async function ContactPage() {
  const [{ data: profile }, { contact, hasError }] = await Promise.all([
    getProfile(),
    readContact(),
  ]);

  return (
    <SiteShell brandName={profile.name}>
      <ContactView contact={contact} hasError={hasError} />
    </SiteShell>
  );
}

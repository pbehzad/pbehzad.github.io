import type { Metadata } from 'next';
import { getProfile } from '@/services/contentService';
import { getPublicMediaUrl } from '@/lib/media-storage';
import { SiteShell } from '../ui/SiteShell';
import { AboutView } from '../ui/AboutView';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const { data: profile } = await getProfile();
    const bio = profile?.bio ?? '';
    const snippet = bio.slice(0, 160).replace(/\n/g, ' ').trim();
    return {
      title: 'About — Parham Behzad',
      description: snippet || 'Parham Behzad is a composer exploring emergent musical systems, ecological sound practices, and participatory performance.',
    };
  } catch {
    return {
      title: 'About — Parham Behzad',
      description: 'Parham Behzad is a composer exploring emergent musical systems, ecological sound practices, and participatory performance.',
    };
  }
}

export default async function AboutPage() {
  const { data: profile } = await getProfile();

  const sections = (profile.about_sections ?? [])
    .filter((section) => section.visible)
    .map((section) => ({
      ...section,
      link_url: section.link_url ? getPublicMediaUrl(section.link_url) : section.link_url,
    }));

  return (
    <SiteShell brandName={profile.name}>
      <AboutView profile={profile} sections={sections} />
    </SiteShell>
  );
}

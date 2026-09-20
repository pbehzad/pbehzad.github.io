import type { Metadata } from 'next';
import { getAllTexts, getProfile } from '@/services/contentService';
import { SiteShell } from '../ui/SiteShell';
import { TextsIndex } from '../ui/TextsIndex';

export const metadata: Metadata = {
  title: 'Texts — Parham Behzad',
  description: 'Texts and essays by Parham Behzad on music, aesthetics, notation, and composition.',
};

export default async function TextsPage() {
  const [{ data: profile }, { data: texts, error }] = await Promise.all([
    getProfile(),
    getAllTexts(),
  ]);

  return (
    <SiteShell brandName={profile.name}>
      <TextsIndex texts={texts} hasError={Boolean(error)} />
    </SiteShell>
  );
}

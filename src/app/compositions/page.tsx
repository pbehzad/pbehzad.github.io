import type { Metadata } from 'next';
import { getAllCompositions, getProfile } from '@/services/contentService';
import { SiteShell } from '../ui/SiteShell';
import { WorksIndex } from '../ui/WorksIndex';

export const metadata: Metadata = {
  title: 'Compositions — Parham Behzad',
  description: 'Works and compositions by Parham Behzad — composer exploring emergent musical systems, ecological sound practices, and participatory performance.',
};

export default async function CompositionsPage() {
  const [{ data: profile }, { data: compositions, error }] = await Promise.all([
    getProfile(),
    getAllCompositions(),
  ]);

  return (
    <SiteShell brandName={profile.name}>
      <WorksIndex compositions={compositions} hasError={Boolean(error)} />
    </SiteShell>
  );
}

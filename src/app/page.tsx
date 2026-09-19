import { getProfile } from '@/services/contentService';
import { HomeView } from './ui/HomeView';
import { SiteShell } from './ui/SiteShell';

export default async function Home() {
  const { data: profile } = await getProfile();

  return (
    <SiteShell brandName={profile.name} isHome>
      <HomeView name={profile.name} />
    </SiteShell>
  );
}

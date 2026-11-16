import { getAllEvents, getProfile } from '@/services/contentService';
import { HomeView } from './ui/HomeView';
import { SiteShell } from './ui/SiteShell';

export default async function Home() {
  const [{ data: profile }, { data: events, error: eventsError }] = await Promise.all([
    getProfile(),
    getAllEvents(),
  ]);

  // The events preview is secondary: if events cannot be loaded, the home
  // page still renders, with the portrait alone.
  return (
    <SiteShell brandName={profile.name} isHome>
      <HomeView name={profile.name} events={eventsError ? [] : events} />
    </SiteShell>
  );
}

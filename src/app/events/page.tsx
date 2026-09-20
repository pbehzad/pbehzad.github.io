import type { Metadata } from 'next';
import { getAllEvents, getProfile } from '@/services/contentService';
import { SiteShell } from '../ui/SiteShell';
import { EventsIndex } from '../ui/EventsIndex';

export const metadata: Metadata = {
  title: 'Events — Parham Behzad',
  description: 'Upcoming and past performances and events featuring music by Parham Behzad.',
};

export default async function EventsPage() {
  const [{ data: profile }, { data: events, error }] = await Promise.all([
    getProfile(),
    getAllEvents(),
  ]);

  return (
    <SiteShell brandName={profile.name}>
      <EventsIndex events={events} hasError={Boolean(error)} />
    </SiteShell>
  );
}

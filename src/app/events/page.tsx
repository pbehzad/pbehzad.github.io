import React from 'react';
import type { Metadata } from 'next';
import Portal from '../components/Portal';
import { getAllEvents } from '@/services/contentService';

export const metadata: Metadata = {
  title: 'Events — Parham Behzad',
  description: 'Upcoming and past performances and events featuring music by Parham Behzad.',
};

export default async function EventsPage() {
  let events: { title: string; date: string; venue: string; city: string }[] = [];

  try {
    const { data } = await getAllEvents();
    events = data.map(e => ({ title: e.title, date: e.date, venue: e.venue, city: e.city }));
  } catch {
    // fall through
  }

  return (
    <>
      {/* SSR content for search engines — visually hidden but indexable */}
      <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
        <h1>Events — Parham Behzad</h1>
        {events.map((e, i) => (
          <p key={i}>{e.title} — {e.date}, {e.venue}, {e.city}</p>
        ))}
      </div>
      <Portal />
    </>
  );
}

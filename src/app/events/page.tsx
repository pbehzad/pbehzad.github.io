import React from 'react';
import type { Metadata } from 'next';
import ColumnPortalData from '../components/ColumnPortalData';

export const metadata: Metadata = {
  title: 'Events — Parham Behzad',
  description: 'Upcoming and past performances and events featuring music by Parham Behzad.',
};

export default async function EventsPage() {
  return <ColumnPortalData initialPath="/events" />;
}

import React from 'react';
import type { Metadata } from 'next';
import ColumnPortalData from '../components/ColumnPortalData';
import { getProfile } from '@/services/contentService';

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
  return <ColumnPortalData initialPath="/about" />;
}

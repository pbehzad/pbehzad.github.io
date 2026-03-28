import React from 'react';
import type { Metadata } from 'next';
import Portal from '../components/Portal';
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
  let bio = '';
  let htmlContent = '';

  try {
    const { data: profile } = await getProfile();
    bio = profile?.bio ?? '';
    htmlContent = profile?.html_content ?? '';
  } catch {
    // silently fall through — Portal handles the visible UI
  }

  return (
    <>
      {/* SSR content for search engines — visually hidden but indexable */}
      <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
        <h1>About Parham Behzad</h1>
        {bio && <p>{bio}</p>}
        {htmlContent && <div dangerouslySetInnerHTML={{ __html: htmlContent }} />}
      </div>
      <Portal />
    </>
  );
}

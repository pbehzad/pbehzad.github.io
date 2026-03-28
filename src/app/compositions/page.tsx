import React from 'react';
import type { Metadata } from 'next';
import Portal from '../components/Portal';
import { getAllCompositions } from '@/services/contentService';

export const metadata: Metadata = {
  title: 'Compositions — Parham Behzad',
  description: 'Works and compositions by Parham Behzad — composer exploring emergent musical systems, ecological sound practices, and participatory performance.',
};

export default async function CompositionsPage() {
  let compositions: { title: string; year: string; instruments: string }[] = [];

  try {
    const { data } = await getAllCompositions();
    compositions = data.map(c => ({ title: c.title, year: c.year, instruments: c.instruments }));
  } catch {
    // fall through
  }

  return (
    <>
      {/* SSR content for search engines — visually hidden but indexable */}
      <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
        <h1>Compositions by Parham Behzad</h1>
        {compositions.map((c, i) => (
          <p key={i}>{c.title} ({c.year}) — {c.instruments}</p>
        ))}
      </div>
      <Portal />
    </>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import Portal from '../components/Portal';
import { getContactInfo } from '@/services/contentService';

export const metadata: Metadata = {
  title: 'Contact — Parham Behzad',
  description: 'Get in touch with composer Parham Behzad.',
};

export default async function ContactPage() {
  let email = '';

  try {
    const { data } = await getContactInfo();
    email = data?.email ?? '';
  } catch {
    // fall through
  }

  return (
    <>
      {/* SSR content for search engines — visually hidden but indexable */}
      <div style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}>
        <h1>Contact Parham Behzad</h1>
        {email && <p>Email: {email}</p>}
      </div>
      <Portal />
    </>
  );
}

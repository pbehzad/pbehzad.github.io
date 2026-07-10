import React from 'react';
import type { Metadata } from 'next';
import ColumnPortalData from '../components/ColumnPortalData';

export const metadata: Metadata = {
  title: 'Contact — Parham Behzad',
  description: 'Get in touch with composer Parham Behzad.',
};

export default async function ContactPage() {
  return <ColumnPortalData initialPath="/contact" />;
}

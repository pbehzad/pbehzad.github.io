import React from 'react';
import type { Metadata } from 'next';
import ColumnPortalData from '../components/ColumnPortalData';

export const metadata: Metadata = {
  title: 'Compositions — Parham Behzad',
  description: 'Works and compositions by Parham Behzad — composer exploring emergent musical systems, ecological sound practices, and participatory performance.',
};

export default async function CompositionsPage() {
  return <ColumnPortalData initialPath="/compositions" />;
}

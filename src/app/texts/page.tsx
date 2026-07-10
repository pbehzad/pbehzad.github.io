import type { Metadata } from 'next';
import ColumnPortalData from '../components/ColumnPortalData';

export const metadata: Metadata = {
  title: 'Texts - Parham Behzad',
  description: 'Texts and essays by Parham Behzad on music, aesthetics, notation, and composition.',
};

export default async function TextsPage() {
  return <ColumnPortalData initialPath="/texts" />;
}

'use client';

import { useParams } from 'next/navigation';
import ToolEditor from '../ToolEditor';

export default function EditToolPage() {
  const params = useParams();
  return <ToolEditor id={params.id as string} />;
}

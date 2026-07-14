import ColumnPortal, { type ColumnPortalData as ColumnPortalDataShape } from './ColumnPortal';
import {
  getAllCompositions,
  getAllEvents,
  getAllTexts,
  getContactInfo,
  getProfile,
} from '@/services/contentService';
import { getPublicMediaUrl } from '@/lib/media-storage';

async function readContent<T>(reader: () => Promise<{ data: T }>, fallback: T): Promise<T> {
  try {
    const result = await reader();
    return result.data ?? fallback;
  } catch {
    return fallback;
  }
}

export default async function ColumnPortalData({ initialPath = '/' }: { initialPath?: string }) {
  const [compositions, events, texts, profile, contact] = await Promise.all([
    readContent(() => getAllCompositions(), []),
    readContent(() => getAllEvents(), []),
    readContent(() => getAllTexts(), []),
    readContent(() => getProfile(), null),
    readContent(() => getContactInfo(), null),
  ]);

  const data: ColumnPortalDataShape = {
    compositions,
    events,
    texts: texts.map((text) => ({
      ...text,
      pdf_url: text.pdf_url ? getPublicMediaUrl(text.pdf_url) : text.pdf_url,
    })),
    profile: profile ? {
      ...profile,
      about_sections: profile.about_sections?.map((section) => ({
        ...section,
        link_url: section.link_url ? getPublicMediaUrl(section.link_url) : section.link_url,
      })),
    } : null,
    contact,
  };

  return <ColumnPortal data={data} initialPath={initialPath} />;
}

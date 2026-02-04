import { getStorageAdapter } from './storage-adapter';
import { getHtmlContent, saveHtmlContent, deleteHtmlContent } from './html-content-manager';
import { compositionsArraySchema } from '@/data/schemas';
import type { Composition } from '@/data/types';

const COMPOSITIONS_FILE = 'compositions.json';

// --- Internal helpers ---

async function readCompositionsJson(): Promise<{ data: Composition[]; sha?: string }> {
  const adapter = getStorageAdapter();
  const file = await adapter.readFile(COMPOSITIONS_FILE);
  if (!file) return { data: [], sha: undefined };
  const parsed = JSON.parse(file.content);
  return { data: parsed as Composition[], sha: file.sha };
}

async function writeCompositionsJson(data: Composition[], sha?: string): Promise<void> {
  const validated = compositionsArraySchema.parse(data);
  const adapter = getStorageAdapter();
  const content = JSON.stringify(validated, null, 2);
  await adapter.writeFile(COMPOSITIONS_FILE, content, sha);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// --- Public API ---

export async function getAllCompositions(): Promise<Composition[]> {
  const { data } = await readCompositionsJson();
  return data
    .filter(c => c.status === 'published')
    .sort((a, b) => b.year.localeCompare(a.year));
}

export async function getAllCompositionsRaw(): Promise<Composition[]> {
  const { data } = await readCompositionsJson();
  return data;
}

export interface CompositionWithContent extends Composition {
  html_content?: string;
}

export async function getCompositionBySlug(slug: string): Promise<CompositionWithContent | null> {
  const { data } = await readCompositionsJson();
  const item = data.find(c => c.slug === slug);
  if (!item) return null;
  const html = await getHtmlContent(item.id);
  return { ...item, html_content: html ?? undefined };
}

export async function getCompositionById(id: string): Promise<CompositionWithContent | null> {
  const { data } = await readCompositionsJson();
  const item = data.find(c => c.id === id);
  if (!item) return null;
  const html = await getHtmlContent(item.id);
  return { ...item, html_content: html ?? undefined };
}

export async function addComposition(
  body: Record<string, unknown>,
  htmlContent?: string
): Promise<Composition> {
  const { data, sha } = await readCompositionsJson();

  const now = new Date().toISOString();
  const slug = generateSlug(body.title as string);

  const newItem: Composition = {
    id: slug,
    slug,
    title: body.title as string,
    year: body.year as string,
    instruments: body.instruments as string,
    duration: (body.duration as string) || null,
    description: (body.description as string) || null,
    program_notes: (body.program_notes as string) || null,
    score_url: (body.score_url as string) || null,
    audio_urls: (body.audio_urls as string[]) || [],
    video_url: (body.video_url as string) || null,
    tags: (body.tags as string[]) || [],
    featured: (body.featured as boolean) || false,
    status: (body.status as 'draft' | 'published') || 'draft',
    premiere: (body.premiere as Composition['premiere']) || null,
    related_texts: (body.related_texts as string[]) || [],
    created_at: now,
    updated_at: now,
  };

  const updated = [...data, newItem];
  await writeCompositionsJson(updated, sha);

  if (htmlContent) {
    await saveHtmlContent(newItem.id, htmlContent);
  }

  return newItem;
}

export async function updateComposition(
  id: string,
  body: Record<string, unknown>,
  htmlContent?: string
): Promise<Composition | null> {
  const { data, sha } = await readCompositionsJson();

  const index = data.findIndex(c => c.id === id);
  if (index === -1) return null;

  // Remove html_content from body so it doesn't go into JSON
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { html_content: _html, ...jsonFields } = body;

  data[index] = {
    ...data[index],
    ...jsonFields,
    updated_at: new Date().toISOString(),
  } as Composition;

  await writeCompositionsJson(data, sha);

  if (htmlContent !== undefined) {
    if (htmlContent) {
      await saveHtmlContent(id, htmlContent);
    } else {
      await deleteHtmlContent(id);
    }
  }

  return data[index];
}

export async function deleteComposition(id: string): Promise<boolean> {
  const { data, sha } = await readCompositionsJson();

  const filtered = data.filter(c => c.id !== id);
  if (filtered.length === data.length) return false;

  await writeCompositionsJson(filtered, sha);

  try {
    await deleteHtmlContent(id);
  } catch {
    // HTML file may not exist, that's fine
  }

  return true;
}

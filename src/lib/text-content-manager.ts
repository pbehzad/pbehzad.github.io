import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { getStorageAdapter } from './storage-adapter';

const TEXTS_BASE_PATH = 'content/texts';

// Markdown for texts lives in the content repo (content/texts/*.md, per the
// text's `content_file` field) and is read through the storage adapter —
// NOT src/lib/markdown.ts, which points at the removed src/data/content dir.
export async function getTextHtml(contentFile: string): Promise<string | null> {
  const adapter = getStorageAdapter();
  const file = await adapter.readFile(`${TEXTS_BASE_PATH}/${contentFile}`);
  if (!file?.content) return null;

  const { content } = matter(file.content);
  const processed = await remark().use(html).process(content);
  return processed.toString();
}

// raw markdown source, for the admin editor
export async function getTextMarkdown(contentFile: string): Promise<string | null> {
  const adapter = getStorageAdapter();
  const file = await adapter.readFile(`${TEXTS_BASE_PATH}/${contentFile}`);
  return file?.content ?? null;
}

export async function saveTextMarkdown(contentFile: string, markdown: string): Promise<void> {
  const adapter = getStorageAdapter();
  const existing = await adapter.readFile(`${TEXTS_BASE_PATH}/${contentFile}`);
  await adapter.writeFile(`${TEXTS_BASE_PATH}/${contentFile}`, markdown, existing?.sha);
}

export async function deleteTextMarkdown(contentFile: string): Promise<void> {
  const adapter = getStorageAdapter();
  const existing = await adapter.readFile(`${TEXTS_BASE_PATH}/${contentFile}`);
  if (existing) {
    await adapter.deleteFile(`${TEXTS_BASE_PATH}/${contentFile}`, existing.sha);
  }
}

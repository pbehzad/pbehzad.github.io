import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import { getStorageAdapter } from './storage-adapter';

const TEXTS_BASE_PATH = 'content/texts';

// Text bodies live in the content repo under content/texts. New and edited
// entries are stored as HTML. Legacy Markdown is still rendered and is
// transparently migrated to HTML the next time the entry is saved.
export async function getTextHtml(contentFile: string): Promise<string | null> {
  const adapter = getStorageAdapter();
  const file = await adapter.readFile(`${TEXTS_BASE_PATH}/${contentFile}`);
  if (!file?.content) return null;

  if (contentFile.toLowerCase().endsWith('.html')) return file.content;

  const { content } = matter(file.content);
  return (await remark().use(html).process(content)).toString();
}

export async function saveTextHtml(contentFile: string, htmlContent: string): Promise<void> {
  const adapter = getStorageAdapter();
  const existing = await adapter.readFile(`${TEXTS_BASE_PATH}/${contentFile}`);
  await adapter.writeFile(`${TEXTS_BASE_PATH}/${contentFile}`, htmlContent, existing?.sha);
}

export async function deleteTextContent(contentFile: string): Promise<void> {
  const adapter = getStorageAdapter();
  const existing = await adapter.readFile(`${TEXTS_BASE_PATH}/${contentFile}`);
  if (existing) {
    await adapter.deleteFile(`${TEXTS_BASE_PATH}/${contentFile}`, existing.sha);
  }
}

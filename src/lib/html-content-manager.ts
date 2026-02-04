import { getStorageAdapter } from './storage-adapter';

const HTML_BASE_PATH = 'content/compositions';

export async function getHtmlContent(compositionId: string): Promise<string | null> {
  const adapter = getStorageAdapter();
  const file = await adapter.readFile(`${HTML_BASE_PATH}/${compositionId}.html`);
  return file?.content ?? null;
}

export async function saveHtmlContent(compositionId: string, html: string): Promise<void> {
  const adapter = getStorageAdapter();
  // Try to read existing file to get sha for updates
  const existing = await adapter.readFile(`${HTML_BASE_PATH}/${compositionId}.html`);
  await adapter.writeFile(
    `${HTML_BASE_PATH}/${compositionId}.html`,
    html,
    existing?.sha
  );
}

export async function deleteHtmlContent(compositionId: string): Promise<void> {
  const adapter = getStorageAdapter();
  const existing = await adapter.readFile(`${HTML_BASE_PATH}/${compositionId}.html`);
  if (existing) {
    await adapter.deleteFile(`${HTML_BASE_PATH}/${compositionId}.html`, existing.sha);
  }
}

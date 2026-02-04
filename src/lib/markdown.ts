import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';
import type { TextContent, Text } from '@/data/types';

const textsDirectory = path.join(process.cwd(), 'src/data/content/texts');

/**
 * Get all markdown file slugs from the texts directory
 */
export function getTextSlugs(): string[] {
  if (!fs.existsSync(textsDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(textsDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => fileName.replace(/\.md$/, ''));
}

/**
 * Get text metadata and content by slug
 */
export async function getTextBySlug(slug: string): Promise<TextContent | null> {
  try {
    const fullPath = path.join(textsDirectory, `${slug}.md`);

    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Process markdown to HTML
    const processedContent = await remark()
      .use(html)
      .process(content);
    const contentHtml = processedContent.toString();

    // Load the text metadata from texts.json
    const textsJsonPath = path.join(process.cwd(), 'src/data/content/texts.json');
    const textsData = JSON.parse(fs.readFileSync(textsJsonPath, 'utf8')) as Text[];
    const textMetadata = textsData.find(t => t.slug === slug);

    if (!textMetadata) {
      return null;
    }

    return {
      metadata: textMetadata,
      content: contentHtml,
      raw: content
    };
  } catch (error) {
    console.error(`Error loading text ${slug}:`, error);
    return null;
  }
}

/**
 * Get all texts with their content
 */
export async function getAllTexts(): Promise<TextContent[]> {
  const slugs = getTextSlugs();
  const texts = await Promise.all(
    slugs.map(slug => getTextBySlug(slug))
  );
  return texts.filter((text): text is TextContent => text !== null);
}

/**
 * Get excerpt from markdown content
 */
export function getExcerpt(content: string, maxLength: number = 200): string {
  const plainText = content
    .replace(/^---[\s\S]*?---/, '') // Remove frontmatter
    .replace(/#{1,6}\s/g, '') // Remove headers
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to plain text
    .replace(/[*_~`]/g, '') // Remove markdown formatting
    .trim();

  if (plainText.length <= maxLength) {
    return plainText;
  }

  return plainText.substring(0, maxLength).trim() + '...';
}

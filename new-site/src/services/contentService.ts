import fs from 'fs';
import path from 'path';
import type {
  Composition,
  Text,
  Tool,
  Profile,
  ContactInfo,
  HomeContent,
  ContentResponse
} from '@/data/types';
import {
  compositionsArraySchema,
  textsArraySchema,
  toolsArraySchema,
  profileSchema,
  contactSchema,
  homeContentSchema
} from '@/data/schemas';

const contentDirectory = path.join(process.cwd(), 'src/data/content');

/**
 * Generic function to load and validate JSON content
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function loadJsonContent<T>(filename: string, schema: any): T {
  try {
    const filePath = path.join(contentDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    // Validate with Zod schema
    const validated = schema.parse(data);
    return validated;
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    throw error;
  }
}

/**
 * COMPOSITIONS
 */
export function getAllCompositions(): ContentResponse<Composition[]> {
  try {
    const compositions = loadJsonContent<Composition[]>('compositions.json', compositionsArraySchema);
    return {
      data: compositions.filter(c => c.status === 'published'),
      metadata: { total: compositions.length }
    };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function getCompositionBySlug(slug: string): ContentResponse<Composition | null> {
  try {
    const { data: compositions } = getAllCompositions();
    const composition = compositions.find(c => c.slug === slug);
    return { data: composition || null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function getFeaturedCompositions(limit?: number): ContentResponse<Composition[]> {
  try {
    const { data: compositions } = getAllCompositions();
    const featured = compositions.filter(c => c.featured);
    return {
      data: limit ? featured.slice(0, limit) : featured
    };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * TEXTS
 */
export function getAllTexts(): ContentResponse<Text[]> {
  try {
    const texts = loadJsonContent<Text[]>('texts.json', textsArraySchema);
    return {
      data: texts.filter(t => t.status === 'published'),
      metadata: { total: texts.length }
    };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function getTextBySlug(slug: string): ContentResponse<Text | null> {
  try {
    const { data: texts } = getAllTexts();
    const text = texts.find(t => t.slug === slug);
    return { data: text || null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * TOOLS
 */
export function getAllTools(): ContentResponse<Tool[]> {
  try {
    const tools = loadJsonContent<Tool[]>('tools.json', toolsArraySchema);
    return {
      data: tools.filter(t => t.status === 'published' || t.status === 'in-progress'),
      metadata: { total: tools.length }
    };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export function getToolBySlug(slug: string): ContentResponse<Tool | null> {
  try {
    const { data: tools } = getAllTools();
    const tool = tools.find(t => t.slug === slug);
    return { data: tool || null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * PROFILE & CONTACT
 */
export function getProfile(): ContentResponse<Profile> {
  try {
    const profile = loadJsonContent<Profile>('profile.json', profileSchema);
    return { data: profile };
  } catch (error) {
    throw error;
  }
}

export function getContactInfo(): ContentResponse<ContactInfo> {
  try {
    const contact = loadJsonContent<ContactInfo>('contact.json', contactSchema);
    return { data: contact };
  } catch (error) {
    throw error;
  }
}

/**
 * HOME
 */
export function getHomeContent(): ContentResponse<HomeContent> {
  try {
    const home = loadJsonContent<HomeContent>('home.json', homeContentSchema);
    return { data: home };
  } catch (error) {
    throw error;
  }
}

/**
 * SEARCH & FILTER UTILITIES
 */
export function searchContent(query: string): ContentResponse<{
  compositions: Composition[];
  texts: Text[];
  tools: Tool[];
}> {
  try {
    const { data: compositions } = getAllCompositions();
    const { data: texts } = getAllTexts();
    const { data: tools } = getAllTools();

    const lowerQuery = query.toLowerCase();

    return {
      data: {
        compositions: compositions.filter(c =>
          c.title.toLowerCase().includes(lowerQuery) ||
          c.instruments.toLowerCase().includes(lowerQuery) ||
          c.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
        ),
        texts: texts.filter(t =>
          t.title.toLowerCase().includes(lowerQuery) ||
          t.type.toLowerCase().includes(lowerQuery) ||
          t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
        ),
        tools: tools.filter(t =>
          t.name.toLowerCase().includes(lowerQuery) ||
          t.technologies?.some(tech => tech.toLowerCase().includes(lowerQuery))
        )
      }
    };
  } catch (error) {
    return {
      data: { compositions: [], texts: [], tools: [] },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

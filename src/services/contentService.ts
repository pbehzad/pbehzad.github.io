import { getStorageAdapter } from '@/lib/storage-adapter';
import type {
  Composition,
  Text,
  Tool,
  Event,
  Profile,
  ContactInfo,
  HomeContent,
  ContentResponse
} from '@/data/types';
import {
  compositionsArraySchema,
  textsArraySchema,
  toolsArraySchema,
  eventsArraySchema,
  profileSchema,
  contactSchema,
  homeContentSchema
} from '@/data/schemas';
import { z } from 'zod';

/**
 * Generic function to load and validate JSON content from storage adapter
 */
async function loadJsonContent<T>(filename: string, schema: z.ZodSchema<T>): Promise<T> {
  const adapter = getStorageAdapter();
  const file = await adapter.readFile(filename);
  if (!file) {
    throw new Error(`File not found: ${filename}`);
  }
  const data = JSON.parse(file.content);
  return schema.parse(data);
}

/**
 * Generic function to write JSON content via storage adapter
 */
async function writeJsonContentToStorage<T>(
  filename: string,
  data: T,
  schema: z.ZodSchema<T>
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = schema.parse(data);
    const adapter = getStorageAdapter();
    const existing = await adapter.readFile(filename);
    const content = JSON.stringify(validated, null, 2);
    await adapter.writeFile(filename, content, existing?.sha);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Validation or write failed'
    };
  }
}

/**
 * COMPOSITIONS
 */
export async function getAllCompositions(): Promise<ContentResponse<Composition[]>> {
  try {
    const compositions = await loadJsonContent('compositions.json', compositionsArraySchema);
    const published = compositions
      .filter(c => c.status === 'published')
      .sort((a, b) => b.year.localeCompare(a.year));
    return {
      data: published,
      metadata: { total: compositions.length }
    };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getCompositionBySlug(slug: string): Promise<ContentResponse<Composition | null>> {
  try {
    const { data: compositions } = await getAllCompositions();
    const composition = compositions.find(c => c.slug === slug);
    return { data: composition || null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getFeaturedCompositions(limit?: number): Promise<ContentResponse<Composition[]>> {
  try {
    const { data: compositions } = await getAllCompositions();
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

export async function getAllCompositionsRaw(): Promise<ContentResponse<Composition[]>> {
  try {
    const compositions = await loadJsonContent('compositions.json', compositionsArraySchema);
    return { data: compositions, metadata: { total: compositions.length } };
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
export async function getAllTexts(): Promise<ContentResponse<Text[]>> {
  try {
    const texts = await loadJsonContent('texts.json', textsArraySchema);
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

export async function getTextBySlug(slug: string): Promise<ContentResponse<Text | null>> {
  try {
    const { data: texts } = await getAllTexts();
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
export async function getAllTools(): Promise<ContentResponse<Tool[]>> {
  try {
    const tools = await loadJsonContent('tools.json', toolsArraySchema);
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

export async function getToolBySlug(slug: string): Promise<ContentResponse<Tool | null>> {
  try {
    const { data: tools } = await getAllTools();
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
export async function getProfile(): Promise<ContentResponse<Profile>> {
  try {
    const profile = await loadJsonContent('profile.json', profileSchema);
    return { data: profile };
  } catch (error) {
    throw error;
  }
}

export async function getContactInfo(): Promise<ContentResponse<ContactInfo>> {
  try {
    const contact = await loadJsonContent('contact.json', contactSchema);
    return { data: contact };
  } catch (error) {
    throw error;
  }
}

/**
 * HOME
 */
export async function getHomeContent(): Promise<ContentResponse<HomeContent>> {
  try {
    const home = await loadJsonContent('home.json', homeContentSchema);
    return { data: home };
  } catch (error) {
    throw error;
  }
}

/**
 * EVENTS
 */
export async function getAllEvents(): Promise<ContentResponse<Event[]>> {
  try {
    const events = await loadJsonContent('events.json', eventsArraySchema);
    return {
      data: events.filter(e => e.status === 'published'),
      metadata: { total: events.length }
    };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getEventBySlug(slug: string): Promise<ContentResponse<Event | null>> {
  try {
    const { data: events } = await getAllEvents();
    const event = events.find(e => e.slug === slug);
    return { data: event || null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getAllEventsRaw(): Promise<ContentResponse<Event[]>> {
  try {
    const events = await loadJsonContent('events.json', eventsArraySchema);
    return { data: events, metadata: { total: events.length } };
  } catch (error) {
    return {
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * WRITE UTILITIES
 */
export async function writeJsonContent<T>(
  filename: string,
  data: T,
  schema: z.ZodSchema<T>
): Promise<{ success: boolean; error?: string }> {
  return writeJsonContentToStorage(filename, data, schema);
}

/**
 * SEARCH & FILTER UTILITIES
 */
export async function searchContent(query: string): Promise<ContentResponse<{
  compositions: Composition[];
  texts: Text[];
  tools: Tool[];
}>> {
  try {
    const { data: compositions } = await getAllCompositions();
    const { data: texts } = await getAllTexts();
    const { data: tools } = await getAllTools();

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

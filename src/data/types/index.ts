export type { Composition, CompositionMetadata } from './composition.types';
export type { Text, TextMetadata, TextContent } from './text.types';
export type { Tool, ToolMetadata } from './tool.types';
export type { Event } from './event.types';
export type { Profile, ContactInfo, HomeContent } from './profile.types';

export type ContentStatus = 'draft' | 'published';

export interface ContentResponse<T> {
  data: T;
  error?: string;
  metadata?: unknown;
}

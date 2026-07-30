import type { Composition, ContactInfo, Event, Profile, Text } from '@/data/types';

export type ColumnPortalData = {
  compositions: Composition[];
  events: Event[];
  texts: Text[];
  profile: Profile | null;
  contact: ContactInfo | null;
  renderedAt: string;
};

# Data Infrastructure Documentation

## Overview

This portfolio site uses a **Hybrid Content Management Approach** that combines:
- **JSON files** for structured data (compositions, tools, profile)
- **Markdown files** for long-form content (essays, articles)
- **Zod schemas** for validation
- **TypeScript** for type safety
- **Next.js API routes** for data fetching
- **React hooks** for client-side data access

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Components                      │
│          (Home, Compositions, Texts, etc.)              │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ├─── Client-Side Hooks
                        │    (useCompositions, useTexts, etc.)
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js API Routes                     │
│        /api/content/{compositions,texts,etc}            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ├─── Content Service Layer
                        │    (getAllCompositions, etc.)
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│              Content Files + Validation                  │
│  ┌──────────────┐    ┌───────────┐    ┌──────────────┐ │
│  │  JSON Files  │───▶│    Zod    │───▶│  TypeScript  │ │
│  │  Markdown    │    │  Schemas  │    │    Types     │ │
│  └──────────────┘    └───────────┘    └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## File Structure

```
new-site/
├── src/
│   ├── data/
│   │   ├── content/              # All content data
│   │   │   ├── compositions.json
│   │   │   ├── texts.json
│   │   │   ├── tools.json
│   │   │   ├── profile.json
│   │   │   ├── contact.json
│   │   │   ├── home.json
│   │   │   └── texts/           # Markdown essays
│   │   │       ├── *.md
│   │   │
│   │   ├── types/               # TypeScript interfaces
│   │   │   ├── composition.types.ts
│   │   │   ├── text.types.ts
│   │   │   ├── tool.types.ts
│   │   │   ├── profile.types.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── schemas/             # Zod validation schemas
│   │   │   ├── composition.schema.ts
│   │   │   ├── text.schema.ts
│   │   │   ├── tool.schema.ts
│   │   │   ├── profile.schema.ts
│   │   │   └── index.ts
│   │   │
│   │   └── README.md            # Content editing guide
│   │
│   ├── services/
│   │   ├── contentService.ts    # Server-side content fetching
│   │   └── hooks/
│   │       └── useContent.ts    # Client-side hooks
│   │
│   ├── lib/
│   │   └── markdown.ts          # Markdown processing
│   │
│   └── app/
│       ├── api/content/         # API endpoints
│       │   ├── compositions/route.ts
│       │   ├── texts/route.ts
│       │   ├── tools/route.ts
│       │   ├── profile/route.ts
│       │   ├── contact/route.ts
│       │   └── home/route.ts
│       │
│       └── components/sections/ # UI components
│           ├── Home.tsx
│           ├── Compositions.tsx
│           ├── Texts.tsx
│           ├── Tools.tsx
│           ├── About.tsx
│           └── Contact.tsx
│
├── scripts/                     # Helper utilities
│   ├── validate-content.ts      # Validate all content
│   ├── new-composition.ts       # Add new composition
│   └── new-text.ts              # Add new text/essay
│
└── public/media/                # Media files
    ├── audio/
    ├── scores/
    ├── images/
    ├── pdfs/
    └── videos/
```

## Data Flow

### 1. Content Storage
Content lives in `src/data/content/` as JSON or Markdown files.

### 2. Type Safety
TypeScript interfaces in `src/data/types/` define the shape of all content.

### 3. Validation
Zod schemas in `src/data/schemas/` validate content at runtime.

### 4. Server-Side Service
`contentService.ts` loads, validates, and serves content to API routes.

### 5. API Routes
Next.js API routes at `/api/content/*` expose content via HTTP.

### 6. Client-Side Hooks
React hooks fetch data from API routes and provide it to components.

### 7. UI Components
Section components use hooks to display content.

## Content Types

### Compositions
```typescript
interface Composition {
  id: string;
  slug: string;
  title: string;
  year: number;
  instruments: string;
  duration?: string;
  description?: string;
  program_notes?: string;
  score_url?: string;
  audio_urls?: string[];
  video_url?: string;
  tags?: string[];
  featured?: boolean;
  status: 'draft' | 'published';
  premiere?: { date, location, performers };
  related_texts?: string[];
  created_at: string;
  updated_at: string;
}
```

### Texts
```typescript
interface Text {
  id: string;
  slug: string;
  title: string;
  year: number;
  type: 'essay' | 'article' | 'paper' | 'note';
  description?: string;
  abstract?: string;
  content_file?: string;  // Markdown file
  pdf_url?: string;
  external_url?: string;
  tags?: string[];
  featured?: boolean;
  status: 'draft' | 'published';
  published_in?: string;
  related_compositions?: string[];
  created_at: string;
  updated_at: string;
}
```

### Tools
```typescript
interface Tool {
  id: string;
  slug: string;
  name: string;
  year: string;
  description?: string;
  category?: 'web-audio' | 'max-msp' | 'notation' | 'composition' | 'other';
  technologies?: string[];
  url?: string;
  github_url?: string;
  image_url?: string;
  featured?: boolean;
  status: 'draft' | 'published' | 'in-progress' | 'archived';
  created_at: string;
  updated_at: string;
}
```

## Usage Examples

### Adding New Content

#### Via Scripts (Recommended)
```bash
# Add new composition
npm run new:composition

# Add new text/essay
npm run new:text

# Validate all content
npm run validate
```

#### Manual Editing
1. Edit JSON files in `src/data/content/`
2. For texts, also create/edit Markdown files in `src/data/content/texts/`
3. Run `npm run validate` to check for errors
4. Test locally: `npm run dev`
5. Commit changes

### Using Content in Components

#### Client-Side (Current Approach)
```typescript
import { useCompositions } from '@/services/hooks/useContent';

function MyComponent() {
  const { compositions, loading, error } = useCompositions();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {compositions.map(comp => (
        <div key={comp.id}>{comp.title}</div>
      ))}
    </div>
  );
}
```

#### Server-Side (Alternative)
```typescript
import { getAllCompositions } from '@/services/contentService';

export default function Page() {
  const { data: compositions } = getAllCompositions();

  return (
    <div>
      {compositions.map(comp => (
        <div key={comp.id}>{comp.title}</div>
      ))}
    </div>
  );
}
```

### Working with Markdown

```typescript
import { getTextBySlug } from '@/lib/markdown';

const textContent = await getTextBySlug('post-heideggerian-aesthetics');

// textContent.metadata: Text metadata from JSON
// textContent.content: Rendered HTML
// textContent.raw: Raw markdown
```

## Validation

All content is validated using Zod schemas. Validation happens:

1. **On Load**: When content service reads files
2. **Pre-Commit**: Run `npm run validate` before committing
3. **Build Time**: Errors will break the build

### Common Validation Errors

```
❌ compositions.json - Invalid
   0.year: Expected number, received string
```
**Fix**: Change `"year": "2025"` to `"year": 2025`

```
❌ texts.json - Invalid
   2.type: Invalid enum value. Expected 'essay' | 'article' | 'paper' | 'note'
```
**Fix**: Use one of the allowed enum values

```
❌ profile.json - Invalid
   email: Invalid email
```
**Fix**: Use valid email format: `name@domain.com`

## NPM Scripts

```bash
# Development
npm run dev              # Start dev server

# Building
npm run build            # Build for production
npm run start            # Start production server

# Content Management
npm run validate         # Validate all content files
npm run new:composition  # Interactive: add new composition
npm run new:text         # Interactive: add new text/essay

# Code Quality
npm run lint             # Run ESLint
```

## Migration Path to CMS

The current architecture is designed for easy migration to a headless CMS:

### Current: JSON + Markdown
```
src/data/content/*.json → contentService → API Routes → Components
```

### Future: Headless CMS
```
Sanity/Contentful → contentService → API Routes → Components
                          ↓
                    (cache layer)
```

**Steps to migrate:**
1. Set up CMS (Sanity.io, Contentful, Strapi)
2. Update `contentService.ts` to fetch from CMS API
3. Keep TypeScript types and Zod schemas
4. Add caching layer for performance
5. Optionally import existing JSON data into CMS

## Best Practices

### Content IDs and Slugs
- Use lowercase-with-hyphens
- Keep them permanent (don't change after publishing)
- Make them descriptive: `micro-clones` not `mc1`

### Status Management
- `draft`: Work in progress, hidden from public
- `published`: Live on site
- `in-progress`: For tools still being developed
- `archived`: Hidden but preserved

### Dates
- Always use ISO 8601: `"2025-01-15T00:00:00Z"`
- Update `updated_at` when editing
- Keep `created_at` unchanged

### Tags
- Use lowercase
- Be consistent
- Enable search/filtering
- Add 3-5 relevant tags per item

### Media Files
- Store in `public/media/`
- Use descriptive filenames
- Reference as `/media/category/filename.ext`
- Optimize images before uploading

### Git Workflow
1. Edit content
2. `npm run validate`
3. `npm run dev` (test locally)
4. `git add . && git commit -m "message"`
5. `git push`

## Troubleshooting

### Content not appearing
- Check `status` is `"published"`
- Validate JSON syntax
- Check browser console for errors
- Restart dev server

### TypeScript errors
- Run `npm run build` to see all errors
- Check types match schemas
- Ensure required fields present

### API errors
- Restart dev server: `Ctrl+C` then `npm run dev`
- Check file permissions
- Verify paths are correct

### Validation failures
- Run `npm run validate` to see specific errors
- Check required fields
- Verify data types (numbers vs strings)
- Ensure URLs are valid

## Future Enhancements

Planned features for the data infrastructure:

- [ ] Visual admin panel at `/admin`
- [ ] CMS integration (Sanity.io)
- [ ] Advanced search with Fuse.js
- [ ] Image optimization pipeline
- [ ] Content versioning with Git
- [ ] Draft preview mode
- [ ] Scheduled publishing
- [ ] Multi-language support (i18n)
- [ ] Analytics integration
- [ ] Automated backups
- [ ] Content relationships graph
- [ ] Full-text search
- [ ] Tag management UI
- [ ] Bulk import/export tools

## Support

For questions or issues:
1. Check `src/data/README.md` for content editing guide
2. Review type definitions in `src/data/types/`
3. Check validation schemas in `src/data/schemas/`
4. Run `npm run validate` to diagnose issues

## License

This data infrastructure is part of the portfolio site codebase.

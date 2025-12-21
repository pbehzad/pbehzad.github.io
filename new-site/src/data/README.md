# Content Management Guide

This directory contains all the content data for your portfolio site. The hybrid approach uses JSON for structured data and Markdown for long-form content.

## Directory Structure

```
src/data/
├── content/           # All content files (JSON + Markdown)
│   ├── compositions.json
│   ├── texts.json
│   ├── tools.json
│   ├── profile.json
│   ├── contact.json
│   ├── home.json
│   └── texts/        # Markdown files for essays/articles
│       ├── post-heideggerian-aesthetics.md
│       ├── circular-temporalities.md
│       └── notation-as-interface.md
├── types/            # TypeScript type definitions
├── schemas/          # Zod validation schemas
└── README.md         # This file
```

## How to Edit Content

### 1. Editing Compositions

Edit [content/compositions.json](content/compositions.json)

```json
{
  "id": "unique-slug",
  "slug": "unique-slug",
  "title": "COMPOSITION TITLE",
  "year": 2025,
  "instruments": "INSTRUMENTATION",
  "duration": "10'00\"",
  "description": "Brief description",
  "program_notes": "Detailed program notes",
  "score_url": "/media/scores/composition.pdf",
  "audio_urls": ["/media/audio/composition.mp3"],
  "video_url": "https://youtube.com/watch?v=...",
  "tags": ["tag1", "tag2"],
  "featured": true,
  "status": "published",
  "premiere": {
    "date": "2025-01-15",
    "location": "Concert Hall, City",
    "performers": "Ensemble Name"
  },
  "related_texts": ["text-slug"],
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

**Key Fields:**
- `id` & `slug`: Unique identifier (use lowercase-with-hyphens)
- `status`: Either `"draft"` or `"published"`
- `featured`: Set to `true` for homepage display
- `tags`: Array of keywords for search/filtering

### 2. Editing Texts

#### Metadata: Edit [content/texts.json](content/texts.json)

```json
{
  "id": "unique-slug",
  "slug": "unique-slug",
  "title": "ESSAY TITLE",
  "year": 2023,
  "type": "essay",
  "description": "Brief description",
  "abstract": "Academic abstract",
  "content_file": "unique-slug.md",
  "pdf_url": "/media/pdfs/essay.pdf",
  "external_url": "https://journal.com/article",
  "tags": ["philosophy", "aesthetics"],
  "featured": true,
  "status": "published",
  "published_in": "Journal Name, Vol. 1",
  "related_compositions": ["composition-slug"],
  "created_at": "2023-01-01T00:00:00Z",
  "updated_at": "2023-01-01T00:00:00Z"
}
```

#### Content: Create/Edit Markdown file in [content/texts/](content/texts/)

```markdown
---
title: "Essay Title"
year: 2023
type: "essay"
tags: ["philosophy", "aesthetics"]
---

# Essay Title

Your content here in **Markdown** format.

## Section Heading

- Bullet points
- More items

[Links work too](https://example.com)
```

**Text Types:**
- `"essay"` - Long-form essays
- `"article"` - Articles and papers
- `"paper"` - Academic papers
- `"note"` - Short notes/thoughts

### 3. Editing Tools

Edit [content/tools.json](content/tools.json)

```json
{
  "id": "tool-slug",
  "slug": "tool-slug",
  "name": "TOOL NAME",
  "year": "2024",
  "description": "What the tool does",
  "category": "web-audio",
  "technologies": ["JavaScript", "Web Audio API"],
  "url": "https://tool-url.com",
  "github_url": "https://github.com/user/repo",
  "image_url": "/media/images/tool.png",
  "featured": true,
  "status": "published",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

**Categories:**
- `"web-audio"` - Web Audio tools
- `"max-msp"` - Max/MSP patches
- `"notation"` - Notation tools
- `"composition"` - Composition tools
- `"other"` - Other tools

**Status Options:**
- `"published"` - Live on site
- `"in-progress"` - Shows as ongoing
- `"draft"` - Hidden from site
- `"archived"` - Hidden but preserved

### 4. Editing Profile (About Section)

Edit [content/profile.json](content/profile.json)

```json
{
  "name": "Your Name",
  "title": "TITLE 1",
  "subtitle": "TITLE 2",
  "tagline": "YOUR × TAGLINE × HERE",
  "bio": "Your bio in ALL CAPS",
  "specializations": [
    "SPECIALIZATION 1",
    "SPECIALIZATION 2"
  ],
  "skills": [
    {
      "category": "CATEGORY NAME",
      "items": ["SKILL 1", "SKILL 2"]
    }
  ],
  "education": [],
  "awards": [],
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### 5. Editing Contact Info

Edit [content/contact.json](content/contact.json)

```json
{
  "email": "your.email@domain.com",
  "github": "github.com/username",
  "website": "yourdomain.com",
  "linkedin": "linkedin.com/in/username",
  "soundcloud": "soundcloud.com/username",
  "bandcamp": "username.bandcamp.com",
  "availability_status": "AVAILABLE FOR COMMISSIONS & COLLABORATIONS",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### 6. Editing Home Page Content

Edit [content/home.json](content/home.json)

```json
{
  "hero": {
    "name": "YOUR NAME",
    "title": "TITLE 1",
    "subtitle": "TITLE 2",
    "tagline": "YOUR × TAGLINE × HERE"
  },
  "recent_works": [
    {
      "title": "WORK TITLE",
      "year": 2025
    }
  ],
  "updated_at": "2025-01-01T00:00:00Z"
}
```

## Media Management

Store media files in the `public/media/` directory:

```
public/
└── media/
    ├── audio/        # Audio files (.mp3, .wav)
    ├── scores/       # PDF scores
    ├── images/       # Images (.jpg, .png)
    ├── pdfs/         # Text PDFs
    └── videos/       # Video files (or use external URLs)
```

Reference media in JSON with paths like: `"/media/audio/composition.mp3"`

## Validation

All content is validated with Zod schemas on load. If you see errors in the console, check:

1. **Required fields** are present
2. **Data types** match (strings, numbers, booleans)
3. **URLs** are valid (start with http:// or https://)
4. **Dates** are in ISO format: `"2025-01-01T00:00:00Z"`
5. **Enums** match allowed values (status, type, category)

## Git Workflow

1. Edit content files
2. Test locally: `npm run dev`
3. Commit changes: `git add . && git commit -m "Update content"`
4. Push: `git push`
5. Deploy (automatic or manual depending on setup)

## Content Best Practices

### IDs and Slugs
- Use lowercase with hyphens: `my-composition`
- Keep them short but descriptive
- Never change after publishing (breaks links)

### Dates
- Always use ISO 8601 format: `"2025-01-15T00:00:00Z"`
- Update `updated_at` when you edit content

### Status Management
- Use `"draft"` while working on content
- Change to `"published"` when ready
- Content is automatically filtered by status

### Tags
- Use lowercase
- Be consistent (e.g., always "electroacoustic" not "electro-acoustic")
- Tags enable search and filtering

### Featured Content
- Set `featured: true` for important works
- Featured items can appear in special sections
- Limit to 3-5 featured items per section

## Troubleshooting

**Content not showing up?**
- Check `status` is `"published"`
- Verify JSON syntax is valid (use a JSON validator)
- Check browser console for validation errors

**API errors?**
- Restart dev server: `npm run dev`
- Check file permissions
- Verify file paths are correct

**TypeScript errors?**
- Run `npm run build` to see all errors
- Check types match schemas
- Ensure all required fields are present

## Future Enhancements

- [ ] Admin panel for visual editing
- [ ] CMS integration (Sanity.io or Contentful)
- [ ] Image optimization pipeline
- [ ] Search functionality
- [ ] Content versioning
- [ ] Draft preview mode
- [ ] Scheduled publishing

## Questions?

Refer to:
- Type definitions in `types/`
- Validation schemas in `schemas/`
- Service layer in `services/contentService.ts`

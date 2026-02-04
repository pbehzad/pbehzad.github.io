# Content Editing Quick Start Guide

## Quick Commands

```bash
# Start development server
npm run dev

# Validate all content
npm run validate

# Add new composition
npm run new:composition

# Add new text/essay
npm run new:text

# Build for production
npm run build
```

## Editing Content Files

All content is stored in `src/data/content/`:

### 📁 Files Overview

- **[compositions.json](src/data/content/compositions.json)** - Your musical works
- **[texts.json](src/data/content/texts.json)** - Essays and articles (metadata)
- **[texts/](src/data/content/texts/)** - Full text content (Markdown files)
- **[tools.json](src/data/content/tools.json)** - Software tools you've created
- **[profile.json](src/data/content/profile.json)** - About section content
- **[contact.json](src/data/content/contact.json)** - Contact information
- **[home.json](src/data/content/home.json)** - Homepage hero content

## Quick Edit Examples

### Add a New Composition

**Option 1: Use the script (recommended)**
```bash
npm run new:composition
```

**Option 2: Manual edit**
Add to `src/data/content/compositions.json`:
```json
{
  "id": "my-new-piece",
  "slug": "my-new-piece",
  "title": "MY NEW PIECE",
  "year": 2025,
  "instruments": "INSTRUMENTATION",
  "status": "published",
  "featured": false,
  "tags": [],
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Add a New Text/Essay

**Option 1: Use the script (recommended)**
```bash
npm run new:text
```

**Option 2: Manual edit**
1. Add to `src/data/content/texts.json`:
```json
{
  "id": "my-essay",
  "slug": "my-essay",
  "title": "MY ESSAY TITLE",
  "year": 2025,
  "type": "essay",
  "content_file": "my-essay.md",
  "status": "published",
  "tags": [],
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

2. Create `src/data/content/texts/my-essay.md`:
```markdown
---
title: "My Essay Title"
year: 2025
type: "essay"
---

# My Essay Title

Your content here...
```

### Update Contact Info

Edit `src/data/content/contact.json`:
```json
{
  "email": "your.email@domain.com",
  "github": "github.com/username",
  "website": "yoursite.com",
  "availability_status": "AVAILABLE FOR COMMISSIONS",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Update Homepage

Edit `src/data/content/home.json`:
```json
{
  "hero": {
    "name": "YOUR NAME",
    "title": "TITLE 1",
    "subtitle": "TITLE 2",
    "tagline": "YOUR × TAGLINE"
  },
  "recent_works": [
    { "title": "WORK 1", "year": 2025 }
  ]
}
```

## Important Fields

### Status
- `"draft"` - Hidden from site
- `"published"` - Visible on site
- `"in-progress"` - For ongoing tools (tools only)
- `"archived"` - Hidden but preserved (tools only)

### Featured
- `true` - Can appear in special sections/homepage
- `false` - Regular display only

### Dates
Always use ISO format: `"2025-01-15T00:00:00Z"`

### Tags
Use lowercase, be consistent:
```json
"tags": ["electroacoustic", "philosophy", "notation"]
```

## Workflow

1. **Edit** content files
2. **Validate**: `npm run validate`
3. **Test**: `npm run dev` → open [http://localhost:3000](http://localhost:3000)
4. **Commit**: `git add . && git commit -m "Update content"`
5. **Push**: `git push`

## Common Tasks

### Mark composition as featured
```json
{
  "id": "my-piece",
  ...
  "featured": true
}
```

### Add audio/video to composition
```json
{
  "id": "my-piece",
  ...
  "audio_urls": ["/media/audio/piece.mp3"],
  "video_url": "https://youtube.com/watch?v=..."
}
```

### Add PDF score to composition
```json
{
  "id": "my-piece",
  ...
  "score_url": "/media/scores/my-piece.pdf"
}
```

### Link composition to text
In `compositions.json`:
```json
{
  "id": "my-piece",
  ...
  "related_texts": ["essay-about-piece"]
}
```

In `texts.json`:
```json
{
  "id": "essay-about-piece",
  ...
  "related_compositions": ["my-piece"]
}
```

## Media Files

Store media in `public/media/`:
```
public/media/
├── audio/         # .mp3, .wav
├── scores/        # .pdf
├── images/        # .jpg, .png
├── pdfs/          # article PDFs
└── videos/        # or use YouTube URLs
```

Reference as: `"/media/audio/file.mp3"`

## Troubleshooting

### Content not showing?
- Check `status` is `"published"`
- Run `npm run validate`
- Check browser console for errors
- Restart dev server

### Validation errors?
- Read error messages carefully
- Common issues:
  - Wrong data type (`"2025"` should be `2025`)
  - Invalid enum value (`type: "blog"` → `type: "essay"`)
  - Invalid URL format
  - Missing required fields
  - Invalid date format

### JSON syntax errors?
- Missing comma between items
- Extra comma after last item
- Unmatched brackets `{}` or `[]`
- Unescaped quotes in strings
- Use a JSON validator tool

## Full Documentation

- **Content Guide**: [src/data/README.md](src/data/README.md)
- **Infrastructure**: [DATA_INFRASTRUCTURE.md](DATA_INFRASTRUCTURE.md)
- **Type Definitions**: [src/data/types/](src/data/types/)
- **Validation Schemas**: [src/data/schemas/](src/data/schemas/)

## Need Help?

1. Check validation: `npm run validate`
2. Read error messages in console
3. Review type definitions in `src/data/types/`
4. Check example data in content files
5. Refer to full documentation above

# Portfolio Site - Data Management System

## 🎯 Overview

This portfolio site now has a complete **data infrastructure** that separates content from code, making it easy to update your compositions, texts, tools, and profile information without touching React components.

## ✨ What's New

### Before
```typescript
// Hardcoded in component
const compositions = [
  { title: "Piece 1", year: 2025, instruments: "Piano" },
  // ...
];
```

### After
```json
// src/data/content/compositions.json
[
  {
    "id": "piece-1",
    "title": "PIECE 1",
    "year": 2025,
    "instruments": "PIANO",
    "status": "published",
    ...
  }
]
```

## 📁 Project Structure

```
new-site/
├── src/
│   ├── data/
│   │   ├── content/              # 👈 Edit your content here
│   │   │   ├── compositions.json
│   │   │   ├── texts.json
│   │   │   ├── texts/           # Markdown essays
│   │   │   ├── tools.json
│   │   │   ├── profile.json
│   │   │   ├── contact.json
│   │   │   └── home.json
│   │   ├── types/               # TypeScript interfaces
│   │   ├── schemas/             # Validation schemas
│   │   └── README.md            # Content editing guide
│   │
│   ├── services/
│   │   ├── contentService.ts    # Data fetching
│   │   └── hooks/useContent.ts  # React hooks
│   │
│   ├── lib/markdown.ts          # Markdown processing
│   │
│   └── app/
│       ├── api/content/         # API endpoints
│       └── components/sections/ # UI (now data-driven)
│
├── scripts/
│   ├── validate-content.ts      # Validate all content
│   ├── new-composition.ts       # Add new composition
│   └── new-text.ts              # Add new text/essay
│
├── public/media/                # Store media files
│
├── CONTENT_EDITING_QUICKSTART.md  # 👈 Quick reference
├── DATA_INFRASTRUCTURE.md         # 👈 Full documentation
└── README_DATA_MANAGEMENT.md      # 👈 You are here
```

## 🚀 Quick Start

### For Content Editing

```bash
# Add new composition interactively
npm run new:composition

# Add new text/essay interactively
npm run new:text

# Validate all content
npm run validate

# Test changes locally
npm run dev
```

**Then edit these files:**
- [src/data/content/compositions.json](src/data/content/compositions.json)
- [src/data/content/texts.json](src/data/content/texts.json)
- [src/data/content/tools.json](src/data/content/tools.json)
- [src/data/content/profile.json](src/data/content/profile.json)
- [src/data/content/contact.json](src/data/content/contact.json)
- [src/data/content/home.json](src/data/content/home.json)

### For Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📚 Documentation

### For Content Editors
- **[Content Editing Quick Start](CONTENT_EDITING_QUICKSTART.md)** - Start here!
- **[Content README](src/data/README.md)** - Detailed editing guide

### For Developers
- **[Data Infrastructure](DATA_INFRASTRUCTURE.md)** - Full technical documentation
- **[Type Definitions](src/data/types/)** - TypeScript interfaces
- **[Validation Schemas](src/data/schemas/)** - Zod schemas

## 🎨 Features

### ✅ Implemented

- **Hybrid Content System**
  - JSON for structured data (compositions, tools, etc.)
  - Markdown for long-form content (essays, articles)

- **Type Safety**
  - Full TypeScript support
  - Runtime validation with Zod

- **Content Management**
  - Easy JSON editing
  - Interactive CLI scripts for adding content
  - Validation before committing

- **API Layer**
  - Next.js API routes
  - Client-side React hooks
  - Server-side content service

- **Developer Tools**
  - Content validation script
  - Helper scripts for new content
  - Comprehensive documentation

### 🔮 Future Enhancements

- [ ] Visual admin panel at `/admin`
- [ ] CMS integration (Sanity.io or Contentful)
- [ ] Search functionality with Fuse.js
- [ ] Image optimization pipeline
- [ ] Draft preview mode
- [ ] Scheduled publishing
- [ ] Multi-language support
- [ ] Analytics integration

## 🎯 Content Types

### Compositions
Musical works with metadata, scores, audio, video, program notes, and premiere information.

### Texts
Essays and articles with Markdown content, PDFs, abstracts, and academic publishing info.

### Tools
Software tools and projects with descriptions, technologies, URLs, and status tracking.

### Profile
Biography, specializations, skills, education, and awards.

### Contact
Email, social links, and availability status.

### Home
Hero section and recent works showcase.

## 🔧 Key Technologies

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Zod** - Runtime validation
- **Gray Matter** - Markdown frontmatter
- **Remark** - Markdown processing
- **Tailwind CSS** - Styling

## 📝 Common Workflows

### Adding a New Composition

1. Run `npm run new:composition`
2. Fill in the prompts
3. Edit `src/data/content/compositions.json` to add details
4. Set `status: "published"` when ready
5. Run `npm run validate`
6. Test with `npm run dev`
7. Commit and push

### Adding a New Essay

1. Run `npm run new:text`
2. Fill in the prompts
3. Edit `src/data/content/texts/your-essay.md` with content
4. Edit `src/data/content/texts.json` for metadata
5. Set `status: "published"` when ready
6. Run `npm run validate`
7. Test with `npm run dev`
8. Commit and push

### Updating Profile

1. Edit `src/data/content/profile.json`
2. Update `bio`, `specializations`, `skills`, etc.
3. Update `updated_at` timestamp
4. Run `npm run validate`
5. Test with `npm run dev`
6. Commit and push

## 🛠️ Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run validate` | Validate all content files |
| `npm run new:composition` | Add new composition interactively |
| `npm run new:text` | Add new text/essay interactively |

## 📦 Dependencies

### Production
- `next` - React framework
- `react` & `react-dom` - UI library
- `zod` - Validation
- `gray-matter` - Markdown frontmatter
- `remark` & `remark-html` - Markdown processing

### Development
- `typescript` - Type checking
- `tailwindcss` - Styling
- `eslint` - Linting
- `ts-node` - Running TypeScript scripts

## 🔍 Troubleshooting

### Content not appearing on site?
1. Check `status` is `"published"`
2. Run `npm run validate`
3. Check browser console for errors
4. Restart dev server

### Validation errors?
1. Read error message carefully
2. Check data types (numbers vs strings)
3. Verify enum values match schema
4. Ensure URLs are valid
5. Check date format is ISO 8601

### Build fails?
1. Run `npm run validate` first
2. Check TypeScript errors
3. Ensure all imports are correct
4. Clear `.next` folder and rebuild

## 🚀 Deployment

1. Make sure all content validates: `npm run validate`
2. Test build locally: `npm run build`
3. Commit all changes
4. Push to repository
5. Deploy (Vercel, Netlify, etc.)

## 📖 Learning Resources

- **[Next.js Documentation](https://nextjs.org/docs)**
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**
- **[Zod Documentation](https://zod.dev/)**
- **[Markdown Guide](https://www.markdownguide.org/)**

## 🤝 Contributing

When adding features or fixing bugs:

1. Follow existing code style
2. Update TypeScript types if needed
3. Update Zod schemas if needed
4. Add/update documentation
5. Test thoroughly
6. Run validation and linting

## 📄 License

This is a personal portfolio site.

---

**Need help?** Check the documentation files or run `npm run validate` to diagnose issues.

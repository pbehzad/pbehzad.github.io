# parhambehzad.com

The Next.js portfolio and content-management application for Parham Behzad.

The public UI is entering a barely-there redesign. Existing routes, content schemas, storage adapters, admin tools, and published content are being preserved while the heavy six-column visual runtime is replaced.

## Start here

- Contributors and agents: [`AGENTS.md`](AGENTS.md)
- Active redesign roadmap: [`repair-UI.md`](repair-UI.md)
- Baseline audit and design brief: [`basecase-UI.md`](basecase-UI.md)
- Documentation index: [`docs/README.md`](docs/README.md)
- Content system guide: [`src/data/README.md`](src/data/README.md)

Canonical targets:

- [Home](docs/ui-audit/redesign-homepage-concept-v4-centered.png)
- [Works](docs/ui-audit/redesign-works-concept-v3-no-highlighter.png)

## Local development

Requires Node.js 20.9.0 (see `.nvmrc`) and npm 10. Next.js 15.5 supports Node.js 18.18 or later. The Node.js version for Vercel builds comes from the Vercel project settings, not from `.nvmrc`.

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Local content is read from the ignored `content-data/` directory unless `CONTENT_STORAGE=github` is configured. Do not commit environment files, tokens, or private content.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run build
```

Run `npm run validate` to check the local content set in `content-data/`; it exits with setup instructions if the directory is missing. In a fresh checkout, run `npm run validate:fixtures` to check the schemas against the non-secret fixtures in `scripts/fixtures/content/`.

## Main areas

```text
src/app/          public routes, admin UI, and API routes
src/services/     content reads used by public pages
src/data/         schemas, types, and content documentation
src/lib/          storage and content-management infrastructure
public/           static assets and vendored Zaya reader
docs/             audit assets and working guides
```

Public redesign work should not alter admin, API, storage, or content behavior unless its work package explicitly includes that scope.

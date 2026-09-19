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

Run `npm run validate` when a complete local content set is present in `content-data/`. The roadmap tracks the remaining work needed to make content validation useful in a fresh checkout.

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

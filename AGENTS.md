# Agent house rules

These instructions apply to the entire repository. They exist to keep the redesign coherent, reviewable, and safe when several agents work on it.

## Read before editing

Read these sources in order:

1. [`AGENTS.md`](AGENTS.md) — operating rules.
2. [`repair-UI.md`](repair-UI.md) — roadmap, dependencies, and acceptance checklists.
3. [`basecase-UI.md`](basecase-UI.md) — evidence, diagnosis, and performance budgets.
4. The two canonical mockups:
   - [`docs/ui-audit/redesign-homepage-concept-v4-centered.png`](docs/ui-audit/redesign-homepage-concept-v4-centered.png)
   - [`docs/ui-audit/redesign-works-concept-v3-no-highlighter.png`](docs/ui-audit/redesign-works-concept-v3-no-highlighter.png)
5. The relevant guide in [`docs/guides/`](docs/guides/).

If sources conflict, the latest explicit user instruction wins, followed by the canonical mockups, `repair-UI.md`, this file, and then the historical analysis in `basecase-UI.md`.

## Repository boundaries

- The active redesign covers the public site in `src/app`, especially the shared shell and public routes.
- Preserve the content schemas, storage adapters, public URLs, admin application, and API behavior unless a task explicitly includes them.
- Treat `src/app/admin/**`, `src/app/api/**`, `src/data/**`, `src/lib/**`, and `src/services/**` as protected infrastructure during visual work.
- Treat `public/zaya/**` as vendored third-party code. Do not format, reorganize, or modernize it as part of the redesign.
- Do not delete the legacy portal or visual components until the replacement has route parity and the retirement checklist in `repair-UI.md` is complete.
- Existing uncommitted changes belong to the user or another agent. Never discard, reset, overwrite, or reformat them casually.

## Non-negotiable design contract

- The interface is super-minimal and mostly empty: near-black field, warm-white text, restrained mono typography, and deliberate negative space.
- The persistent shell contains a tiny name at top left and a single liquid menu button at top right. Do not restore a visible header navigation bar.
- The home page contains the centered portrait inside one bounded organic liquid form. It contains no central name, role, selected-work list, card, or supporting copy.
- The Works index contains no glass highlight, card, panel, divider, thumbnail, or decorative ASCII. Its content floats directly on the background.
- Other indexes inherit the Works page's restraint. Detail and reading pages use flat, semantic content surfaces.
- Liquid glass is a signature, not a layout system. It is limited to the menu control and the home portrait treatment, with a visually acceptable flat fallback.
- No content, navigation, focus state, or contrast may depend on an SVG filter, canvas, WebGL, or JavaScript animation.
- Do not invent new ornament, copy, routes, or content to fill empty space. Empty space is part of the design.

## Engineering house rules

- Prefer Server Components. Add `'use client'` only at the smallest interaction boundary.
- Render meaningful content and navigation in the initial HTML. Progressive enhancement may decorate it but must not replace it.
- Use CSS media queries for responsive layout. Do not fork the whole application by viewport in JavaScript.
- Idle public pages must have no continuous animation loop, render loop, sampling loop, or timer-driven visual effect.
- Do not load Three.js on default public routes. No WebGL or synchronous pixel readback is allowed on list, detail, About, or Contact pages.
- Keep liquid effects bounded and optional. Safari failure must degrade to the same layout with a flat/static surface.
- Reuse the existing content service and typed models. Never hardcode production content into view components.
- Keep components focused. Split files when unrelated layout, data, and interaction concerns become entangled.
- Do not add a dependency for behavior that can be expressed clearly with the platform, React, Next.js, or CSS already in the repository.
- Do not silence TypeScript, ESLint, accessibility, or browser errors to make a check green.
- Follow [`docs/guides/CODE_STYLE.md`](docs/guides/CODE_STYLE.md).

## Accessibility and browser rules

- Use semantic landmarks, one page-level `h1`, a skip link, and native links/buttons.
- Every interactive element must work with keyboard, touch, and coarse pointer.
- Preserve a visible `:focus-visible` state. Never globally remove outlines without an equivalent replacement.
- Touch targets must be at least 44 × 44 CSS pixels even when the visible icon is smaller.
- Respect `prefers-reduced-motion` and `prefers-reduced-transparency` without hiding functionality.
- Validate at 390 × 844, 768 × 1024, 1024 × 768, and 1440 × 900.
- Safari 16.4+ is a supported baseline. Real Safari verification is required before the redesign is called complete.

## Agent workflow

Before changing files:

1. Inspect `git status --short` and the current diff.
2. Choose one unchecked work package from `repair-UI.md`; do not mix unrelated packages.
3. Identify the files you expect to own. Avoid files another active agent is editing.
4. Use a dedicated `codex/ui-<scope>` branch or managed worktree when parallel work is expected.
5. Record assumptions in the handoff; do not encode uncertain design choices as permanent architecture.

While working:

- Make the smallest coherent change that reaches the package's exit gate.
- Preserve unrelated edits and avoid repository-wide mechanical rewrites.
- Compare visual work with both canonical mockups at the target viewport.
- Keep roadmap checkboxes truthful: `[x]` means verified with evidence, not merely implemented.

Before handoff:

1. Review `git diff --check`, `git diff`, and `git status --short`.
2. Run the checks appropriate to the change. The minimum code gate is `npm run lint`, `npm run typecheck`, and `npm run build`.
3. For UI changes, capture desktop and mobile screenshots and record the tested routes and browsers.
4. Update only the checklist items and documentation affected by the work.
5. Report changed files, checks, screenshots, remaining risks, and the next safe task.

## Commit and repository hygiene

- Follow [`docs/guides/COMMIT_AND_REPOSITORY_HYGIENE.md`](docs/guides/COMMIT_AND_REPOSITORY_HYGIENE.md).
- Stage explicit paths. Never use a broad staging command without reviewing every included file.
- One commit should express one reason to change. Do not combine visual work, dependency churn, content edits, and cleanup.
- Never commit `.env*`, `.next/`, local content, editor state, debug output, or discarded screenshots.
- Do not rewrite, amend, squash, reset, or force-push another agent's work.
- Do not create a commit unless the task requests commits or the current workflow explicitly requires them. Leave a clean, reviewable diff otherwise.


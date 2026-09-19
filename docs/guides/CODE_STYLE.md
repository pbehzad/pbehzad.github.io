# Code style guide

Status: active for the public-site redesign

Applies to: TypeScript, React, Next.js, and project-owned CSS

## Principles

Code should make the visual restraint easy to preserve. Favor semantic HTML, server rendering, stable CSS, small interaction islands, and explicit fallbacks over clever effect infrastructure.

## Formatting and naming

- Use UTF-8, LF line endings, two-space indentation, and a final newline. `.editorconfig` is authoritative.
- Follow the local file's established quote style when making a focused change. Use single quotes in new TypeScript/TSX files.
- Use semicolons and trailing commas in multiline objects, arrays, imports, and parameter lists.
- Use `PascalCase` for React components and types, `camelCase` for functions and values, and `UPPER_SNAKE_CASE` only for true module constants.
- Name components after their responsibility (`SiteMenu`, `WorksIndex`), not their visual accident (`CoolBlob`, `NewPanel`).
- Prefer named domain types. Avoid `any`; narrow `unknown` at the boundary.
- Use `import type` when an import is type-only.

Do not reformat unrelated files. The goal is a legible diff, not cosmetic uniformity across legacy code.

## React and Next.js

- Server Components are the default. Fetch content on the server and pass the smallest serializable shape into client components.
- Add `'use client'` only for a component that directly owns browser state or an event handler.
- Keep route files declarative. Move reusable presentation into components and reusable data work into services.
- Do not call browser APIs during render. Subscribe and clean up inside effects at the smallest possible boundary.
- Prefer CSS media/container queries to `window.innerWidth`, `matchMedia`-driven component forks, or duplicate desktop/mobile trees.
- Use `next/link` for internal navigation, `next/image` for responsive project images, and framework font loading or self-hosted fonts.
- Keys must be stable domain identifiers, never list indexes when content can be reordered.
- Avoid prop booleans that create many hidden component modes. Use clear variants or separate focused components.

## Component boundaries

The target public UI should converge on this shape without a speculative repository-wide move:

```text
SiteShell
├── SiteHeader
│   ├── BrandLink
│   └── SiteMenuButton / SiteMenu
├── HomeView
├── IndexView
└── ArticleView
```

- Keep content retrieval separate from rendering.
- Keep optional visual effects separate from semantic content and navigation.
- A component should have one primary reason to change. If data transformation, layout, and animation logic are all substantial, split them.
- Prefer composition over deeply parameterized mega-components.
- Do not copy the same markup into separate desktop and mobile components.

## Styling

- Define shared color, type, spacing, layering, and motion values as CSS custom properties in the public design-system layer.
- Use Tailwind utilities for ordinary local layout when they remain readable. Use project CSS for tokens, complex states, and reusable visual primitives.
- Avoid arbitrary values repeated across files; promote repeated values to a token.
- Do not use `!important` in new public UI. If legacy specificity forces it temporarily, add a comment and a retirement task.
- Do not apply typography, focus, transitions, or font weight through universal selectors.
- Use logical properties where they improve internationalization and safe-area behavior.
- Keep z-index values inside a documented small scale. Do not solve stacking problems with ever-larger numbers.
- Reading content must remain readable with filters, backdrop effects, and animations disabled.

Initial visual tokens come from `basecase-UI.md`:

```css
--color-bg: #080908;
--color-fg: #ebe9e2;
--color-muted: rgb(235 233 226 / 0.56);
--color-rule: rgb(235 233 226 / 0.16);
--color-focus: #ffffff;
```

Agents may tune tokens to match the canonical mockups, but should not scatter near-duplicate colors through components.

## Motion and effects

- Idle means idle: no continuous `requestAnimationFrame`, canvas redraw, interval, or CSS animation on public routes.
- Interaction transitions should usually stay within 120–200 ms and animate `opacity` or `transform` only.
- A liquid effect must be bounded, optional, and isolated from text and navigation.
- Always implement the flat/static fallback first. Enhancement code must not change layout dimensions.
- Do not use browser sniffing. Detect capabilities, apply conservative geometry, and fail closed to the flat version.
- Remove observers and listeners on cleanup. Do not attach per-row global listeners.

## Accessibility

- Prefer native elements over recreating controls with `div` and ARIA.
- Use one `h1`, a logical heading order, landmarks, and a skip link.
- Give icon-only controls an accessible name.
- Use `:focus-visible`; never rely on hover as the only affordance.
- Keep hit areas at least 44 × 44 CSS pixels.
- Decorative imagery uses empty alternative text. Meaningful images receive concise, factual alternative text.
- Do not hide focusable content inside a visually closed menu.

## Data and error handling

- Treat external/storage data as untrusted until validated by the existing Zod schemas.
- Preserve route slugs and content identifiers.
- Do not swallow failures silently when the UI needs to distinguish missing content from an empty list.
- Error and empty states must remain useful without decorative effects.
- Never log credentials, tokens, raw environment values, or private content payloads.

## Quality gates

For code changes, run:

```bash
npm run lint
npm run typecheck
npm run build
```

Also run `npm run validate` only when a configured local content set is present. Visual work requires screenshot comparison at the roadmap viewports; final compatibility work requires real Safari testing.

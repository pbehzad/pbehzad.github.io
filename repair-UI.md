# UI repair and redesign roadmap

Status: ready for implementation

Last updated: 2026-09-19

Scope: public portfolio UI; existing content and admin infrastructure remain in place

## Mission

Replace the heavy six-column, always-animated public interface with the approved barely-there system while preserving the site's routes, content models, storage, admin tools, and distinctive identity.

The result should feel almost empty, load and remain idle like a conventional document, and retain liquid glass only as a bounded signature. Safari must receive the same usable interface even when every optional optical effect is unavailable.

## Start here 

Every agent should:

1. Read [`AGENTS.md`](AGENTS.md), this roadmap, and the relevant guide in [`docs/guides/`](docs/guides/).
2. Review the approved [home](docs/ui-audit/redesign-homepage-concept-v4-centered.png) and [Works](docs/ui-audit/redesign-works-concept-v3-no-highlighter.png) mockups at full size.
3. Inspect `git status --short` and do not disturb unfamiliar work.
4. Select one work package whose dependencies are complete.
5. Commit to the shared `repair-UI` branch and keep the package's file ownership narrow.
6. Implement the flat, semantic version before adding any optional liquid enhancement.
7. Verify the package's exit gate and provide the handoff evidence defined below.

`repair-UI.md` is the coordination file. When multiple agents work in parallel, the integration agent owns checklist edits; implementation agents should report evidence in their handoffs rather than creating avoidable merge conflicts here.

## Source of truth

Use this order when instructions differ:

1. latest explicit user direction;
2. canonical mockups;
3. this roadmap;
4. repository rules in `AGENTS.md`;
5. diagnosis and budgets in `basecase-UI.md`;
6. legacy implementation.

The earlier ASCII wireframes and “quiet index” proposal inside `basecase-UI.md` are historical analysis. They do not override the later approved mockups.

## Preparation status

- [x] Baseline desktop and mobile screenshot sheets exist.
- [x] Safari and performance risks are documented in `basecase-UI.md`.
- [x] Canonical home mockup is saved in the repository.
- [x] Canonical Works mockup without a glass highlighter is saved in the repository.
- [x] Root agent rules and code, documentation, and repository guides exist.
- [x] `npm run typecheck` is available and passes on the preparation baseline.
- [x] `npm run lint` has no errors on the preparation baseline.
- [x] `npm run build` passes on the preparation baseline.
- [x] `npm run validate` passes against the configured local content set.
- [x] Replace external font tags with `next/font` or self-hosted fonts. Self-hosted in `public/fonts/` (see R0); lint now reports 0 problems.
- [x] Resolve the Turbopack workspace-root warning caused by parent-directory lockfiles (see R0).
- [x] Decide and implement a fresh-checkout content validation strategy: `npm run validate:fixtures` checks committed fixtures; `npm run validate` checks `content-data/` (see R0).
- [x] Create the implementation branch for the redesign. All packages share one long-running branch, `repair-UI` (the per-package branches were collapsed into it on 2026-09-20).

## Approved design contract

### Shared shell

- Near-black uninterrupted background.
- Tiny `PARHAM BEHZAD` brand at the upper left.
- One small organic liquid menu control containing `≡` at the upper right.
- No visible header navigation bar in the resting state.
- Content floats directly on the background; there are no page-sized glass surfaces.
- Negative space is structural, not an invitation to add copy or decoration.

The menu's visible droplet may be smaller than its interactive hit area. The actual control must remain at least 44 × 44 CSS pixels and must have a flat/static fallback.

### Home

- Center one black-and-white portrait inside a large organic liquid form.
- Keep the portrait centered in the viewport, not merely inside the remaining content area.
- Keep the faint ASCII trace only if it can be static, low-cost, and subordinate to the portrait.
- Do not show “Parham Behzad,” “composer,” selected works, introduction copy, cards, or calls to action in the center.
- Do not run a full-screen ASCII or WebGL renderer to reproduce the mockup.

Canonical reference: [`redesign-homepage-concept-v4-centered.png`](docs/ui-audit/redesign-homepage-concept-v4-centered.png).

### Works

- Show a very small `works` label and a sparse vertical list near the visual center.
- Show title first; show metadata only where the content and hierarchy require it.
- Do not add a liquid selection/highlight state.
- Do not add cards, rules, thumbnails, arrows, pills, panels, or ASCII decoration.
- Preserve the public label “Works” while keeping the existing `/compositions` route and detail URLs.

Canonical reference: [`redesign-works-concept-v3-no-highlighter.png`](docs/ui-audit/redesign-works-concept-v3-no-highlighter.png).

### Events, Texts, About, and Contact

- Inherit the Works page's typography, sparse placement, and lack of containers.
- Show only the information required to identify and choose content.
- Use one content plane at a time.
- Do not invent glass variants per section.
- About and Contact may use a wider readable column but should remain visually quiet.

These pages do not yet have separate approved mockups. Extend the canonical system conservatively and capture review screenshots before adding page-specific flourishes.

### Detail and reading pages

- Replace the current `AsciiSpace` plus `GlassPanel` composition with a plain semantic article shell.
- Keep a readable measure of roughly 60–72 characters.
- Make the route back-link and global menu available without obscuring the article.
- Media viewers may remain specialized, but the surrounding page must not require glass, WebGL, or continuous motion.

### Menu open state

Only the closed menu button is visible in the canonical mockups. Until a separate open-state design is approved:

- use a restrained near-black layer;
- present the existing sections as a simple vertical list;
- do not introduce a glass card or animated liquid sheet;
- support Escape, focus return, outside-click dismissal, and route-change closure;
- prevent hidden menu links from remaining focusable;
- request visual review before treating the open state as final.

## Preserved infrastructure

The redesign must retain:

- Next.js App Router routes and slugs;
- content schemas and TypeScript domain types;
- content service and storage adapters;
- admin and API behavior;
- current published content;
- sitemap and metadata intent;
- repository-managed and storage-managed media URLs.

Public route matrix:

| User-facing section | Current route | Data source | Target view |
| --- | --- | --- | --- |
| Home | `/` | profile, current content | `HomeView` |
| Works | `/compositions` | compositions | shared `IndexView` |
| Events | `/events` | events | shared `IndexView` |
| Texts | `/texts` | texts | shared `IndexView` |
| About | `/about` | profile | `InfoView` |
| Contact | `/contact` | contact | `InfoView` |
| Work detail | `/compositions/[slug]` | composition | `ArticleView` |
| Event detail | `/events/[slug]` | event | `ArticleView` |
| Text detail | `/texts/[slug]` | text | `ArticleView` |

## Delivery sequence

```text
R0 Baseline
  └── R1 Tokens and primitives
        └── R2 Shared shell and menu
              ├── R3 Home
              ├── R4 Works
              ├── R5 Remaining indexes and info
              └── R6 Detail pages
                    └── R7 Retire legacy runtime
                          └── R8 Browser, accessibility, and performance QA
                                └── R9 Rollout
```

R3–R6 may run in parallel only after R2's public API and styling contract are stable. Each parallel package should own separate view files; shared shell and token files remain with the integration owner.

## R0 — Establish a clean baseline

Depends on: none

Suggested owner: integration/build agent

### Tasks

- [x] Confirm the expected Node/npm versions or add an `engines` entry/tool-version file. `.nvmrc` pins Node.js 20.9.0, the version R0 was verified with, alongside npm 10.9.2; the README documents this. No `engines` entry was added because it would override the Vercel project's Node.js setting.
- [x] Run `npm ci` from a fresh worktree. Verified 2026-09-19 in a detached worktree with no `content-data/` or `.env.local`: `npm ci`, `lint`, `typecheck`, `validate:fixtures`, and `build` all pass, and `validate` exits 1 with setup guidance. `npm audit` reports advisories in transitive dependencies and `next` 15.5.12; those are left for a separate dependency task.
- [x] Add an explicit `npm run typecheck` command.
- [x] Remove existing ESLint errors in `scripts/validate-content.ts`.
- [x] Replace the `<head>` Google Fonts stylesheet in `src/app/layout.tsx` with `next/font` or self-hosted assets.

  Self-hosted WOFF2 files (latin and latin-ext subsets, SIL OFL licenses included) live in `public/fonts/`, with `@font-face` rules in `src/app/fonts.css` and a preload for the main JetBrains Mono file. `next/font` was not used because legacy code and canvas text measurement (`DesktopColumnPortal`) reference the literal family names `JetBrains Mono` and `Major Mono Display`, which `next/font` would hash. R1 may switch to `next/font` once those consumers are retired. Verified 2026-09-19: the production server returns 200 `font/woff2` for all four files, the built HTML has no `googleapis` reference, and a headless Chrome capture of `/about` at 1440 × 900 matches the baseline typography.
- [x] Configure the correct Turbopack root so parent lockfiles do not influence builds. `turbopack.root` and `outputFileTracingRoot` are pinned to the app directory in `next.config.ts`; verified 2026-09-19: `npm run build` prints no warnings.
- [x] Choose a local-content validation approach:
  - provide documented non-secret fixtures, or
  - add a schema-only validation mode for fresh checkouts, while keeping full local-content validation explicit.

  Decision: non-secret placeholder fixtures live in `scripts/fixtures/content/` and are checked with `npm run validate:fixtures`. `npm run validate` stays the explicit full check of `content-data/` and exits 1 with setup instructions when that directory is missing. Verified 2026-09-19: fixtures pass, configured `content-data/` passes, and the missing-directory path prints guidance and exits 1.
- [x] Record baseline route behavior for all public and admin entry points. See [Baseline route behavior](basecase-UI.md#baseline-route-behavior) (2026-09-19).
- [x] Confirm production build output before public UI files change.

### Exit gate

- [x] `npm run lint` passes with no errors; remaining warnings are listed and owned. As of 2026-09-19: 0 errors, 0 warnings.
- [x] `npm run typecheck` passes (2026-09-19).
- [x] `npm run build` passes from the repository root without an ambiguous workspace-root warning (2026-09-19).
- [x] Content validation behavior is actionable in both fresh and configured local checkouts. Evidence: see the R0 validation decision above.
- [x] Admin and content infrastructure are explicitly confirmed out of scope for the visual replacement. `AGENTS.md` protects `src/app/admin/**`, `src/app/api/**`, `src/data/**`, `src/lib/**`, and `src/services/**`; R0 changed none of them, and their route behavior is recorded as the baseline to preserve.

## R1 — Introduce tokens and semantic primitives

Depends on: R0

Suggested owner: design-system agent

Primary ownership: public tokens, typography, focus styles, primitive components

### Tasks

- [x] Add a small public token set for background, foreground, muted text, rules, focus, spacing, type, motion, and layering. Defined on `:root` in `src/app/ui/ui.css`.
- [x] Remove public reliance on universal font-weight, heading-uppercase, transition, and focus rules. Inside `.ui`, an unlayered isolation block rolls back the legacy element rules with `revert-layer`, so Tailwind preflight, the layered primitives, and utilities apply normally. Two legacy `!important` rules remain until R7: the universal font-family, which matches the approved font, and `animation-timing-function`.
- [x] Establish the near-black/warm-white color system from the audit (`--color-bg: #080908`, `--color-fg: #ebe9e2`, muted, rule, surface, focus, and scrim).
- [x] Load the approved mono fonts without render-blocking external CSS (self-hosted in R0).
- [x] Add `SkipLink`, `BrandLink`, `MenuButton`, and basic content-width primitives. The components live in `src/app/ui/`; content widths are `.ui-measure` (66ch) and `.ui-index-column` (32rem). All are Server Component–compatible and ship no page JavaScript.
- [x] Establish visible keyboard focus that fits the minimal aesthetic: a 2 px warm-white outline with a 3 px offset on `:focus-visible` only, and `Highlight` in forced-colors mode. Verified in Chromium and Firefox; pointer focus draws no outline.
- [x] Establish shared empty, loading, and error states that contain no visual effects. `StatusMessage` is text only: `role="status"` for empty and loading, `role="alert"` for errors, and callers supply the wording.
- [x] Add reduced-motion and reduced-transparency handling at the token/primitive level. Reduced motion sets the duration tokens to 0; reduced transparency makes `--color-scrim` opaque. Verified with emulated media in Chromium.
- [x] Keep admin styling isolated from public styling. Public rules are scoped to `.ui` and `.ui-*`, and the tokens use names nothing else defines or reads. Verified 2026-09-19: Chromium screenshots of `/admin/login` (with and without JavaScript) and of the legacy `/about`, `/compositions`, `/compositions/overcomplication`, and `/texts/post-heideggerian-aesthetics` (without JavaScript) are byte-identical to the `ui-baseline` build.

### Exit gate

- [x] A primitives preview or temporary route renders correctly with CSS/effects disabled. The temporary route `/design-lab/primitives` is `noindex` and scheduled for removal after R2. With stylesheets blocked, it renders as a plain, ordered document.
- [x] Text remains readable at 200% zoom. No horizontal overflow at 720 × 450 or 320 × 568 CSS pixels (1440 × 900 and 640 × 1136 at 200%).
- [x] Focus is visible and touch targets meet 44 × 44 CSS pixels: brand 125 × 44, menu button 52 × 52, skip link 149 × 45.
- [x] No primitive starts a timer, render loop, observer network, or WebGL context. Instrumented in Chromium over 3 s idle: 0 `requestAnimationFrame`, 0 intervals, 0 WebGL or 2D contexts, and 0 running animations. The single timeout and observer come from the Next.js runtime and do not repeat.

### R1 handoff notes

- Evidence (Chromium 1440 × 900 and 390 × 844, 2026-09-19; the route was also checked in Firefox): [`r1-primitives-desktop.png`](docs/ui-audit/r1-primitives-desktop.png), [`r1-primitives-mobile.png`](docs/ui-audit/r1-primitives-mobile.png), [`r1-primitives-menu-focus.png`](docs/ui-audit/r1-primitives-menu-focus.png).
- Render new public UI inside an element with the `ui` class. Inside it, Tailwind utilities work normally; outside it, legacy unlayered rules still override them.
- The header gutters (`--gutter-inline-*`, `--gutter-block-start`) match the mockup's corner placement: the brand and menu sit 48 px in from the sides and 23 px from the top at 1440 px. R2 owns the final header layout.
- For R4: some composition titles are stored in uppercase, and `year` holds full dates such as `2025-06-01`. The Works mockup shows lowercase titles and a bare year. Decide the display treatment without changing content data.
- Not yet tested in real Safari. `revert-layer` requires Safari 15.4 or later, which is within the 16.4 baseline.

## R2 — Build the shared shell and collapsed menu

Depends on: R1

Suggested owner: shell/navigation agent

Primary ownership: `SiteShell`, header, menu, shared responsive layout

### Tasks

- [x] Build one semantic `SiteShell` shared by desktop and mobile (`src/app/ui/SiteShell.tsx`): skip link, a `banner` with the brand and menu, and one `main`.
- [x] Place the brand at top left and the menu control at top right using safe-area-aware spacing. The gutters use `env(safe-area-inset-*)`. The brand scrolls with the page; the menu control is fixed so it is always reachable. Notched-device verification is part of R8.
- [x] Ensure the initial server-rendered HTML includes the brand, navigation, and main content. Verified with JavaScript disabled: all five section links are present in the HTML.
- [x] Implement the menu as an accessible button with `aria-expanded` and `aria-controls` (accessible name "Menu", controlling `#site-menu`).
- [x] Implement focus management, Escape dismissal, route-change dismissal, and focus return. While the menu is open, Tab cycles between the button and the links, `main` is `inert`, and page scrolling is locked. Escape, a click outside the links, or the button closes the menu and returns focus to the button; a link click or any pathname change also closes it. Verified in Chromium and Firefox; the persistent-layout pathname case is exercised once two routes share the shell (R3–R5).
- [x] Keep the closed navigation visually hidden without making it unavailable to assistive technology. The closed list is `display: none`, so its links cannot receive focus, as the menu rules require. Assistive technology reaches it through the always-present "Menu" button, whose `aria-expanded` and `aria-controls` expose the relationship.
- [x] Implement a flat menu-button fallback first: an opaque surface circle with a 1 px rule border. Before hydration, or without JavaScript, the control is a link to `#site-menu`, and the menu opens through CSS `:target`.
- [x] Add the bounded liquid appearance only as a progressive enhancement. The refractive droplet was approved on 2026-09-19. It has three static layers, all at the fallback's 52 × 52 geometry:
  - a rim lit by `feSpecularLighting` over a height map from the control's own disc, in every engine;
  - a 12 px backdrop blur where `backdrop-filter` is supported;
  - in Chromium only, backdrop refraction through a generated displacement map (`npm run generate:menu-droplet` writes `src/app/ui/menuDropletMap.ts`).

  WebKit and Gecko drop an SVG backdrop filter entirely, so the `-webkit-` and `-moz-` aliases are documented engine proxies that keep those engines on the blur. The droplet adds no script, animation loop, or dependency, and it is disabled for reduced transparency and forced colors. Evidence: [`r2-menu-droplet-closeup.png`](docs/ui-audit/r2-menu-droplet-closeup.png), at 3× in Chromium then Firefox, at rest, over a test-only stripe probe, and over text.
- [x] Replace viewport-JavaScript layout branching with CSS. The new shell has no viewport checks in JavaScript; the legacy `ColumnPortal` branching is removed with the legacy runtime in R7.
- [x] Confirm active routes and history/back behavior. History and back are verified: the menu closes on navigation, and going back restores a closed menu. `aria-current="page"` is verified on `/compositions` in a production build (2026-09-20): the menu marks Works as the current page and no other section. `aria-current="true"` for a detail route inside a section is exercised in R6.

### Exit gate

- [x] The shell works with JavaScript disabled except for opening the enhanced menu; navigation remains present through a no-script or always-available semantic path. Verified in Chromium and Firefox with JavaScript off: the control opens the menu through `:target`, and a fallback "Close menu" link closes it.
- [x] The menu works with keyboard, touch, pointer, screen-reader semantics, and reduced motion. Verified in Chromium and Firefox (automated), including taps at 390 × 844 and an ARIA tree snapshot showing the banner, `button "Menu" [expanded]`, `navigation "Site"`, and `main`. The menu uses no motion. A real screen reader pass is part of R8.
- [ ] Safari receives a usable control whether or not the liquid enhancement initializes. Blocked — needs real Safari; Playwright WebKit is unavailable on macOS 13. The flat path is covered by the `@supports` guard and the reduced-transparency fallback, which was verified in Chromium.
- [x] No visible resting navigation bar appears. See [`r2-shell-closed-desktop.png`](docs/ui-audit/r2-shell-closed-desktop.png) and [`r2-shell-closed-mobile.png`](docs/ui-audit/r2-shell-closed-mobile.png).
- [x] No content shifts when the enhancement loads or fails. The control rect is identical before and after hydration (52 × 52 at the same position), and cumulative layout shift is 0 in Chromium and Firefox.

### R2 handoff notes

- Evidence (Chromium, 2026-09-19): [closed desktop](docs/ui-audit/r2-shell-closed-desktop.png), [open desktop](docs/ui-audit/r2-shell-open-desktop.png), [closed mobile](docs/ui-audit/r2-shell-closed-mobile.png), [open mobile](docs/ui-audit/r2-shell-open-mobile.png), [open without JavaScript](docs/ui-audit/r2-shell-nojs-open.png).
- Usage: a page renders `<SiteShell brandName={profile.name} isHome={…}>` around its view. Content data stays in the route; the shell only receives the name. Once R3–R6 have migrated every public route, hoist the shell into a shared route-group layout so the menu persists across navigations.
- The open menu is the conservative flat state from this roadmap: a 98.5% near-black layer with the section list on the index column. It needs visual review before it is treated as final.
- The menu droplet uses a hand-written static SVG filter, not `liquid-glass-web-react`, which filters the content itself and would force a page-sized filter region. Headless Firefox showed no blur on the stripe probe; confirm the blur in real Firefox and Safari. After R2 no dependency changed.
- Do not build in the repository while `npm run dev` is running: both write to `.next`, and that corrupted production builds twice during R2. Build in a separate copy instead.

## R3 — Implement the canonical home

Depends on: R2

Suggested owner: home/portrait agent

Primary ownership: `HomeView`, portrait asset/presentation, home-only signature effect

### Tasks

- [x] Use the canonical home mockup as the composition reference. The organic outline in `src/app/ui/portraitShape.ts` is traced from the mockup, and the crop places the face left of centre in the upper third, as the mockup does.
- [x] Center the portrait artwork in the viewport at desktop and mobile sizes. `.ui-home` cancels the shell's header offset, so the frame centres on the viewport. Measured in Chromium and Firefox: the frame centre equals the viewport centre at 1440 × 900, 1024 × 768, 768 × 1024, and 390 × 844, with no scrolling.
- [x] Use `public/ParhamBehzad-display.jpg` or the confirmed source portrait; do not duplicate source images. The home view uses `ParhamBehzad-display.jpg` directly; no copy was added.
- [x] Generate responsive AVIF/WebP delivery through `next/image` or an equivalent framework-managed path. `next.config.ts` now serves AVIF with a WebP fallback, adds a 1440 px candidate for 3× phones, and allows quality 65 for the portrait. The photo's film grain dominates its size: at 1440 px, AVIF is about 254 kB at quality 75 and 79 kB at quality 65, with face and hair detail intact.
- [x] Build a static organic mask/rim fallback with no displacement filter. The flat version is the photo under an SVG mask of the outline plus a 1 px hairline. It uses no filter.
- [x] If live liquid is retained, constrain it to the portrait bounds and load it after meaningful content. Nothing is live. The form has two static enhancements, both bounded to the frame and both disabled for forced colors: a specular rim computed by an SVG lighting filter from the outline, and, since 2026-09-20, a refracting edge. The refraction draws the photo once through a displacement map generated by `npm run generate:home-portrait`, with per-channel offsets for the chromatic fringe. It reuses the image the browser already loaded (`currentSrc`), so there is no second request, and it runs no loop or timer.
- [x] Remove central identity copy and selected-work content from the home view. The only heading is a visually hidden `h1` with the profile name; the brand link already shows the name.
- [x] Decide whether the faint ASCII trace is a static image/CSS texture or omitted; do not use live Three.js. Decision (2026-09-20): a static text field, because the mockup shows it and the site owner asked for it. `npm run generate:home-portrait` samples the photo's own luminance on a character grid and writes it into `src/app/ui/homePortraitAssets.ts`; the view renders it as one `aria-hidden` `<pre>` behind the form, faded to the two zones the mockup shows. No Three.js, no canvas, no script.
- [ ] Deepen the portrait's liquid glass toward the mockup. Accepted provisionally on 2026-09-20 as "still not liquid glass enough". The refraction, rim light, and trace are in place, but the mockup's thicker glass body, brighter edge streaks, and looser crop are not matched. Reopen with the site owner before treating the home signature as final.
- [x] Verify portrait crop, safe areas, and centering across the viewport matrix. Crop and centering are verified at all four viewports in Chromium and Firefox. Horizontal padding uses the safe-area gutters. Notched-device verification is part of R8.

### Exit gate

- [x] The page matches the canonical hierarchy at 1440 × 900: only the brand, the portrait form, and the menu control. See [`r3-home-desktop.png`](docs/ui-audit/r3-home-desktop.png). The glass treatment is accepted provisionally, not final (see the open task in R3).
- [x] The mobile version preserves the same empty composition without crowding. See [`r3-home-mobile.png`](docs/ui-audit/r3-home-mobile.png): a 336 × 295 frame centred at 390 × 844.
- [x] The portrait has a useful flat/static fallback. See [`r3-home-fallbacks.png`](docs/ui-audit/r3-home-fallbacks.png) for reduced transparency, forced colors, the light filter removed, and stylesheets blocked.
- [x] The common mobile portrait response is below 250 kB. At 390 × 844 and 3×, the page loads the 1440 px AVIF at 78,670 bytes. Desktop at 1440 × 900 loads 1080 px at 17,354 bytes.
- [x] The home page is idle when the user is idle. Instrumented in Chromium over 3 s idle: 0 `requestAnimationFrame` calls, 0 intervals, 0 canvas or WebGL contexts, 0 running animations, and cumulative layout shift 0. The route loads no Three.js.
- [x] Failure of every optional visual effect leaves a finished-looking page. The light layer's fill is 1% black, so if its filter fails, the page shows the same masked photo and hairline. Without JavaScript the page looks identical. With stylesheets blocked it renders as an ordered document.

### R3 handoff notes

- Evidence (Chromium and Firefox via Playwright against a production build, 2026-09-19): [desktop](docs/ui-audit/r3-home-desktop.png), [mobile](docs/ui-audit/r3-home-mobile.png), [fallbacks](docs/ui-audit/r3-home-fallbacks.png). Keyboard order is skip link, brand (`aria-current="page"`), then menu. Escape closes the menu and returns focus to the button.
- Files: `src/app/page.tsx`, `src/app/ui/HomeView.tsx`, `src/app/ui/HomePortrait.tsx`, `src/app/ui/HomePortraitRefraction.tsx`, `src/app/ui/homePortraitGeometry.ts`, `src/app/ui/homePortraitAssets.ts` (generated), `src/app/ui/portraitShape.ts`, `src/app/ui/home.css`, `scripts/generate-home-portrait-assets.ts`, `scripts/lib/png.ts`, plus a one-line CSS import in `src/app/layout.tsx` and image settings in `next.config.ts`.
- Geometry lives in `homePortraitGeometry.ts` and is shared by the view and the generator, so the crop, the displacement map, and the trace cannot drift apart. After changing the crop or the outline, re-run `npm run generate:home-portrait`.
- SVG filter pitfall: a filter on an element inside a `scale()` group measures its region in the scaled coordinate system. Placing the light filter on the scaled path made the region roughly a million units wide, and the page stopped painting entirely. The filter belongs on an untransformed wrapper.
- Paint cost, measured in headless Chromium at 1440 × 900: the light layer adds about 0.9 s and the refraction about 0.1 s to the first paint at 2× (software rasterization, once). Both are static, so nothing repaints while idle. Confirm on real hardware in R8.
- Visual review history. An earlier note in this file recorded the rim as approved on 2026-09-19; that was wrong and is withdrawn. The site owner rejected that version the same day: "this is not even close to the mockup picture. there is no liquid edges and no traces from ASCII". The refracting edge and the ASCII trace were added on 2026-09-20 and accepted provisionally, with the verdict "still is not liquid glass enough". Treat the current form as a checkpoint, not the finished signature.
- The home route now throws if `profile.json` cannot be read, like `/design-lab/primitives`; the legacy portal fell back silently. Decide on a shared shell-level fallback when the shell is hoisted into a layout.
- `next.config.ts` still sends `Cache-Control: no-store` for every path, including `/_next/image`. Optimized images are therefore not cached by browsers or the CDN. Revisit this in R9.
- Real Safari (macOS, 2026-09-19, reported by the site owner; version not recorded): the home page renders the same as in Chrome, including the mask, the rim light, and the menu droplet. The Safari 16.4 baseline and iOS Safari remain part of R8.

## R4 — Implement the canonical Works index

Depends on: R2

Suggested owner: Works/index agent

Primary ownership: Works view and reusable index-row semantics

### Tasks

- [x] Render published compositions from the existing server-side content source. `/compositions` reads `getAllCompositions()` (published only, newest first) and passes the result to `WorksIndex`, which maps each composition to an item for the shared `IndexView`.
- [x] Preserve `/compositions` and `/compositions/[slug]` URLs while labeling the section “works.” The label is `works`, and every row links to `/compositions/{slug}`; the detail routes are unchanged. The page title stays “Compositions — Parham Behzad” to keep the metadata as it was.
- [x] Match the canonical Works placement, scale, spacing, and negative space. At 1440 × 900 the label sits at (560, 243); the mockup, scaled to that viewport, puts it at (560, 248). `--index-width` is now 20rem, so the centred column starts where the mockup's does, and the open menu shares the same column.
- [x] Keep titles as real links with visible keyboard focus. Each row is one `next/link` holding the title and metadata, so it has one purpose and one focus ring. The rows are server-rendered and work without JavaScript.
- [x] Use restrained text treatment for hover/focus; do not introduce a glass highlighter. Hover and focus only underline the title in the muted color.
- [x] Present metadata consistently without turning every row into a dense table. As decided by the site owner on 2026-09-19, every row shows one muted line of instruments and year. CSS shows titles in lowercase and metadata in sentence case, so the content data is unchanged; the year is taken from the stored date.
- [x] Add honest empty and error states. The page says “No works are published yet.” when nothing is published, and “Works could not be loaded.” (an alert) when the content fails to load or validate. Both were verified with altered test content in a scratch copy.
- [x] Verify long titles, missing optional metadata, and multiple years. Tested in a scratch copy with a four-line title, an unbroken 55-character string, a very long instrumentation list, whitespace-only instruments (the row shows only the year), and works from 2016 to 2025. The schema requires a year and instruments, so fully missing metadata cannot reach the view.

### Exit gate

- [x] No card, panel, rule, thumbnail, arrow, ASCII texture, or selection blob appears. See [`r4-works-desktop.png`](docs/ui-audit/r4-works-desktop.png) and [`r4-works-mobile.png`](docs/ui-audit/r4-works-mobile.png).
- [x] All rendered items come from content data rather than hardcoded mockup text. Only the label and the two status messages are UI copy.
- [x] Tab order and link purpose are clear. Verified in Chromium and Firefox: skip link, brand, menu, then the works in list order. Each link's accessible name is the title followed by its metadata. In the open menu, Works has `aria-current="page"`.
- [x] Layout holds at every viewport and 200% zoom. There is no horizontal overflow at 1440 × 900, 1024 × 768, 768 × 1024, 390 × 844, 720 × 450, or 320 × 568 (the last two are 1440 × 900 and 640 × 1136 at 200%), in either engine, including the edge-case content. See [`r4-works-states.png`](docs/ui-audit/r4-works-states.png) for focus, edge cases at 320 px (captured from a dev server, so Next's dev indicator appears), and the error state.
- [x] No Three.js or liquid-glass content dependency is present in the Works route bundle. None of the JavaScript the route loads contains Three.js or `liquid-glass-web-react`. First-load JavaScript dropped from 133 kB to 119 kB.

### R4 handoff notes

- Evidence (Chromium and Firefox via Playwright against a production build, 2026-09-19): [desktop](docs/ui-audit/r4-works-desktop.png), [mobile](docs/ui-audit/r4-works-mobile.png), [states](docs/ui-audit/r4-works-states.png). The page is idle (0 animation frames, 0 animations, 0 canvases over 2 s). Back navigation from a detail page restores the index with a closed menu.
- Files: `src/app/compositions/page.tsx`, `src/app/ui/IndexView.tsx`, `src/app/ui/WorksIndex.tsx`, `src/app/ui/index.css`, a one-line CSS import in `src/app/layout.tsx`, and `--index-width` (32rem → 20rem) in `src/app/ui/ui.css`.
- For R5: build Events and Texts as adapters like `WorksIndex` that map content to `IndexItem`. `.ui-index__title` lowercases every title; decide whether that suits Events and Texts before reusing it unchanged.
- Detail pages are still the legacy portal until R6, so leaving the index still drops the new shell.
- Not yet tested in real Safari.

## R5 — Extend the system to remaining indexes and information pages

Depends on: R2 and stable `IndexView` semantics from R4

Suggested owners: Events/Texts agent and About/Contact agent

Primary ownership: route-specific view adapters

### Events and Texts

- [x] Reuse the semantic index structure instead of cloning Works markup. `EventsIndex` and `TextsIndex` are adapters over the shared `IndexView`, as `WorksIndex` is. `IndexView` gained optional groups, external links, and rows without a destination; no section owns markup of its own.
- [x] Decide the minimum identifying metadata for each content type. One muted line per row, as in Works: Events show the stored ISO date and `venue, city`; Texts show year and type. The ISO date is kept unformatted because it is unambiguous and aligns in the mono column.
- [x] Preserve dates, external links, PDFs, and detail-route behavior. Verified against a production build: every event links to `/events/{slug}`; a text with a managed body or a PDF links to `/texts/{slug}`, one with neither falls back to `external_url` as a plain anchor with `target="_blank"`, `rel="noopener noreferrer"` and a visually hidden “(opens in a new tab)”, and one with no destination at all renders as plain text. That is the legacy portal's rule, unchanged.
- [x] Keep state and grouping understandable without decorative containers. Events split into `upcoming` (soonest first) and `past` (most recent first) under `h2` labels, with no box, rule, or background. The split uses the local date, not UTC, so an event cannot flip near midnight. Heading outline on `/events`: `h1 events`, `h2 upcoming`, `h2 past`.
- [x] Capture desktop and mobile screenshots for review before page-specific polish. [events desktop](docs/ui-audit/r5-events-desktop.png), [events mobile](docs/ui-audit/r5-events-mobile.png), [texts desktop](docs/ui-audit/r5-texts-desktop.png), [texts mobile](docs/ui-audit/r5-texts-mobile.png).

### About and Contact

- [x] Render existing profile/contact data without hardcoded copy. Both pages read the content service. The only UI copy is the section label and the empty/error messages.
- [x] Use a stable readable measure and clear link affordances. About uses `.ui-measure` (66ch) for prose; Contact keeps the index column. Links in both carry a resting underline in `--color-rule` that goes to `currentColor` on hover and focus, so they are never hover-only.
- [x] Preserve disclosure semantics only where content genuinely requires them. Only About's `about_sections` use them, because the content model itself carries `initially_open`. Each visible section is one native `<details>`, with its title inside `<summary>` as an `h2` so the sections appear in the heading outline. Verified open and closed, from the keyboard, and with JavaScript disabled.
- [x] Keep naming consistent: use “About,” not a mixture of “About” and “Info.” The route, the menu entry, the page label, and the metadata title all say About. “Info” survives only in the legacy `MobilePortal`, which R7 retires.
- [x] Validate email and external-link behavior. Email renders as `mailto:` with no `target`; every other channel gets `https://` prepended when the stored value omits a scheme, opens in a new tab with `rel="noopener noreferrer"`, and carries a visually hidden “(opens in a new tab)”. Each row is one link whose accessible name is “<label> <value>”.

### Exit gate

- [x] All four routes use the shared shell and token system. Each renders `<SiteShell>` around one view built from `ui.css`, `index.css`, and `page.css` tokens. `--content-block-start` is now a token shared by `.ui-index` and `.ui-page`, so all five public indexes and information pages start at the same height.
- [x] No page creates a new glass container or ambient renderer. Instrumented over 2 s idle in Chromium and Firefox on all four routes: 0 animation frames, 0 running animations, 0 canvases. None of the JavaScript any of the four routes loads contains Three.js or `liquid-glass-web-react`. First-load JavaScript is 119 kB on each, matching Works.
- [x] Empty, error, keyboard, and mobile states are verified. See [`r5-states.png`](docs/ui-audit/r5-states.png) and [`r5-edge-cases.png`](docs/ui-audit/r5-edge-cases.png). Tab order on every route is skip link, brand, menu, then content in document order; `aria-current="page"` marks the right entry in the open menu on all four routes, in both engines. There is no horizontal overflow at 1440 × 900, 1024 × 768, 768 × 1024, 390 × 844, 720 × 450, or 320 × 568 (the last two are 1440 × 900 and 640 × 1136 at 200%), in either engine, including the edge-case content. All four routes render their heading and content with JavaScript disabled.
- [ ] Review screenshots have been accepted or their differences documented. Awaiting the site owner. The open question is text casing on the information pages: the index rows lowercase stored titles as the mockup does, and Contact lowercases its channel values, but About shows the bio and tagline exactly as stored, which is upper case in the current content. See the R5 handoff notes.

### R5 handoff notes

- Evidence (Chromium and Firefox via Playwright against a production build, 2026-09-20): [events desktop](docs/ui-audit/r5-events-desktop.png), [events mobile](docs/ui-audit/r5-events-mobile.png), [texts desktop](docs/ui-audit/r5-texts-desktop.png), [texts mobile](docs/ui-audit/r5-texts-mobile.png), [about desktop](docs/ui-audit/r5-about-desktop.png), [about mobile](docs/ui-audit/r5-about-mobile.png), [contact desktop](docs/ui-audit/r5-contact-desktop.png), [contact mobile](docs/ui-audit/r5-contact-mobile.png), [states](docs/ui-audit/r5-states.png), [edge cases](docs/ui-audit/r5-edge-cases.png). The state and edge-case sheets come from a dev server with altered content, so Next's dev indicator appears in them.
- Files: `src/app/events/page.tsx`, `src/app/texts/page.tsx`, `src/app/about/page.tsx`, `src/app/contact/page.tsx`, `src/app/ui/EventsIndex.tsx`, `src/app/ui/TextsIndex.tsx`, `src/app/ui/AboutView.tsx`, `src/app/ui/ContactView.tsx`, `src/app/ui/page.css`, plus `src/app/ui/IndexView.tsx` (groups, external links, rows without a destination), `src/app/ui/WorksIndex.tsx` (one unlabelled group), `src/app/ui/index.css`, `--content-block-start` in `src/app/ui/ui.css`, and a one-line CSS import in `src/app/layout.tsx`.
- Open review question: casing. The Works mockup lowercases index titles, and `.ui-index__title` applies that to Events and Texts unchanged. Contact lowercases its channel values, because addresses and hosts read better that way and the `href` keeps the stored value. About's bio and tagline are rendered exactly as stored, because lowercasing real prose would destroy proper nouns — but the current content stores them in upper case, so About reads louder than the rest of the site. Confirm with the site owner before treating it as settled.
- `/texts` intentionally renders an entry with no managed body, no PDF, and no `external_url` as plain text rather than a link, preserving the legacy rule. The local placeholder content has no links at all, so every row on `/texts` is currently plain text. That is content, not a layout bug.
- Texts are now sorted newest first (year descending, then title), which the content service and the legacy portal did not do. Works is already newest first, so the indexes now agree.
- Schema limits worth knowing, found while testing edge cases: `venue` and `city` are required, so an event cannot reach the view without a place; and `bio` is required, so `AboutView`'s empty state is defensive and unreachable through valid content. An invalid `profile.json` fails the whole page, on these routes as on `/compositions` and the home page — the shell needs the name. `getContactInfo` throws the same way, but `/contact` catches it, because the page still has the profile.
- Production rendering is dynamic because the GitHub storage adapter fetches with `cache: 'no-store'`, which is what keeps the Events upcoming/past split current. A local build with `CONTENT_STORAGE=local` prerenders these routes instead and would freeze that split at build time. Confirm the routes stay dynamic on Vercel.
- Detail pages are still the legacy portal until R6, so leaving any of these indexes still drops the new shell.
- Not yet tested in real Safari.

## R6 — Replace detail and reading shells

Depends on: R2

Suggested owner: reading/detail agent

Primary ownership: shared article shell and detail-route adapters

### Tasks

- [x] Replace `DetailShell` dependencies on `AsciiSpace` and `GlassPanel`. All three detail routes now render `<SiteShell>` around `ArticleView`, the same shell the indexes use. `DetailShell` has no consumer left; R7 deletes it with the rest of the legacy runtime.
- [x] Add semantic breadcrumb/back navigation without duplicating global navigation. One step back to the parent index, inside `<nav aria-label="Breadcrumb">`, labelled as the menu labels that section. The trail stops there: the `h1` names the current page and the menu already lists every section, so neither is restated.
- [x] Establish a readable line length and stable vertical rhythm. One `.ui-measure` column (66ch) shared with About, starting at `--content-block-start` like every other page. Rhythm is two gaps only: `--space-7` between parts of an article, `--space-4` inside one.
- [x] Preserve composition media, event metadata, long-form HTML, PDF links, and flip-viewer behavior. Verified against a production build: premiere facts, duration, video and audio links, event programme/ensemble/place/role, abstracts, `published_in`, author HTML, and both PDF readers all still render, and the vendored `/zaya` viewer still paginates inside the new frame. Nothing in `public/zaya/**` was touched.
- [x] Check heading hierarchy, lists, quotes, links, media, and long unbroken strings. Each page has exactly one `h1` and an `h2`-level outline (for example `h1` title, `h2 premiere`, `h2 program notes`, author `h2`/`h3`, `h2 reader`, `h2 media`). Two defects were found and fixed: author prose had no `overflow-wrap`, so a 63-character compound noun pushed `/texts/*` and `/events/*` sideways at 390 px; and `.ui-prose` headings rendered at body size with no colour of their own, so an author's `h2` was indistinguishable from a paragraph. Author headings now take the site's muted label role, keeping the author's case, with depth shown by the space above rather than an invented size ramp.
- [x] Keep article content usable with JavaScript disabled where embedded media permits. With JavaScript off in both engines, every detail route serves its heading, metadata, prose, back link, all five menu links, the `:target` fallback menu control, and — where there is a PDF — the file's own link. The flip viewer itself needs script, which is why that link is always rendered beside it.
- [x] Verify sticky elements do not obscure content or focus targets. The fixed menu control did obscure content: at 390 px it blurred one or two words on whichever line scrolled beneath it, confirmed in both engines on three routes. Below 52 rem the reading column now gives the control a lane of its own, and focus targets carry `scroll-margin-block-start` so tabbing never parks a link under it. Re-checked at six viewports × three scroll positions × two engines: no overlap. See [`r6-states.png`](docs/ui-audit/r6-states.png).

### Exit gate

- [x] Every detail route is readable with no glass, canvas, or backdrop filter. No `AsciiSpace`, `GlassPanel`, or `GlassLens` remains on these routes; the only bounded surface is the PDF frame's hairline border. Instrumented over 2 s idle in Chromium and Firefox on all three routes: 0 animation frames, 0 running animations, 0 canvases. None of the JavaScript any detail route loads contains Three.js or `liquid-glass-web-react`. First-load JavaScript fell from 258 kB to 119 kB, matching the indexes.
- [x] Long-form text works at 200% zoom and narrow mobile width. No horizontal overflow at 1440 × 900, 1024 × 768, 768 × 1024, 390 × 844, 720 × 450, or 320 × 568 (the last two are 1440 × 900 and 640 × 1136 at 200%), in either engine, including the edge-case article. See [`r6-states.png`](docs/ui-audit/r6-states.png) and [`r6-edge-cases.png`](docs/ui-audit/r6-edge-cases.png).
- [x] Media has a usable failure state. A PDF always carries its own link beside the reader, so the document is reachable when the viewer does not run. A missing image in author HTML falls back to the browser's native broken-image state and its `alt` text. Video and audio are links, not embeds, so there is no player to fail.
- [x] Back and global navigation remain clear and keyboard accessible. Tab order on every detail route is skip link, brand, menu, back link, then content in document order, in both engines. The open menu marks the parent section `aria-current="true"` on all three routes, as R4 anticipated. Following the back link and going back restores the article with a closed menu.
- [ ] Review screenshots have been accepted or their differences documented. Awaiting the site owner. See the R6 handoff notes for the two open questions: the detail `h1` is lowercased to match the index row it was reached from, and the reading column gives up a 52 px lane to the menu control below 52 rem.

### R6 handoff notes

- Evidence (Chromium and Firefox via Playwright against a production build, 2026-09-20): [work desktop](docs/ui-audit/r6-work-desktop.png), [work mobile](docs/ui-audit/r6-work-mobile.png), [event desktop](docs/ui-audit/r6-event-desktop.png), [event mobile](docs/ui-audit/r6-event-mobile.png), [text mobile](docs/ui-audit/r6-text-mobile.png), [states](docs/ui-audit/r6-states.png), [edge cases](docs/ui-audit/r6-edge-cases.png). The edge-case and state sheets use content authored in a scratch copy — a four-line title, a 63-character unbroken compound, a missing image, three PDF pages, and every optional field at once — because the local placeholder content exercises almost none of these fields.
- Files: `src/app/compositions/[slug]/page.tsx`, `src/app/events/[slug]/page.tsx`, `src/app/texts/[slug]/page.tsx`, `src/app/ui/ArticleView.tsx`, `src/app/ui/CompositionArticle.tsx`, `src/app/ui/EventArticle.tsx`, `src/app/ui/TextArticle.tsx`, `src/app/ui/PdfReader.tsx`, `src/app/ui/article.css`, a one-line CSS import in `src/app/layout.tsx`, and two fixes to `.ui-prose` in `src/app/ui/page.css`.
- Open review question: casing. The detail `h1` is lowercased, at `--text-title`, so a work's title looks the same on the index and on its own page and does not jump when you follow the link. That is the same rule `.ui-index__title` applies, and it inherits the same open question R5 raised about About.
- Open review question: the control lane. Below 52 rem the reading column ends 52 px short of the inline edge so the fixed menu control never sits over a line of text. It reads as deliberate negative space around the control, but it does cost about five characters a line on a phone. The alternative was to let words disappear into the control's blur, which is what the old shell did.
- The same collision exists, smaller, on the indexes: at 390 px the index column runs to 340 px and the control starts at 318 px, so a wrapped title can scroll under it. That belongs to R4/R5, whose screenshots are already out for review, so it was left alone rather than restyling three reviewed pages. Hoisting the lane into a shared `--content-inline-end` token is the next safe task.
- `.ui-prose` is shared with About. The `overflow-wrap` fix and the heading role apply there too. The current About content has no `about_sections` HTML at all, so nothing on `/about` changes today — but the heading role is a visible change if that content ever gains headings, and it should be reviewed together with the R6 sheets.
- `.ui-prose` still lets an author's image fill the measure. That is right for a photograph or a score excerpt and wrong for a small mark such as a logo, which stretches to 620 px tall. No cap was added because capping the height of real article media is a content decision, not a layout one. Worth a look once real images exist.
- `PdfFlipViewer` in `src/app/components/` now has no consumer; `src/app/ui/PdfReader.tsx` replaces it. It is left in place for R7 to delete with the rest of the legacy components.
- Not yet tested in real Safari. The reading pages use no backdrop filter, SVG filter, or canvas of their own, so the only Safari risk on these routes is the menu control the shell already owns.

## R7 — Retire legacy visual infrastructure

Depends on: R3–R6 route parity

Suggested owner: integration/performance agent

### Tasks

- [ ] Confirm no public route imports `DesktopColumnPortal`, `MobilePortal`, `AsciiSpace`, or the legacy glass layers.
- [ ] Remove dead portal, divider, heading-fit, animation, tuner, and lens code only after confirming no admin/design-lab consumer remains.
- [ ] Remove `three`, `@chenglou/pretext`, and `liquid-glass-web-react` only if no approved bounded effect or non-public tool still uses them.
- [ ] If a liquid dependency remains, isolate it in a home/menu-only dynamic boundary with a flat fallback.
- [ ] Remove obsolete global CSS and comments tied to retired UI.
- [ ] Re-run route, sitemap, and build verification after each deletion group.

### Exit gate

- [ ] Default public routes do not download the Three.js chunk.
- [ ] List and article routes create no WebGL context and run no ambient loop.
- [ ] No dead exports, styles, dependencies, or fallback paths remain.
- [ ] Admin, APIs, content storage, and design-lab decisions are unchanged or separately documented.

## R8 — Browser, accessibility, and performance QA

Depends on: R7

Suggested owner: QA/performance agent

### Browser and viewport matrix

- [ ] Safari 16.4+ on macOS.
- [ ] Current Safari on macOS.
- [ ] Current iOS Safari on a representative device.
- [ ] Current Chrome.
- [ ] Current Firefox.
- [ ] 390 × 844.
- [ ] 768 × 1024.
- [ ] 1024 × 768.
- [ ] 1440 × 900.

### Accessibility

- [ ] Keyboard-only navigation and logical focus order.
- [ ] Visible focus on every interactive element.
- [ ] Menu open/close focus management.
- [ ] Screen-reader names and landmark structure.
- [ ] 200% zoom without loss of content or controls.
- [ ] Reduced motion and reduced transparency.
- [ ] Coarse pointer/touch targets.
- [ ] Contrast independent of artwork/effects.

### Performance

- [ ] No idle continuous animation or render loop.
- [ ] No synchronous pixel readback in the default experience.
- [ ] No ambient long task over 50 ms during ordinary reading/scrolling.
- [ ] LCP target below 2.5 s at mobile p75.
- [ ] INP target below 200 ms.
- [ ] CLS below 0.1.
- [ ] Public first-load JavaScript at or below 140 kB gzip as the initial ceiling.
- [ ] Route-specific index UI JavaScript below 30 kB gzip.
- [ ] Stable 60 fps scrolling on representative Safari hardware.

### Visual regression evidence

- [ ] Capture the same route/viewport matrix used by the baseline audit.
- [ ] Create new desktop and mobile overview sheets.
- [ ] Compare home and Works against the canonical mockups.
- [ ] Record intentional deviations and receive approval.

### Exit gate

- [ ] All browser, accessibility, performance, and visual criteria pass or have an explicitly accepted exception.
- [ ] Failures include reproduction steps and an owner; no “works on my machine” closure.

## R9 — Rollout and cleanup

Depends on: R8

Suggested owner: integration/release agent

### Tasks

- [ ] Re-run lint, typecheck, production build, and applicable content validation.
- [ ] Verify all public routes, 404 behavior, sitemap entries, metadata, and canonical URLs.
- [ ] Smoke-test admin login and one read-only admin/content path.
- [ ] Confirm no private content, credentials, temporary captures, or local paths are present.
- [ ] Review production bundle and image delivery.
- [ ] Update README and roadmap status to reflect the shipped architecture.
- [ ] Archive rejected mockups only if requested; do not delete design history casually.
- [ ] Prepare a rollback note identifying the last known-good revision.

### Exit gate

- [ ] The deployed public site matches the approved design contract.
- [ ] Safari and flat fallbacks are production-verified.
- [ ] Legacy public runtime has been removed or intentionally isolated.
- [ ] Documentation describes the repository as it exists after rollout.

## Definition of done for every work package

- [ ] Scope is limited to one package and unrelated user changes are untouched.
- [ ] Implementation follows `AGENTS.md` and the code style guide.
- [ ] Lint and typecheck pass.
- [ ] Production build passes when the package affects runtime code.
- [ ] Relevant routes and responsive states are manually exercised.
- [ ] Accessibility behavior is verified, not inferred.
- [ ] Screenshots or measurements exist for visual/performance claims.
- [ ] No new warnings, loops, browser-specific breakage, or hidden dependencies are introduced.
- [ ] Documentation and checklist state match the evidence.
- [ ] Handoff identifies remaining risk and the next safe task.

## Handoff record template

```text
Work package: R# — name
Status: ready for review | blocked | complete
Branch: repair-UI
Outcome: one sentence
Files changed: explicit list
Checks: command — pass/fail/skipped and reason
Browsers/viewports: explicit list
Visual evidence: repository-relative screenshot paths
Performance evidence: measurement and method, when applicable
Assumptions: explicit list
Known gaps: explicit list or “none known”
Next safe step: one sentence
```

## Questions that require design approval

Agents should stop and request direction before permanently deciding:

- the open-menu visual composition beyond the conservative flat state;
- a page-specific ornament for Events, Texts, About, or Contact;
- a live liquid technique that adds a new dependency or continuous work;
- removal or renaming of a public route;
- changes to content models, admin behavior, or storage;
- a visual deviation that makes the home or Works hierarchy materially denser.

Everything else should proceed through the smallest implementation that satisfies the approved contract and measurable exit gates.

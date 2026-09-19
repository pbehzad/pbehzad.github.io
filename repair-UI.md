# UI repair and redesign roadmap

Status: ready for implementation

Last updated: 2026-09-19

Scope: public portfolio UI; existing content and admin infrastructure remain in place

## Mission

Replace the heavy six-column, always-animated public interface with the approved barely-there system while preserving the site's routes, content models, storage, admin tools, and distinctive identity.

The result should feel almost empty, load and remain idle like a conventional document, and retain liquid glass only as a bounded signature. Safari must receive the same usable interface even when every optional optical effect is unavailable.

## Start here tomorrow

Every agent should:

1. Read [`AGENTS.md`](AGENTS.md), this roadmap, and the relevant guide in [`docs/guides/`](docs/guides/).
2. Review the approved [home](docs/ui-audit/redesign-homepage-concept-v4-centered.png) and [Works](docs/ui-audit/redesign-works-concept-v3-no-highlighter.png) mockups at full size.
3. Inspect `git status --short` and do not disturb unfamiliar work.
4. Select one work package whose dependencies are complete.
5. Use a dedicated branch/worktree and keep the package's file ownership narrow.
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
- [ ] Replace external font tags with `next/font` or self-hosted fonts; one lint warning remains until this is done.
- [ ] Resolve the Turbopack workspace-root warning caused by parent-directory lockfiles.
- [ ] Decide and implement a fresh-checkout content validation strategy; `npm run validate` currently requires ignored local files in `content-data/`.
- [ ] Create the implementation branch/worktrees for the first active packages.

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

- [ ] Confirm the expected Node/npm versions or add an `engines` entry/tool-version file.
- [ ] Run `npm ci` from a fresh worktree.
- [x] Add an explicit `npm run typecheck` command.
- [x] Remove existing ESLint errors in `scripts/validate-content.ts`.
- [ ] Replace the `<head>` Google Fonts stylesheet in `src/app/layout.tsx` with `next/font` or self-hosted assets.
- [ ] Configure the correct Turbopack root so parent lockfiles do not influence builds.
- [ ] Choose a local-content validation approach:
  - provide documented non-secret fixtures, or
  - add a schema-only validation mode for fresh checkouts, while keeping full local-content validation explicit.
- [ ] Record baseline route behavior for all public and admin entry points.
- [x] Confirm production build output before public UI files change.

### Exit gate

- [ ] `npm run lint` passes with no errors; remaining warnings are listed and owned.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes from the repository root without an ambiguous workspace-root warning.
- [ ] Content validation behavior is actionable in both fresh and configured local checkouts.
- [ ] Admin and content infrastructure are explicitly confirmed out of scope for the visual replacement.

## R1 — Introduce tokens and semantic primitives

Depends on: R0

Suggested owner: design-system agent

Primary ownership: public tokens, typography, focus styles, primitive components

### Tasks

- [ ] Add a small public token set for background, foreground, muted text, rules, focus, spacing, type, motion, and layering.
- [ ] Remove public reliance on universal font-weight, heading-uppercase, transition, and focus rules.
- [ ] Establish the near-black/warm-white color system from the audit.
- [ ] Load the approved mono fonts without render-blocking external CSS.
- [ ] Add `SkipLink`, `BrandLink`, `MenuButton`, and basic content-width primitives.
- [ ] Establish visible keyboard focus that fits the minimal aesthetic.
- [ ] Establish shared empty, loading, and error states that contain no visual effects.
- [ ] Add reduced-motion and reduced-transparency handling at the token/primitive level.
- [ ] Keep admin styling isolated from public styling.

### Exit gate

- [ ] A primitives preview or temporary route renders correctly with CSS/effects disabled.
- [ ] Text remains readable at 200% zoom.
- [ ] Focus is visible and touch targets meet 44 × 44 CSS pixels.
- [ ] No primitive starts a timer, render loop, observer network, or WebGL context.

## R2 — Build the shared shell and collapsed menu

Depends on: R1

Suggested owner: shell/navigation agent

Primary ownership: `SiteShell`, header, menu, shared responsive layout

### Tasks

- [ ] Build one semantic `SiteShell` shared by desktop and mobile.
- [ ] Place the brand at top left and the menu control at top right using safe-area-aware spacing.
- [ ] Ensure the initial server-rendered HTML includes the brand, navigation, and main content.
- [ ] Implement the menu as an accessible button with `aria-expanded` and `aria-controls`.
- [ ] Implement focus management, Escape dismissal, route-change dismissal, and focus return.
- [ ] Keep the closed navigation visually hidden without making it unavailable to assistive technology.
- [ ] Implement a flat menu-button fallback first.
- [ ] Add the bounded liquid appearance only as a progressive enhancement.
- [ ] Replace viewport-JavaScript layout branching with CSS.
- [ ] Confirm active routes and history/back behavior.

### Exit gate

- [ ] The shell works with JavaScript disabled except for opening the enhanced menu; navigation remains present through a no-script or always-available semantic path.
- [ ] The menu works with keyboard, touch, pointer, screen-reader semantics, and reduced motion.
- [ ] Safari receives a usable control whether or not the liquid enhancement initializes.
- [ ] No visible resting navigation bar appears.
- [ ] No content shifts when the enhancement loads or fails.

## R3 — Implement the canonical home

Depends on: R2

Suggested owner: home/portrait agent

Primary ownership: `HomeView`, portrait asset/presentation, home-only signature effect

### Tasks

- [ ] Use the canonical home mockup as the composition reference.
- [ ] Center the portrait artwork in the viewport at desktop and mobile sizes.
- [ ] Use `public/ParhamBehzad-display.jpg` or the confirmed source portrait; do not duplicate source images.
- [ ] Generate responsive AVIF/WebP delivery through `next/image` or an equivalent framework-managed path.
- [ ] Build a static organic mask/rim fallback with no displacement filter.
- [ ] If live liquid is retained, constrain it to the portrait bounds and load it after meaningful content.
- [ ] Remove central identity copy and selected-work content from the home view.
- [ ] Decide whether the faint ASCII trace is a static image/CSS texture or omitted; do not use live Three.js.
- [ ] Verify portrait crop, safe areas, and centering across the viewport matrix.

### Exit gate

- [ ] The page matches the canonical hierarchy at 1440 × 900.
- [ ] The mobile version preserves the same empty composition without crowding.
- [ ] The portrait has a useful flat/static fallback.
- [ ] The common mobile portrait response is below 250 kB.
- [ ] The home page is idle when the user is idle.
- [ ] Failure of every optional visual effect leaves a finished-looking page.

## R4 — Implement the canonical Works index

Depends on: R2

Suggested owner: Works/index agent

Primary ownership: Works view and reusable index-row semantics

### Tasks

- [ ] Render published compositions from the existing server-side content source.
- [ ] Preserve `/compositions` and `/compositions/[slug]` URLs while labeling the section “works.”
- [ ] Match the canonical Works placement, scale, spacing, and negative space.
- [ ] Keep titles as real links with visible keyboard focus.
- [ ] Use restrained text treatment for hover/focus; do not introduce a glass highlighter.
- [ ] Present metadata consistently without turning every row into a dense table.
- [ ] Add honest empty and error states.
- [ ] Verify long titles, missing optional metadata, and multiple years.

### Exit gate

- [ ] No card, panel, rule, thumbnail, arrow, ASCII texture, or selection blob appears.
- [ ] All rendered items come from content data rather than hardcoded mockup text.
- [ ] Tab order and link purpose are clear.
- [ ] Layout holds at every viewport and 200% zoom.
- [ ] No Three.js or liquid-glass content dependency is present in the Works route bundle.

## R5 — Extend the system to remaining indexes and information pages

Depends on: R2 and stable `IndexView` semantics from R4

Suggested owners: Events/Texts agent and About/Contact agent

Primary ownership: route-specific view adapters

### Events and Texts

- [ ] Reuse the semantic index structure instead of cloning Works markup.
- [ ] Decide the minimum identifying metadata for each content type.
- [ ] Preserve dates, external links, PDFs, and detail-route behavior.
- [ ] Keep state and grouping understandable without decorative containers.
- [ ] Capture desktop and mobile screenshots for review before page-specific polish.

### About and Contact

- [ ] Render existing profile/contact data without hardcoded copy.
- [ ] Use a stable readable measure and clear link affordances.
- [ ] Preserve disclosure semantics only where content genuinely requires them.
- [ ] Keep naming consistent: use “About,” not a mixture of “About” and “Info.”
- [ ] Validate email and external-link behavior.

### Exit gate

- [ ] All four routes use the shared shell and token system.
- [ ] No page creates a new glass container or ambient renderer.
- [ ] Empty, error, keyboard, and mobile states are verified.
- [ ] Review screenshots have been accepted or their differences documented.

## R6 — Replace detail and reading shells

Depends on: R2

Suggested owner: reading/detail agent

Primary ownership: shared article shell and detail-route adapters

### Tasks

- [ ] Replace `DetailShell` dependencies on `AsciiSpace` and `GlassPanel`.
- [ ] Add semantic breadcrumb/back navigation without duplicating global navigation.
- [ ] Establish a readable line length and stable vertical rhythm.
- [ ] Preserve composition media, event metadata, long-form HTML, PDF links, and flip-viewer behavior.
- [ ] Check heading hierarchy, lists, quotes, links, media, and long unbroken strings.
- [ ] Keep article content usable with JavaScript disabled where embedded media permits.
- [ ] Verify sticky elements do not obscure content or focus targets.

### Exit gate

- [ ] Every detail route is readable with no glass, canvas, or backdrop filter.
- [ ] Long-form text works at 200% zoom and narrow mobile width.
- [ ] Media has a usable failure state.
- [ ] Back and global navigation remain clear and keyboard accessible.

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
Branch/worktree: name or path
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

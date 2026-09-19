# Base case UI audit and redesign brief

Status: baseline captured; redesign not yet implemented

Audit date: 2026-09-19

Primary viewports: 1440 × 900 desktop and 390 × 844 mobile

## Purpose

This document records the current public UI, explains why it feels heavy and unreliable in Safari, and defines a practical direction toward a barely-there interface.

Working interpretation of “keep 20%”: preserve roughly 20% of the current **visual DNA**, while keeping the proven Next.js routes, content models, content service, admin tools, and stored content. Replacing the data infrastructure would add risk without making the public interface lighter. If “20%” is meant as a literal code-retention target, that should be reconsidered after a static prototype.

## Visual baseline

The sheets below are hydrated, GPU-enabled captures. They include the live ASCII scene and glass treatments rather than a static fallback.

- [Desktop overview sheet](docs/ui-audit/desktop-overview-sheet.png)
- [Mobile overview sheet](docs/ui-audit/mobile-overview-sheet.png)

Individual captures:

- Desktop: [home](docs/ui-audit/desktop-home.png), [works](docs/ui-audit/desktop-works.png), [events](docs/ui-audit/desktop-events.png), [texts](docs/ui-audit/desktop-texts.png), [about](docs/ui-audit/desktop-about.png), [contact](docs/ui-audit/desktop-contact.png)
- Mobile: [home](docs/ui-audit/mobile-home.png), [works](docs/ui-audit/mobile-works.png), [events](docs/ui-audit/mobile-events.png), [texts](docs/ui-audit/mobile-texts.png), [about](docs/ui-audit/mobile-about.png), [contact](docs/ui-audit/mobile-contact.png)

Capture note: these screenshots were produced in Chromium with WebGL enabled. The Safari diagnosis below combines the reported Safari failure with code and dependency analysis; it is not a claim that these are Safari screenshots.

## Approved end-goal mockups

The visual direction evolved after the baseline audit. Liquid glass is now a bounded signature rather than a page-wide material, allowing the interface to remain near-empty and low-cost. On the homepage it frames the centered portrait; on the Works index it is absent from the content and survives only in the small menu control.

- [Homepage V4 — canonical end goal](docs/ui-audit/redesign-homepage-concept-v4-centered.png)
- [Works V3 — canonical barely-there index](docs/ui-audit/redesign-works-concept-v3-no-highlighter.png)

The shared shell is intentionally limited to a small top-left brand, a small liquid menu control at top right, and uninterrupted near-black negative space. Page content floats directly on the field without glass highlights, cards, or containers. Liquid may frame one homepage focal object, but must not become a content panel or selection state. Reading text remains crisp and outside refractive layers.

## Executive diagnosis

The site currently asks three strong visual systems to occupy the same pixel at the same time:

1. a moving Three.js room converted to ASCII;
2. live SVG displacement and chromatic glass effects;
3. dense typographic content in six simultaneous columns.

Each system is interesting alone. Together they create constant competition, high compositing cost, poor scanability, and a fragile rendering pipeline. The UI behaves more like a real-time visual installation than a portfolio people can quietly read.

The redesign should not become generic. It should keep the site’s restraint, monochrome character, mono typography, thin rules, direct labels, portrait, and a small trace of optical distortion. The installation-like effect should become a rare signature moment, not the operating system of every page.

## Current system

```text
Content service and schemas
        │
        ▼
ColumnPortalData (server data aggregation)
        │
        ▼
ColumnPortal (viewport switch after hydration)
        ├── DesktopColumnPortal: six resizable columns
        │        ├── AsciiSpace: Three.js → sampled pixels → ASCII canvas
        │        ├── GlassLens / PixelGlassLayer
        │        └── IdentityGlass / portrait
        │
        └── MobilePortal: cover or one section pane
                 ├── ambient AsciiSpace
                 ├── MobileSectionGlass
                 └── fixed text navigation
```

The content taxonomy is sound:

- identity/home;
- works;
- events;
- texts;
- about/info;
- contact.

The visual and interaction layers around that taxonomy are the source of most problems.

## What the screenshots show

### Desktop

- Six content streams are visible at once, so nothing is truly foregrounded.
- Large fitted headings collide visually and are cropped at column edges. Their scale reads as spectacle rather than navigation.
- Narrow columns force titles into awkward breaks such as single trailing letters and heavily fragmented words.
- The ASCII room has similar contrast and density to the text. It reads as another content layer, not atmosphere.
- Opening a section creates a broad glass pane but retains five noisy peripheral slivers. The state is neither a clean index nor a focused detail view.
- The portrait, chromatic distortion, live background, dividers, hover glass, text shadows, and giant labels all compete to be the brand gesture.
- Contact and About include placeholder-like strings in the current data. That is a content-quality issue, not a layout feature, but it materially lowers the perceived finish.

### Mobile

- The single-pane composition is already much closer to the desired hierarchy than desktop.
- The portrait-led home has a clear focal point and should inform the redesign.
- Reading views are still framed by a large rounded glass container while the full-screen ASCII renderer remains active behind it.
- Large section headings consume substantial vertical space before useful content begins.
- The bottom navigation is clear, but Contact sits separately in the top bar and About is renamed Info. The information architecture is understandable but inconsistent.
- The background remains visually and computationally active when it contributes little to a list or article.

## Why it feels heavy and laggy

### Confirmed runtime costs

`AsciiSpace.tsx` runs a continuous rendering and conversion pipeline:

1. render a Three.js scene into WebGL;
2. copy the WebGL canvas into a 2D sampling canvas;
3. call `getImageData` for the sampled frame;
4. loop through the pixels in JavaScript and build strings of glyphs;
5. clear and repaint the visible 2D canvas row by row.

Desktop targets this work every 50 ms, or approximately 20 frames per second. Ambient mobile targets it every 180 ms, or approximately 5.6 frames per second. The lower mobile rate reduces cost but does not create an idle page.

During the audit capture, Chromium repeatedly reported GPU stalls associated with pixel readback. That matches the synchronous GPU-to-CPU transfer inherent in the current `drawImage` and `getImageData` pipeline. This is diagnostic evidence from the capture environment, not real-user monitoring.

The live glass layer then applies SVG displacement filtering to the same changing visual source. The interface therefore pays for both generating the moving bitmap and repeatedly compositing/filtering it.

Additional work includes:

- ResizeObservers across lenses, columns, headings, and portrait surfaces;
- pointer listeners for hover light, focus, dragging, and pressed states;
- requestAnimationFrame loops for glass formation, column resizing, header fitting, and ASCII motion;
- manual text measurement and reflow with `@chenglou/pretext` as column widths change;
- full-screen fixed and isolated compositing surfaces on mobile;
- remote Google font loading before the intended typography is stable.

### Confirmed delivery weight

The production build succeeds, but the visual stack adds significant client code:

- Public index routes report 133 kB first-load JavaScript before runtime-loaded visual modules.
- The compiled Three.js chunk is 533,306 bytes minified and approximately 131,532 bytes gzip.
- The visual feature then loads its own supporting chunks.
- Detail routes report 259 kB first-load JavaScript because the animated background is also part of the reading shell.
- The current display portrait is approximately 924 kB.
- Four core UI files alone—`MobilePortal`, `DesktopColumnPortal`, `GlassLens`, and `AsciiSpace`—total 3,025 lines.

The primary problem is not just download size. It is that the downloaded code starts persistent graphics work on pages whose main job is reading.

## Safari diagnosis

The `liquid-glass-web-react` package states that it supports Safari and contains Safari-specific handling. Its own documentation also warns that Safari caps the size of an SVG-filtered source and may degrade on very large regions.

The compatibility risk is therefore more likely in the current integration than in a simple “Safari is unsupported” conclusion.

### Confirmed high-risk patterns

- Glass is applied to full-column or near-full-viewport regions rather than small controls.
- The filtered source is a continuously changing canvas generated from WebGL.
- The identity treatment uses one `LiquidGlass` component for the portrait and can create another `LiquidGlassEngine` against the ASCII canvas.
- The shared controller moves a single full-source displacement filter among active panes.
- Detail and mobile reading surfaces depend on the same effect architecture.
- The project declares Safari 16.4 in `browserslist`, but there is no runtime feature or health check that proves the composed result works.
- The only broad fallback is tied to `prefers-reduced-transparency`. A browser can support that preference while still failing or degrading this specific SVG/canvas composition.

### Practical conclusion

The redesign should make glass optional and decorative. No text, navigation, contrast, or content separation should depend on a live displacement filter. A failed effect must look like the same layout with a flat surface—not a broken version of the layout.

The exact Safari failure should be reproduced later on real Safari with a minimal test containing:

1. the package over a static element;
2. the package over a normal 2D canvas;
3. the package over the current animated ASCII canvas;
4. the current full-viewport geometry.

That sequence will identify whether the failure comes from browser support, filtered content type, source size, or the application’s controller logic. It is not necessary to block the base redesign on that investigation.

## The 20% worth preserving

| Preserve | Why it belongs in the new system |
| --- | --- |
| Near-black ground and warm-white text | Distinctive, quiet, and appropriate for the work |
| Mono typographic voice | Connects music, notation, programming, and research |
| Thin rules and direct labels | Good structure without ornamental UI |
| Portrait as the main visual anchor | Human, memorable, and already strongest on mobile |
| Works / Events / Texts / About / Contact taxonomy | Clear and backed by the existing content model |
| One restrained optical gesture | Keeps a trace of the current identity without governing every page |

This is visual DNA, not a requirement to retain the current component implementations.

## What to simplify or retire

| Current feature | Direction |
| --- | --- |
| Full-screen live ASCII on every public route | Remove from default reading routes; keep only as an optional or static home signature |
| Six equal desktop columns | Replace with one primary content plane and persistent, quiet navigation |
| Draggable column dividers | Retire; navigation should not require layout manipulation |
| Giant width-fitted labels | Replace with stable type sizes and normal wrapping |
| Glass as a reading container | Replace with a flat, high-contrast surface or no surface at all |
| Hover “formation” and breathing | Limit motion to short feedback on explicit interaction |
| Full-route Three.js dependency | Remove from default route bundles |
| Separate desktop/mobile visual systems | Share one semantic shell and vary layout primarily through CSS |
| Global aggressive text styling | Replace with a small tokenized type scale |
| Global focus reset | Use visible `:focus-visible` styles designed per control |

## Historical concept exploration: quiet index

> This section predates the approved end-goal mockups. It remains as audit history, but its visible navigation, home copy, rules, and denser Works table are superseded by the canonical mockups and [`repair-UI.md`](repair-UI.md).

The site should feel like a precise program note or score index: mostly typography, deliberate whitespace, small metadata, and one image or signal at a time.

### Desktop home

```text
PARHAM BEHZAD                         Works  Events  Texts  About  Contact
────────────────────────────────────────────────────────────────────────

Composer

Parham Behzad                                      [portrait / still]
works with acoustic composition,
live electronics, audio programming,
and theoretical research.

────────────────────────────────────────────────────────────────────────
Selected work             instrument                         2025      →
Next event                city · venue                   14 Jun 2026   →
```

### Desktop index

```text
PARHAM BEHZAD                         Works  Events  Texts  About  Contact
────────────────────────────────────────────────────────────────────────

WORKS                                      title / instrumentation / year

One is coming…                             Voice, smartphones        2025
Overcomplication                           Piano, MIDI keyboard      2025
Shifts                                     Double bass, electronics  2025
Simiyya                                    Sextet                    2023
```

### Mobile

Keep the current mobile hierarchy but flatten it:

- compact brand and section navigation;
- portrait-led home;
- one list or article at a time;
- no large glass card;
- no moving background behind reading content;
- stable heading size and more content above the fold.

## Visual system proposal

### Color

Use very few tokens:

```css
--bg: #080908;
--fg: #ebe9e2;
--muted: rgb(235 233 226 / 0.56);
--rule: rgb(235 233 226 / 0.16);
--surface: #0d0e0d;
--focus: #ffffff;
```

No gradient is required for normal reading surfaces. If a gradient remains on the home portrait, it should solve legibility rather than simulate material.

### Typography

- Keep JetBrains Mono for navigation, metadata, lists, and body text.
- Use Major Mono Display only for the name or one page title—not every large heading.
- Use a compact type scale instead of viewport-wide fitted text.
- Prefer sentence case for titles and uppercase only for small labels.
- Target 60–72 characters per line on long-form pages.
- Load fonts through `next/font` or self-host them to remove external CSS and reduce layout instability.

### Spacing and surfaces

- Use whitespace and 1 px rules as the main grouping tools.
- Keep content widths stable instead of animating them.
- Use square or subtly rounded surfaces; 28 px glass cards should not define the new language.
- Let the page background and content background be the same whenever possible.

### Motion

- Idle pages should have no animation loop.
- Route and list transitions should be simple opacity or position changes lasting 120–200 ms.
- Respect `prefers-reduced-motion` without reducing functionality.
- Any signature animation should start after explicit intent, stop automatically, and never run behind reading content.

### Signature effect

Recommended first option: keep a lightly distorted portrait on the home page using a pre-rendered image or a small, bounded effect with a flat fallback.

Optional second option: export one high-quality still from the ASCII room and use it as a very low-contrast home texture. If live ASCII is retained, load it only after explicit activation, confine it to the home hero, and stop it when it leaves the viewport.

## Target component architecture

```text
Content service and schemas                 keep
        │
        ▼
Server page data                            keep
        │
        ▼
SiteShell                                   new, shared semantic shell
        ├── PrimaryNav                      simple links, CSS responsive
        ├── HomeView                        portrait + two timely entries
        ├── IndexView                       shared Works/Events/Texts list
        ├── InfoView                        About and Contact content
        └── SignatureArtwork (optional)     home-only progressive enhancement
```

Suggested component migration:

| Current | Target |
| --- | --- |
| `ColumnPortalData` | Keep; rename only if useful |
| `ColumnPortal` | Replace viewport JS branching with a shared shell plus CSS layout |
| `DesktopColumnPortal` | Replace with `SiteShell`, `HomeView`, and shared index components |
| `MobilePortal` | Reuse its content grouping, then merge into the shared shell |
| `AsciiSpace` | Remove from default shell; optionally isolate behind `SignatureArtwork` |
| `GlassLens`, `PixelGlassLayer`, `MobileSectionGlass` | Remove from primary navigation and reading surfaces |
| `IdentityGlass` | Replace with static image treatment first; reintroduce only if bounded Safari-safe testing passes |
| `GlassPanel` / glass detail shell | Replace with a plain article/list shell |

## Performance and compatibility budgets

The redesign is successful only if lightness is measurable.

### Runtime

- Zero continuous `requestAnimationFrame` or timer-driven graphics work at idle.
- No WebGL context on list, article, About, Event, Text, or Contact pages.
- No synchronous pixel readback in the default experience.
- No layout-changing interaction required to reach content.
- No long task over 50 ms caused by ambient UI during idle or normal scrolling.

### Delivery

- Keep public first-load JavaScript at or below 140 kB gzip as an initial ceiling, then reduce further where practical.
- Keep route-specific UI JavaScript below 30 kB gzip for index pages.
- Do not ship the 132 kB gzip Three.js chunk on default public routes.
- Deliver the portrait in responsive AVIF/WebP sizes; target less than 250 kB for the common mobile source.
- Self-host or use framework-managed fonts.

### User-centric targets

- LCP below 2.5 s at the 75th percentile on mobile.
- INP below 200 ms.
- CLS below 0.1.
- Stable 60 fps scrolling on representative Safari hardware.
- Meaningful content and navigation remain complete when JavaScript or optional effects fail.

### Browser acceptance

- Safari 16.4+ on macOS, current Safari on macOS, and current iOS Safari.
- Current Chrome and Firefox.
- 390 × 844, 768 × 1024, 1024 × 768, and 1440 × 900 layouts.
- Reduced motion, reduced transparency, keyboard-only navigation, 200% zoom, and coarse pointer.

## Accessibility corrections to include

- Replace pointer-only resizable divider `div` elements; preferably remove the interaction entirely.
- Restore strong `:focus-visible` indicators instead of globally removing outlines.
- Keep body and metadata contrast independent of the background artwork.
- Do not place reading text over moving pixels.
- Use semantic navigation and one page-level `h1`.
- Add a skip link to the primary content.
- Ensure navigation names remain consistent: use About or Info, not both.
- Provide visible link affordance beyond hover inversion.
- Confirm touch targets are at least 44 × 44 CSS pixels.

## Redesign sequence

### Phase 1 — Static skeleton

- Build the shared `SiteShell` using existing routes and content data.
- Implement Home, Works, Events, Texts, About, Contact, and one detail template with no glass and no ASCII runtime.
- Use system fonts temporarily if needed; hierarchy matters before polish.

Exit criterion: the entire public site is readable, navigable, responsive, and visually coherent in Safari without optional effects.

### Phase 2 — Barely-there visual system

- Apply color, type, spacing, rules, portrait treatment, and focus states.
- Consolidate desktop and mobile semantic components.
- Optimize the portrait and font delivery.

Exit criterion: approved static screenshots at desktop and mobile sizes.

### Phase 3 — Signature layer

- Test a static ASCII still versus a bounded portrait distortion.
- Add at most one as progressive enhancement on the home page.
- Provide an automatic flat fallback.

Exit criterion: the effect adds identity without changing content contrast, input behavior, or performance budgets.

### Phase 4 — Verification and rollout

- Run production build, Lighthouse, performance profiles, and bundle inspection.
- Test real Safari and iOS Safari, not only a WebKit automation build.
- Capture the same desktop/mobile matrix for before/after comparison.
- Remove retired visual dependencies and dead components after parity is confirmed.

Exit criterion: acceptance criteria below pass and the old portal can be removed safely.

## Acceptance criteria for the redesign

- The page communicates identity, current work, and navigation within the first viewport.
- Only one content plane is visually dominant at a time.
- All public pages work with flat surfaces and no glass engine.
- Safari renders the same information architecture and readable contrast as Chrome.
- No ambient graphics work continues while a user reads a list or article.
- The default public experience does not download Three.js.
- Works, Events, Texts, About, and Contact keep their current content sources and URLs.
- Desktop and mobile share the same semantic component model.
- Keyboard, touch, reduced-motion, and reduced-transparency paths are first-class.
- A new screenshot sheet shows materially less density and fewer competing layers than this baseline.

## Historical first design decision

Approve the **quiet index** direction before choosing a new effect. The first prototype should deliberately contain no liquid glass and no live ASCII. Once the hierarchy works in black, warm white, rules, type, and portrait alone, one controlled signature gesture can be added back and judged honestly.

That order preserves the character of the current site while preventing the effect from dictating the redesign again.

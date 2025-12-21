# Aesthetic Guide: New Site

## Design Philosophy: Techno-Brutalism

This website embraces a **hardcore brutalist aesthetic** with strong industrial and technical influences. The design is uncompromising, prioritizing raw functionality, visual impact, and conceptual coherence.

---

## Core Visual Language

### 1. Color Palette - Extreme Minimalism

**Binary Color System:**
- **Background**: Pure black (`#000000`)
- **Foreground**: Pure white (`#ffffff`)
- **No gradients, no intermediate tones**
- **Inverted interactions**: White background with black text on hover

**Philosophy**: The binary palette creates maximum contrast and removes all ambiguity. Every element is either "on" or "off" - there is no middle ground.

```css
/* Core colors from globals.css */
--background: #000000;
--foreground: #ffffff;
```

---

### 2. Typography - Monospace Uniformity

**Single Typeface System:**
- **Font**: JetBrains Mono (developer-focused monospace)
- **Weights**: 400, 700, 800, 900
- **Base weight**: 700 (unusually heavy for body text)
- **Heading weight**: 900 (black)

**Typographic Rules:**
- All headings are UPPERCASE
- Aggressive letter-spacing (0.05em on headings)
- Line-height: 1.1 for headings (tight, architectural)
- All text uses monospace - no proportional fonts

**Philosophy**: Monospace creates uniform rhythm and references terminal/CLI interfaces. The heavy weights give architectural solidity.

```css
/* From globals.css */
font-family: 'JetBrains Mono', monospace !important;
font-weight: 700; /* Base */
text-transform: uppercase; /* Headings */
letter-spacing: 0.05em; /* Headings */
```

---

### 3. Geometric Hardness

**Shape Language:**
- **Borders**: 2-6px solid white
- **Corners**: 0px border-radius (except main portal)
- **Shadows**: Hard drop shadows with 6-8px offset
- **Layout**: Grid-based, orthogonal alignment

**Shadow System:**
```css
/* Brutal drop shadow */
box-shadow: 6px 6px 0 0 #ffffff;

/* Enhanced on hover */
box-shadow: 8px 8px 0 0 #ffffff;

/* No blur - hard edges only */
```

**Philosophy**: Sharp corners and hard shadows reference brutalist architecture and early digital interfaces. No softness, no organic curves.

---

## Signature Interaction Patterns

### 1. The Portal/Knob Interface

**Concept**: The main navigation is a rotating circular portal that functions like a volume knob or record player.

**Key Features:**
- **Circular viewport**: Perfect circle with 6px white border
- **Rotational navigation**: Full 360° rotation across sections
- **3D depth system**: Content layers at different Z-axis depths
- **External markers**: Visual indicators like analog volume controls
- **Custom cursor**: White dot with glow effect
- **Counter-rotation**: Content stays upright while portal rotates

**Technical Details:**
```tsx
// Main rotation calculation
const rotation = (scrollDepth / (sections.length - 1)) * 360;

// 3D depth per section
const translateZ = distance * -8000;

// Scale based on distance
const scale = 1 / (1 + absDistance * 0.3);
```

**Reference**: See [TerminalPortal.tsx:123-286](src/app/components/TerminalPortal.tsx#L123-L286)

---

### 2. Brutalist Micro-Interactions

**Timing Philosophy**: Everything is instant and linear. No easing, no smooth curves.

**Core Interactions:**

**Button Press Effect:**
```css
button:active {
  transform: translate(2px, 2px);
  transition: all 0.1s linear;
}
```

**Hover Inversion:**
```css
.element {
  background: #000000;
  color: #ffffff;
}

.element:hover {
  background: #ffffff;
  color: #000000;
}
```

**Focus States:**
```css
*:focus {
  outline: none;
  box-shadow: 0 0 0 3px #ffffff;
}
```

**Transition Rules:**
- Maximum duration: 0.3s
- Preferred duration: 0.1s
- Timing function: `linear` (never ease)
- No spring animations or elastic effects

---

### 3. Custom UI Elements

**Scrollbar - Industrial Style:**
```css
::-webkit-scrollbar {
  width: 8px;
  background: #000000;
  border: 2px solid #ffffff;
}

::-webkit-scrollbar-thumb {
  background: #ffffff;
  border: 1px solid #000000;
}
```

**Text Selection:**
```css
::selection {
  background: #ffffff;
  color: #000000;
}
```

**Links - Brutal Underline:**
```css
a {
  color: #ffffff;
  border-bottom: 2px solid #ffffff;
}

a:hover {
  background: #ffffff;
  color: #000000;
}
```

---

## 3D Perspective System

### Depth Navigation

**Concept**: Content sections exist at different depths in 3D space. As you scroll, you travel through these layers.

**Technical Implementation:**

```tsx
// Perspective settings
perspective: '2000px'
transformStyle: 'preserve-3d'

// Per-section depth
const translateZ = distance * -8000; // 8000px per section
const scale = 1 / (1 + absDistance * 0.3);
const opacity = Math.max(0.1, 1 - absDistance * 0.5);
const blur = absDistance * 2;
```

**Visual Effects:**
- **Active section**: Full opacity, sharp, scale = 1
- **Near sections**: Partially visible, slight blur, scaled down
- **Far sections**: Hidden (not rendered for performance)

**Reference**: See [TerminalPortal.tsx:224-261](src/app/components/TerminalPortal.tsx#L224-L261)

---

## Component Aesthetic

### Content Section Pattern

All content sections follow this pattern:

```tsx
<div className="space-y-8 w-full text-center">

  {/* Header with brutal underline */}
  <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight border-b-4 border-white pb-2 inline-block">
    SECTION TITLE
  </h2>

  {/* Content with boxed elements */}
  <div className="border-2 border-white p-6 hover:bg-white hover:text-black transition-all duration-100">
    {/* Content */}
  </div>

  {/* Minimal dividers */}
  <div className="w-16 h-1 bg-white mx-auto" />

</div>
```

**Key Patterns:**
- Centered layouts
- Bold horizontal dividers (1-4px solid)
- Boxed content with 2px borders
- Hover state flips colors
- Ultra-small text for metadata (`text-xs`)
- Everything uppercase

---

## Responsive Behavior

### Breakpoint Philosophy

**Mobile-first approach**, but maintaining brutalist aesthetic:

```tsx
// Tailwind breakpoint usage
className="text-2xl md:text-4xl"    // Font scaling
className="px-8 md:px-12"           // Padding scaling
className="bottom-2 md:bottom-3"    // Spacing scaling
```

**Portal Scaling:**
```tsx
// Portrait (mobile)
width: '90vw'
height: '75vh'

// Landscape (desktop)
width: 'min(90vw, 90vh)'
height: 'min(85vw, 85vh)'
```

**Philosophy**: Scale proportionally but maintain visual impact. The portal remains dominant on all screen sizes.

---

## Loading & Error States

**Minimal, text-based feedback:**

```tsx
// Loading
<div className="text-sm font-bold uppercase opacity-70">
  LOADING...
</div>

// Error
<div className="text-sm font-bold uppercase text-red-500">
  ERROR LOADING {SECTION}
</div>
```

**No spinners, no animations** - just clear text communication.

---

## Technical Details That Enhance Aesthetic

### 1. Image Rendering
```css
img {
  image-rendering: crisp-edges;
  filter: contrast(1.1);
}
```
Sharp, pixelated rendering for digital aesthetic.

### 2. Font Smoothing
```css
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
```
Cleaner rendering of heavy monospace fonts.

### 3. Custom Cursor
```tsx
<div
  className="fixed w-3 h-3 rounded-full bg-white pointer-events-none z-[9999]"
  style={{
    left: `${mousePosition.x}px`,
    top: `${mousePosition.y}px`,
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
  }}
/>
```
Custom white dot cursor with glow - reinforces the unique interface.

### 4. Touch Optimization
```css
body {
  touch-action: manipulation;
  overflow: hidden;
  height: 100svh; /* Safari viewport unit */
}
```

---

## Cultural & Historical References

This aesthetic synthesizes multiple design movements:

### 1. Swiss/International Typographic Style
- Grid-based layouts
- Sans-serif (monospace) uniformity
- Clear hierarchy through size and weight
- Minimal ornamentation

### 2. Brutalist Architecture
- Raw materials (black/white = raw pixels)
- Exposed structure (visible borders, hard shadows)
- Monumental scale (full-screen portal)
- Uncompromising geometry

### 3. Terminal/CLI Interfaces
- Monospace typography
- Command-line aesthetic
- Black background, white text
- Technical precision

### 4. Analog Audio Equipment
- Knob/dial interface metaphor
- Marker indicators (like volume controls)
- Rotational navigation
- Physical object feel

### 5. Modernist Design Principles
- Form follows function
- Truth to materials
- No decoration for decoration's sake
- Essential reduction

### 6. Y2K/Early Web Aesthetics
- Hard edges
- Binary colors
- Tech-forward attitude
- Digital brutalism

---

## Design Constraints & Rules

### What You MUST Do:

1. **Use only black and white** - no colors, no grays
2. **Use JetBrains Mono exclusively** - no other fonts
3. **Use linear timing** - no easing functions
4. **Use hard shadows** - no blur on drop shadows
5. **Use uppercase for headings** - maintain hierarchy
6. **Use 2px+ borders** - visibility and impact
7. **Invert on hover** - consistent interaction pattern
8. **Keep transitions under 0.3s** - instant feel

### What You MUST NOT Do:

1. **No color gradients** - binary only
2. **No border-radius** - except the main portal
3. **No soft shadows** - hard edges only
4. **No proportional fonts** - monospace everywhere
5. **No smooth easing** - linear only
6. **No decorative elements** - functional only
7. **No mixed case** - uppercase or lowercase, not both
8. **No thin borders** - 2px minimum

---

## Accessibility Considerations

While brutalist, the design maintains accessibility:

### Color Contrast
- **WCAG AAA compliance**: Pure black on white (21:1 ratio)
- Maximum possible contrast in digital design

### Focus States
```css
*:focus {
  outline: none;
  box-shadow: 0 0 0 3px #ffffff;
}
```
Clear, visible focus indicators.

### Keyboard Navigation
- Arrow keys navigate sections
- Space bar advances
- All interactive elements keyboard accessible

### Screen Readers
- Semantic HTML structure
- Proper heading hierarchy
- ARIA labels where needed

---

## Performance Optimizations

### 3D Rendering
```tsx
// Only render visible sections
if (!isVisible) return null;

// Limit visible range
const isVisible = Math.abs(distance) < 3;
```

### Transition Performance
```css
/* GPU acceleration for transforms */
transform: translateZ() scale() rotate();
will-change: transform;
```

### Font Loading
```tsx
// Preconnect to Google Fonts
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
```

---

## Future Considerations

### Potential Additions (While Maintaining Aesthetic):

1. **Sound design** - Click sounds, rotation sounds (analog equipment feel)
2. **Haptic feedback** - Mobile vibration on section changes
3. **Keyboard shortcuts** - Numbers 1-6 for direct section access
4. **Print styles** - High-contrast black/white printable version
5. **WebGL effects** - CRT scanline effects, glitch aesthetics
6. **Easter eggs** - Konami code, hidden sections

### What to Avoid:

1. Color themes - dilutes the binary aesthetic
2. Smooth mode - contradicts brutalist philosophy
3. Rounded corners - breaks geometric hardness
4. Gradual animations - conflicts with instant transitions
5. Background images - adds visual noise

---

## Philosophy Statement

This design is a **statement about constraint and essence**. By limiting the palette to black and white, the typography to a single monospace font, and interactions to linear transitions, we force focus on **content, structure, and concept**.

The rotating portal interface is a **physical metaphor** in a digital space - treating the website as an **object** rather than a page. This aligns with the portfolio owner's exploration of "intersections of music, philosophy, and technology."

**The aesthetic itself is the argument**: reduction reveals essence, constraint breeds creativity, brutality is honesty.

---

## File References

### Core Styling
- [globals.css](src/app/globals.css) - Base styles, brutalist utilities
- [layout.tsx](src/app/layout.tsx) - Font loading, metadata

### Main Components
- [TerminalPortal.tsx](src/app/components/TerminalPortal.tsx) - Portal/knob interface
- [Home.tsx](src/app/components/sections/Home.tsx) - Home section
- [Compositions.tsx](src/app/components/sections/Compositions.tsx) - Compositions list
- [Texts.tsx](src/app/components/sections/Texts.tsx) - Texts list
- [Tools.tsx](src/app/components/sections/Tools.tsx) - Tools section
- [About.tsx](src/app/components/sections/About.tsx) - About section
- [Contact.tsx](src/app/components/sections/Contact.tsx) - Contact section

---

## Conclusion

This aesthetic is **uncompromising, conceptual, and precise**. It demands attention, rewards exploration, and makes no apologies. It's the visual equivalent of a manifesto - bold, clear, and essential.

Every pixel serves a purpose. Every interaction is intentional. Every constraint is a choice.

**Welcome to techno-brutalism.**

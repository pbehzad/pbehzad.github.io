'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// A real lit 3D room rendered through three.js, then converted to characters
// by sampling the rendered pixels' luminance into a char ramp — actual
// perspective, actual Lambertian shading off the walls, actual rotation,
// rather than a hand-rolled distance-to-plane approximation. A point light
// co-located with the camera acts like a lantern the viewer carries:
// whatever the camera turns to face reads brightest, and it fades with real
// inverse-distance falloff instead of a synthetic fog constant.
//
// The glyphs are painted to a <canvas>, NOT a DOM table (as three's
// AsciiEffect does): rewriting a table of thousands of glyphs re-runs text
// layout every frame, which WebKit takes >150ms on — Safari ran the site at
// 5fps while Chrome did 60 (measured). Canvas painting costs a few ms in
// every engine, and it makes the glass lens cheaper too: the SVG filter
// rasterizes a bitmap instead of a live text layer. The sampling formulas
// below (grid size, luminance weights, invert mapping, y-step of 2) mirror
// AsciiEffect exactly so the look is unchanged.
//
// The classic long density ramp (~70 glyphs, light -> dense) rather than a
// short ~10-char one: with the overexposed lighting below, a short ramp
// means almost every lit cell clips to its single densest character, so
// the room reads as a flat plane of one repeated glyph. More steps give
// the mid-tones (ambient-lit surfaces short of the point light's hot spot)
// somewhere to land instead of jumping straight to max density.
const RAMP = ' .\'`^",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$';
// Big enough that the point light's falloff (below) no longer reaches the
// far walls at full strength — a small room lit this brightly is just
// uniformly overexposed with no sense of scale, since light reaches every
// surface equally. Once the corners sit past the light's effective range,
// they read as fading into real shadow, which is what actually sells "this
// space continues beyond what's lit" rather than the room's absolute size.
const ROOM = { width: 40, height: 18, depth: 44 };
// World units per wall panel. Not shrunk to match TILE's old "human-scale"
// framing from the smaller room — bigger panels project to more screen
// pixels per seam at typical viewing distance, which is what actually lets
// the seam survive the character-cell downsample (see createPanelTexture).
const TILE = 3.5;
// A fixed human eye height rather than a fraction of room height: the room
// grows around a viewer of constant size, instead of the viewer scaling up
// with it — that contrast is what reads as "this space is large."
const EYE_HEIGHT = 1.6;
const FOV = 92; // wider than before — an expansive, hangar-like field of view
const YAW_SPEED = 0.05; // radians/sec — slow ambient look-around, never reads as travel
const LIGHT_INTENSITY = 60;
const LIGHT_DECAY = 1.35;
// Lower than before: a strong flat ambient term would wash out the
// point light's falloff and flatten the near/far contrast the bigger room
// depends on to read as deep rather than just wide.
const AMBIENT_INTENSITY = 0.22;
// Even with the longer ramp, a real fraction of the frame still clips to
// the single densest glyph (true WebGL overexposure — the underlying pixels
// are genuinely identical pure white, so no ramp length recovers detail
// there). Shimmer fakes texture into that clipped zone by swapping some of
// those cells for a wide pool of other glyphs, on a slow-changing timer
// (not reseeded every frame) so it reads as a lazy glint rather than static.
const SHIMMER_POOL = RAMP.slice(Math.floor(RAMP.length / 2));
const SHIMMER_CHANCE = 0.3;
const SHIMMER_INTERVAL_MS = 260;
// A sparing accent for real seam pixels only — most of a seam is left as
// plain negative space (see EDGE_CHANCE) so the panel grid reads primarily
// through gaps in the dense fill, the classic ASCII-art trick of drawing
// structure with absence-of-ink rather than more ink.
const EDGE_CHARS = [
  '∑', '€', '®', '†', 'Ω', '¨', '⁄', 'ø', 'å', '‚', '∂', 'ƒ', '©', 'ª', 'º',
  '∆', '¥', '≈', 'ç', '√', '∫', '~', 'µ', '∞', '%', '&', '/', '(', ')', '=', '?', '§', '"',
];
const EDGE_CHANCE = 0.32;
// Zero-brightness cells map to the ramp's first character — a literal
// space. Targeting spaces is what makes the swap track real seam geometry:
// the seam texture below is painted with zero-albedo pure black, which —
// being multiplied by any light, at any distance — always renders as
// exactly zero brightness, i.e. a space, everywhere in the room. A non-zero
// seam color drifts upward near the point light's hot spot and stops being
// distinguishable from ordinary lit fill; pure black can't drift, so a
// space is exclusively seam pixels, never incidental shadow on a wall.
const EDGE_TOKEN = ' ';
const EDGE_RE = / /g;
// Every render repaints the whole glyph grid. The ambient scene doesn't
// need 60fps — 20 is visually equivalent and a third of the cost.
const FRAME_MS = 50;

// Each wall panel gets a border stroke baked into its texture so flat faces
// read as a grid of tiles under lighting, not a featureless gradient.
function createPanelTexture(): THREE.Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  // True black (zero albedo), not a dark gray: see EDGE_TOKEN above for why
  // that's load-bearing rather than cosmetic. Wide relative to the tile
  // (~12%, not a hairline): the character-cell sampling averages a
  // several-screen-pixel window per cell — a thin seam gets diluted by the
  // surrounding white fill in that average and never actually reaches
  // black. This has to survive that averaging.
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 15;
  ctx.strokeRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // Nearest, not the default mip-filtered linear: mip blending would smear
  // the seam into a soft gray gradient at typical repeat counts, which both
  // dulls the contrast and stops it being reliably pure black.
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  return texture;
}

function panelMaterial(base: THREE.Texture, repeatX: number, repeatY: number): THREE.MeshStandardMaterial {
  const map = base.clone();
  map.needsUpdate = true;
  map.repeat.set(Math.max(1, Math.round(repeatX / TILE)), Math.max(1, Math.round(repeatY / TILE)));
  return new THREE.MeshStandardMaterial({ map, side: THREE.BackSide, roughness: 1, metalness: 0 });
}

function escapeRegExp(ch: string): string {
  return ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const DENSE_CHAR = RAMP[RAMP.length - 1];
const DENSE_RE = new RegExp(escapeRegExp(DENSE_CHAR), 'g');

// Deterministic per-cell "random" so the same character position gets the
// same roll for as long as `seed` is held constant — that's what lets the
// shimmer pattern stay put between interval ticks instead of re-rolling
// (and thus changing) every animation frame.
function pseudoRandom(i: number, seed: number): number {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function shimmerRows(rows: string[], time: number): string[] {
  const seed = Math.floor(time / SHIMMER_INTERVAL_MS);
  let i = 0;
  let j = 0;
  return rows.map((row) => {
    let out = row.replace(DENSE_RE, () => {
      const cell = i++;
      if (pseudoRandom(cell, seed) >= SHIMMER_CHANCE) return DENSE_CHAR;
      const pick = Math.floor(pseudoRandom(cell, seed + 0.37) * SHIMMER_POOL.length);
      return SHIMMER_POOL[pick];
    });
    // Edges are kept static (seeded only by cell position, not time) so the
    // border reads as a deliberate frame rather than joining the shimmer.
    // Most matches are left as EDGE_TOKEN — plain negative space — with only
    // a minority swapped for an accent glyph.
    out = out.replace(EDGE_RE, () => {
      const cell = j++;
      if (pseudoRandom(cell, 0.91) >= EDGE_CHANCE) return EDGE_TOKEN;
      const pick = Math.floor(pseudoRandom(cell, 0.42) * EDGE_CHARS.length);
      return EDGE_CHARS[pick];
    });
    return out;
  });
}

export default function AsciiSpace() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 200);
    const { width, height, depth } = ROOM;
    camera.position.set(0, -height / 2 + EYE_HEIGHT, 0);

    const baseTexture = createPanelTexture();
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const materials = [
      panelMaterial(baseTexture, depth, height), // +x
      panelMaterial(baseTexture, depth, height), // -x
      panelMaterial(baseTexture, width, depth), // +y (ceiling)
      panelMaterial(baseTexture, width, depth), // -y (floor)
      panelMaterial(baseTexture, width, height), // +z
      panelMaterial(baseTexture, width, height), // -z
    ];
    const room = new THREE.Mesh(geometry, materials);
    scene.add(room);

    scene.add(new THREE.AmbientLight(0xffffff, AMBIENT_INTENSITY));
    const lantern = new THREE.PointLight(0xffffff, LIGHT_INTENSITY, 0, LIGHT_DECAY);
    lantern.position.copy(camera.position);
    scene.add(lantern);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false });
    } catch {
      geometry.dispose();
      materials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      baseTexture.dispose();
      return;
    }
    renderer.setPixelRatio(1);

    // the visible glyph canvas + a small sampling canvas for pixel readback
    const display = document.createElement('canvas');
    display.style.position = 'absolute';
    display.style.inset = '0';
    display.style.width = '100%';
    display.style.height = '100%';
    container.appendChild(display);
    const displayCtx = display.getContext('2d')!;
    const sample = document.createElement('canvas');
    const sampleCtx = sample.getContext('2d', { willReadFrequently: true })!;

    // grid math mirrors AsciiEffect: cols = floor(w × resolution), sampled
    // every 2nd row; cell height = 2/resolution. Phones get finer type so
    // the scene doesn't read as a handful of giant characters.
    let cols = 1;
    let rows = 1;
    let sampleH = 2;
    let cellW = 1;
    let cellH = 1;
    let glyphScaleX = 1;
    let dpr = 1;

    const layout = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const resolution = w <= 768 ? 0.3 : 0.22;
      cols = Math.max(4, Math.floor(w * resolution));
      sampleH = Math.max(4, Math.floor(h * resolution));
      rows = Math.ceil(sampleH / 2);
      cellW = w / cols;
      cellH = h / rows;
      dpr = Math.min(2, window.devicePixelRatio || 1);

      // render the scene at grid height directly (2 sample rows per glyph
      // row) — a fraction of a fullscreen render
      renderer.setSize(cols, sampleH, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      sample.width = cols;
      sample.height = sampleH;

      display.width = Math.round(w * dpr);
      display.height = Math.round(h * dpr);
      // Bold, not just a brighter fillStyle: at this cell size (~9-12px)
      // Chrome's Skia text rasterizer lays down visibly less ink per glyph
      // than Safari's CoreText, which faux-bolds small canvas text by
      // default — so the same fillStyle color reads dimmer in Chrome. Bold
      // strokes close that gap by fixing the actual ink coverage rather than
      // chasing it with a brighter color that only helps one engine.
      displayCtx.font = `bold ${cellH.toFixed(2)}px 'Courier New', monospace`;
      const advance = displayCtx.measureText(DENSE_CHAR).width || 1;
      // one fillText per row, horizontally scaled so the row spans the
      // viewport exactly — no per-glyph draw calls, no right-edge gap
      glyphScaleX = cellW / advance;
    };
    layout();
    window.addEventListener('resize', layout);

    const maxIdx = RAMP.length - 1;
    const paint = (time: number) => {
      renderer.render(scene, camera);
      sampleCtx.clearRect(0, 0, cols, sampleH);
      sampleCtx.drawImage(renderer.domElement, 0, 0, cols, sampleH);
      const pixels = sampleCtx.getImageData(0, 0, cols, sampleH).data;

      const rowStrings: string[] = [];
      for (let y = 0; y < sampleH; y += 2) {
        let row = '';
        for (let x = 0; x < cols; x++) {
          const o = (y * cols + x) * 4;
          const brightness = (0.3 * pixels[o] + 0.59 * pixels[o + 1] + 0.11 * pixels[o + 2]) / 255;
          // invert mapping, as AsciiEffect with { invert: true }
          row += RAMP[maxIdx - Math.round((1 - brightness) * maxIdx)];
        }
        rowStrings.push(row);
      }
      const shimmered = shimmerRows(rowStrings, time);

      displayCtx.setTransform(1, 0, 0, 1, 0, 0);
      displayCtx.clearRect(0, 0, display.width, display.height);
      displayCtx.setTransform(dpr * glyphScaleX, 0, 0, dpr, 0, 0);
      displayCtx.font = `bold ${cellH.toFixed(2)}px 'Courier New', monospace`;
      // Dimming lives in the glyph color, NOT in CSS opacity on the wrapper:
      // opacity < 1 would isolate this layer from backdrop-filter sampling
      // (#969696 = #e0e0e0 at 60%).
      displayCtx.fillStyle = '#969696';
      for (let r = 0; r < shimmered.length; r++) {
        displayCtx.fillText(shimmered[r], 0, (r + 0.8) * cellH);
      }
    };

    let lastRender = 0;
    let rafId: number;
    const tick = (t: number) => {
      if (t - lastRender >= FRAME_MS) {
        lastRender = t;
        camera.rotation.y = (t / 1000) * YAW_SPEED;
        paint(t);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', layout);
      cancelAnimationFrame(rafId);
      container.removeChild(display);
      geometry.dispose();
      materials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      baseTexture.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="ascii-lens-host pointer-events-none absolute inset-0 z-0 overflow-hidden"
    />
  );
}

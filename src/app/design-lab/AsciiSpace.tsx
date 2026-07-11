'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { AsciiEffect } from 'three/addons/effects/AsciiEffect.js';

// A real lit 3D room rendered through three.js, then converted to characters
// by AsciiEffect (samples the rendered pixels' luminance into a char ramp) —
// actual perspective, actual Lambertian shading off the walls, actual
// rotation, rather than a hand-rolled distance-to-plane approximation. A
// point light co-located with the camera acts like a lantern the viewer
// carries: whatever the camera turns to face reads brightest, and it fades
// with real inverse-distance falloff instead of a synthetic fog constant.
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
// the seam survive AsciiEffect's downsample (see createPanelTexture).
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
// AsciiEffect writes literal space cells as this exact token. Targeting it
// (rather than a band of low-index ramp characters, as before) is what
// makes the swap track real seam geometry: the seam texture below is
// painted with zero-albedo pure black, which — being multiplied by any
// light, at any distance — always renders as exactly zero brightness, i.e.
// this token, everywhere in the room. A non-zero seam color drifts upward
// near the point light's hot spot and stops being distinguishable from
// ordinary lit fill; pure black can't drift, so this token is exclusively
// seam pixels, never incidental shadow on a wall.
const EDGE_TOKEN = '&nbsp;';
const EDGE_RE = /&nbsp;/g;

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
  // (~12%, not a hairline): AsciiEffect downsamples the full render to a
  // small internal canvas before it ever looks at brightness, and that step
  // averages a several-screen-pixel window per character cell — a thin
  // seam gets diluted by the surrounding white fill in that average and
  // never actually reaches black. This has to survive that averaging.
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

// AsciiEffect rewrites its <td> as one big text blob (plus <br/> line
// breaks) every render() call, so post-processing that string right after
// render is the only hook available — there's no per-cell API. It's split
// on the exact '<br/>' separator the library emits first, and every
// substitution below runs only on the text *between* separators — never on
// the full markup string — so no matter what glyphs end up in the pools,
// there's no way to accidentally rewrite a tag delimiter and corrupt line
// breaks (which is what silently collapsed the whole layout previously).
function shimmer(root: HTMLElement, time: number) {
  const td = root.querySelector('td');
  if (!td) return;
  const seed = Math.floor(time / SHIMMER_INTERVAL_MS);
  let i = 0;
  let j = 0;
  const rows = td.innerHTML.split('<br/>').map((row) => {
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
  td.innerHTML = rows.join('<br/>');
}

export default function AsciiSpace() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // AsciiEffect rounds its glyph grid DOWN to whole cells, which leaves a
    // dead strip (up to one cell) at the right/bottom of the viewport — so
    // render slightly oversized and let the wrapper's overflow-hidden clip it
    const OVERSCAN = 32;
    const viewW = () => window.innerWidth + OVERSCAN;
    const viewH = () => window.innerHeight + OVERSCAN;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, viewW() / viewH(), 0.1, 200);
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
    let effect: AsciiEffect;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false });
      // Finer than the library default (0.15): a coarser grid means each
      // character averages a wider window of source pixels, which is the
      // other half of diluting the seam away (see createPanelTexture).
      // glyph size ≈ 2/resolution px — phones get finer type so the scene
      // doesn't read as a handful of giant characters
      const resolution = window.innerWidth <= 768 ? 0.3 : 0.22;
      effect = new AsciiEffect(renderer, RAMP, { invert: true, resolution });
    } catch {
      geometry.dispose();
      materials.forEach((m) => {
        m.map?.dispose();
        m.dispose();
      });
      baseTexture.dispose();
      return;
    }
    // Dimming lives in the glyph color, NOT in CSS opacity on the wrapper:
    // opacity < 1 would isolate this layer from backdrop-filter sampling, so
    // the column glass panes could never blur it (#5a5a5a = #969696 at 60%).
    effect.domElement.style.color = '#5a5a5a';
    effect.domElement.style.backgroundColor = 'transparent';
    effect.setSize(viewW(), viewH());
    container.appendChild(effect.domElement);

    const handleResize = () => {
      camera.aspect = viewW() / viewH();
      camera.updateProjectionMatrix();
      effect.setSize(viewW(), viewH());
    };
    window.addEventListener('resize', handleResize);

    let rafId: number;
    const tick = (t: number) => {
      camera.rotation.y = (t / 1000) * YAW_SPEED;
      effect.render(scene, camera);
      shimmer(effect.domElement, t);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
      if (container.contains(effect.domElement)) {
        container.removeChild(effect.domElement);
      }
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

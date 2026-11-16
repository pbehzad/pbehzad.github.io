'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import { createMetalRenderer, type MetalRenderer } from './metalRenderer';
import { METAL_SHADES, type Shades } from './metalShader';

// Development only, and even then hidden until the address carries
// `?shades`. The condition is a build-time constant, so production bundles
// contain neither the panel nor the import.
const ShadesTuner =
  process.env.NODE_ENV === 'development'
    ? dynamic(() => import('./ShadesPanel').then((m) => m.ShadesTuner), { ssr: false })
    : null;

// Routes that paint their own background: the admin application, and the
// lab, which renders this same field itself.
const EXCLUDED_PREFIXES = ['/admin', '/design-lab'];

// Resolution, as drawing-buffer pixels per CSS pixel. The raymarch is paid
// per pixel on every page, so it starts at one pixel per CSS pixel, never
// retina, and steps down on a GPU that cannot hold TARGET_FPS. An Intel UHD
// 630 manages about 11 fps at 1440 × 900 at full resolution and about 38 at
// half. The field is soft and dark, so the upscale costs far less than the
// stutter would.
//
// Slowness only ever lowers the resolution; it never stops the field. A
// slow second is as likely to be a busy browser, another tab on the same
// GPU, or a dev-mode compile as a weak GPU, and freezing on it left the
// field still for the rest of the visit.
const START_PIXEL_RATIO = 1;
// A third of a CSS pixel is still a soft field, and it is what an integrated
// laptop GPU can hold once it is hot and throttled.
const MIN_PIXEL_RATIO = 0.33;
// The field drifts slowly, so 30 frames a second look as smooth as 60, and
// the cap is the point. Uncapped, the field kept the GPU at 100%; on a
// laptop whose integrated GPU shares its heat budget with the processor (an
// Intel UHD 630 in a MacBook Pro) the chip throttled within seconds and the
// field fell to a few frames a second. Idle time between frames lets it cool.
const TARGET_FPS = 30;
const FRAME_INTERVAL_MS = 1000 / TARGET_FPS;
// Refresh timestamps jitter; without this slack a 60 Hz display would
// sometimes wait three refreshes for a frame instead of two.
const FRAME_SLACK_MS = 2;
// Below this share of TARGET_FPS, the GPU is falling short.
const SHORTFALL = 0.85;
// Frames are measured over windows this long, after a warm-up of the same
// length; the first frames include shader compilation and page load.
const MEASURE_MS = 1000;
// A gap this long between frames is a stall (a debugger, a sleeping laptop),
// not GPU cost. Hidden tabs are handled by visibilitychange instead. Slow
// frames, however slow, are measured: that is when the resolution must fall.
const STALL_MS = 2000;

// Why the field is or is not moving, in the browser console during
// development only.
function note(message: string) {
  if (process.env.NODE_ENV === 'development') console.info(`[metal] ${message}`);
}

/**
 * The liquid-metal field behind every public page. It lives in the root
 * layout, so one canvas persists across client navigation instead of
 * recompiling the shader on every route change.
 */
export function MetalBackground() {
  const pathname = usePathname() ?? '';
  const excluded = EXCLUDED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return excluded ? null : <MetalField />;
}

function MetalField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<MetalRenderer | null>(null);
  const shadesRef = useRef<Shades>(METAL_SHADES);
  const redrawStillRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer: [number, number] = [0, 0];
    const aim: [number, number] = [0, 0];
    let renderer: MetalRenderer | null = null;
    let pixelRatio = Math.min(START_PIXEL_RATIO, window.devicePixelRatio || 1);
    let rafId = 0;
    let last = 0;
    let windowStart = 0;
    let windowFrames = 0;
    let warmedUp = false;

    const resize = () => renderer?.resize(canvas.clientWidth, canvas.clientHeight, pixelRatio);

    // The canvas stays hidden until it holds a frame, so the flat
    // background never flickers to an empty buffer.
    const show = () => {
      if (!('ready' in canvas.dataset)) canvas.dataset.ready = '';
    };
    const hide = () => {
      delete canvas.dataset.ready;
    };

    // One still frame and no loop for reduced motion, and for a CPU-rendered
    // context, which manages about one frame a second while pinning the
    // processor.
    const still = () => reducedMotion.matches || Boolean(renderer?.software);

    const drawStill = () => {
      if (!renderer) return;
      renderer.draw(performance.now() / 1000, [0, 0]);
      show();
    };

    const restartWindow = (now: number) => {
      windowStart = now;
      windowFrames = 0;
    };

    // Lowers the resolution by the measured shortfall in one step (cost
    // scales with pixel count, the square of the ratio), then keeps checking.
    const govern = (now: number) => {
      if (now - last > STALL_MS) {
        restartWindow(now);
        return;
      }
      windowFrames++;
      const elapsed = now - windowStart;
      if (elapsed < MEASURE_MS) return;
      const fps = (windowFrames * 1000) / elapsed;
      restartWindow(now);
      if (!warmedUp) {
        warmedUp = true;
        return;
      }
      if (fps >= TARGET_FPS * SHORTFALL || pixelRatio <= MIN_PIXEL_RATIO) return;
      pixelRatio = Math.max(MIN_PIXEL_RATIO, pixelRatio * Math.sqrt(fps / TARGET_FPS) * 0.95);
      resize();
      note(`${fps.toFixed(0)} fps, resolution lowered to ${pixelRatio.toFixed(2)}× CSS pixels`);
    };

    const frame = (now: number) => {
      if (!renderer) return;
      rafId = requestAnimationFrame(frame);
      // Capped at TARGET_FPS: refreshes in between draw nothing.
      if (now - last < FRAME_INTERVAL_MS - FRAME_SLACK_MS) return;
      // Clamped at zero: the first frame's timestamp can precede start().
      const delta = Math.min(Math.max(0, now - last) / 1000, 0.05);
      govern(now);
      last = now;
      // The pointer opens a void in the field; ease towards it at the same
      // rate whatever the frame rate.
      const ease = 1 - Math.pow(0.0015, delta);
      pointer[0] += (aim[0] - pointer[0]) * ease;
      pointer[1] += (aim[1] - pointer[1]) * ease;
      renderer.draw(now / 1000, pointer);
      show();
    };

    // Frames stop while the tab is hidden; that pause is not GPU cost, so
    // measuring starts afresh when it is visible again.
    const onVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      last = performance.now();
      restartWindow(last);
    };

    const start = () => {
      cancelAnimationFrame(rafId);
      if (!renderer) return;
      if (still()) {
        drawStill();
        note(reducedMotion.matches ? 'still: prefers-reduced-motion is on' : 'still: WebGL is running in software');
        return;
      }
      last = performance.now();
      restartWindow(last);
      rafId = requestAnimationFrame(frame);
    };

    const init = () => {
      renderer = createMetalRenderer(canvas);
      rendererRef.current = renderer;
      // No WebGL: the layer's own flat background stays, in the same layout.
      if (!renderer) {
        note('WebGL unavailable: flat background');
        return;
      }
      renderer.setShades(shadesRef.current);
      resize();
      start();
    };

    const onResize = () => {
      resize();
      if (still()) drawStill();
    };

    const onPointerMove = (e: PointerEvent) => {
      aim[0] = (e.clientX / window.innerWidth) * 2 - 1;
      aim[1] = -((e.clientY / window.innerHeight) * 2 - 1);
    };

    // Contexts are lost on a GPU switch (this site's own development Mac has
    // two), a driver reset, or memory pressure. preventDefault asks the
    // browser to restore it; the flat background shows in between.
    const onContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(rafId);
      renderer = null;
      rendererRef.current = null;
      hide();
      note('WebGL context lost; waiting for the browser to restore it');
    };

    const onContextRestored = () => {
      note('WebGL context restored');
      init();
    };

    redrawStillRef.current = () => {
      if (still()) drawStill();
    };

    init();
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    reducedMotion.addEventListener('change', start);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      reducedMotion.removeEventListener('change', start);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      redrawStillRef.current = () => {};
      rendererRef.current = null;
      hide();
      renderer?.dispose();
    };
  }, []);

  // Kept in a ref as well, because the tuner may report its saved shades
  // before the renderer exists.
  const applyShades = useCallback((shades: Shades) => {
    shadesRef.current = shades;
    rendererRef.current?.setShades(shades);
    redrawStillRef.current();
  }, []);

  return (
    <>
      <div className="ui-metal" aria-hidden="true">
        <canvas ref={canvasRef} className="ui-metal__canvas" />
      </div>
      {ShadesTuner && <ShadesTuner onChange={applyShades} />}
    </>
  );
}

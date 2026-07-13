'use client';

import {
  LiquidGlass,
  LiquidGlassEngine,
  type LiquidGlassHandle,
  type LiquidGlassOptions,
} from 'liquid-glass-web-react';
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { identityGlassTuning } from './GlassLens';

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

type IdentityGlassProps = {
  media: ReactNode;
};

// This is intentionally a single, full-column package lens. The portrait and
// the column background are inside the filtered surface, while the identity
// title sits above it as a separate, sharp foreground layer.
export default function IdentityGlass({ media }: IdentityGlassProps) {
  const glassRef = useRef<LiquidGlassHandle>(null);
  const syncAsciiLensRef = useRef<(nextProgress: number) => void>(() => undefined);
  const animationRef = useRef<number | null>(null);
  const progressRef = useRef(identityGlassTuning.restOpacity);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [headerHeight, setHeaderHeight] = useState(0);
  const [progress, setProgress] = useState(identityGlassTuning.restOpacity);

  useLayoutEffect(() => {
    const element = glassRef.current?.element;
    if (!element) return;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));
      setSize((previous) =>
        previous.width === width && previous.height === height ? previous : { width, height },
      );
    };

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    measure();
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const element = glassRef.current?.element;
    const surface = element?.closest('.column-surface') as HTMLElement | null;
    const header = surface?.querySelector<HTMLElement>('[data-identity-header]');
    if (!header) return;

    const measure = () => setHeaderHeight(Math.max(0, Math.round(header.getBoundingClientRect().height)));
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    measure();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const lens = glassRef.current?.element;
    if (!lens) return;

    let engine: LiquidGlassEngine | null = null;
    let defsHost: HTMLDivElement | null = null;
    let observer: MutationObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let syncFrame: number | null = null;
    let display: HTMLCanvasElement | null = null;
    let pendingProgress = progressRef.current;

    const optionsFor = (rect: DOMRect, nextProgress: number): Partial<LiquidGlassOptions> => ({
      width: Math.max(1, rect.width - identityGlassTuning.inset * 2),
      height: Math.max(1, rect.height - identityGlassTuning.inset * 2),
      radius: identityGlassTuning.radius,
      strength: identityGlassTuning.strength * nextProgress,
      chromaticAberration: identityGlassTuning.identityChroma * nextProgress,
      blur: identityGlassTuning.blur * nextProgress,
      depth: identityGlassTuning.depth,
      curvature: identityGlassTuning.curvature,
      splay: identityGlassTuning.splay,
      glow: identityGlassTuning.glow,
      glowSpread: identityGlassTuning.glowSpread,
      glowExponent: identityGlassTuning.glowExponent,
      edgeHighlight: identityGlassTuning.edgeHighlight,
      edgeWidth: identityGlassTuning.edgeWidth,
      edgeExponent: identityGlassTuning.edgeExponent,
      specular: identityGlassTuning.specular * nextProgress,
      specularAngle: identityGlassTuning.specularAngle,
      quality: identityGlassTuning.quality,
    });

    const sync = () => {
      syncFrame = null;
      if (!engine || !display) return;

      const lensRect = lens.getBoundingClientRect();
      const sourceRect = display.getBoundingClientRect();
      if (lensRect.width <= 0 || lensRect.height <= 0 || sourceRect.width <= 0 || sourceRect.height <= 0) return;

      engine.setOptions(optionsFor(lensRect, pendingProgress));
      engine.setPosition(
        (lensRect.left + lensRect.width / 2 - sourceRect.left) / sourceRect.width,
        (lensRect.top + lensRect.height / 2 - sourceRect.top) / sourceRect.height,
      );
    };

    const scheduleSync = (nextProgress = pendingProgress) => {
      pendingProgress = nextProgress;
      if (syncFrame === null) syncFrame = window.requestAnimationFrame(sync);
    };

    const attach = () => {
      if (engine) return;

      const nextDisplay = document.querySelector<HTMLCanvasElement>('.ascii-space-host canvas[data-ascii-display]');
      const host = nextDisplay?.closest<HTMLElement>('.ascii-space-host');
      if (!nextDisplay || !host) return;

      display = nextDisplay;
      defsHost = document.createElement('div');
      defsHost.setAttribute('aria-hidden', 'true');
      defsHost.style.position = 'absolute';
      defsHost.style.inset = '0';
      defsHost.style.pointerEvents = 'none';
      host.appendChild(defsHost);

      engine = new LiquidGlassEngine(
        { container: host, filtered: display, defsHost, shadow: null },
        optionsFor(lens.getBoundingClientRect(), pendingProgress),
      );
      observer?.disconnect();
      observer = null;
      resizeObserver = new ResizeObserver(() => scheduleSync());
      resizeObserver.observe(lens);
      scheduleSync();
    };

    attach();
    if (!engine) {
      observer = new MutationObserver(attach);
      observer.observe(document.body, { childList: true, subtree: true });
    }
    syncAsciiLensRef.current = scheduleSync;

    return () => {
      syncAsciiLensRef.current = () => undefined;
      observer?.disconnect();
      resizeObserver?.disconnect();
      if (syncFrame !== null) window.cancelAnimationFrame(syncFrame);
      engine?.destroy();
      defsHost?.remove();
    };
  }, []);

  useEffect(() => {
    syncAsciiLensRef.current(progress);
  }, [progress]);

  useEffect(() => {
    const element = glassRef.current?.element;
    const surface = element?.closest('.column-surface') as HTMLElement | null;
    if (!surface) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const transitionTo = (target: number, duration: number) => {
      if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);

      const from = progressRef.current;
      if (reducedMotion || Math.abs(target - from) < 0.001) {
        progressRef.current = target;
        setProgress(target);
        animationRef.current = null;
        return;
      }

      const start = performance.now();
      const frame = (now: number) => {
        const t = Math.min(1, (now - start) / Math.max(1, duration));
        const next = from + (target - from) * easeOutCubic(t);
        progressRef.current = next;
        setProgress(next);

        if (t < 1) {
          animationRef.current = window.requestAnimationFrame(frame);
        } else {
          animationRef.current = null;
        }
      };
      animationRef.current = window.requestAnimationFrame(frame);
    };

    const clear = () => {
      transitionTo(0, identityGlassTuning.meltMs);
    };
    const restore = () => {
      transitionTo(identityGlassTuning.restOpacity, identityGlassTuning.formMs);
    };
    const handleFocusOut = () => {
      window.requestAnimationFrame(() => {
        if (!surface.contains(document.activeElement)) restore();
      });
    };

    if (!hasHover) {
      let heldPointerId: number | null = null;

      const handlePointerDown = (event: PointerEvent) => {
        if (event.pointerType !== 'touch' || heldPointerId !== null) return;
        heldPointerId = event.pointerId;
        surface.setPointerCapture(event.pointerId);
        clear();
      };
      const handlePointerEnd = (event: PointerEvent) => {
        if (event.pointerId !== heldPointerId) return;
        heldPointerId = null;
        restore();
      };

      surface.addEventListener('pointerdown', handlePointerDown, { passive: true });
      surface.addEventListener('pointerup', handlePointerEnd, { passive: true });
      surface.addEventListener('pointercancel', handlePointerEnd, { passive: true });
      surface.addEventListener('lostpointercapture', handlePointerEnd);
      transitionTo(identityGlassTuning.restOpacity, 0);
      return () => {
        if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
        surface.removeEventListener('pointerdown', handlePointerDown);
        surface.removeEventListener('pointerup', handlePointerEnd);
        surface.removeEventListener('pointercancel', handlePointerEnd);
        surface.removeEventListener('lostpointercapture', handlePointerEnd);
      };
    }

    surface.addEventListener('pointerenter', clear);
    surface.addEventListener('pointerleave', restore);
    surface.addEventListener('focusin', clear);
    surface.addEventListener('focusout', handleFocusOut);

    return () => {
      if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
      surface.removeEventListener('pointerenter', clear);
      surface.removeEventListener('pointerleave', restore);
      surface.removeEventListener('focusin', clear);
      surface.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return (
    <LiquidGlass
      ref={glassRef}
      className="identity-liquid-glass"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      width={Math.max(1, size.width - identityGlassTuning.inset * 2)}
      height={Math.max(1, size.height - identityGlassTuning.inset * 2)}
      radius={identityGlassTuning.radius}
      strength={identityGlassTuning.strength * progress}
      chromaticAberration={identityGlassTuning.identityChroma * progress}
      blur={identityGlassTuning.blur * progress}
      depth={identityGlassTuning.depth}
      curvature={identityGlassTuning.curvature}
      splay={identityGlassTuning.splay}
      glow={identityGlassTuning.glow}
      glowSpread={identityGlassTuning.glowSpread}
      glowExponent={identityGlassTuning.glowExponent}
      edgeHighlight={identityGlassTuning.edgeHighlight}
      edgeWidth={identityGlassTuning.edgeWidth}
      edgeExponent={identityGlassTuning.edgeExponent}
      specular={identityGlassTuning.specular * progress}
      specularAngle={identityGlassTuning.specularAngle}
      quality={identityGlassTuning.quality}
      shadow={false}
    >
      <div className="identity-liquid-glass-content">
        <div className="identity-liquid-glass-media" style={{ top: headerHeight }}>
          {media}
        </div>
      </div>
    </LiquidGlass>
  );
}

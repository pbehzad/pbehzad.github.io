'use client';

import { useEffect, useRef } from 'react';
import { glassLens, glassTuning } from './GlassLens';

const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

// Hover controller for one column's glass. The optics (refraction/blur) live
// in GlassLens's SVG filter on the ASCII layer; the pane here is only the
// glass surface — a faint tint and hairline that fade in with the lens.
export default function PixelGlassLayer() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const paneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const pane = paneRef.current;
    if (!root || !pane) return;

    const surface = (root.closest('.column-surface') as HTMLElement | null) ?? root.parentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const token = {};
    let progress = 0;
    let target: 0 | 1 = 0;
    let animFrom = 0;
    let animStart = 0;
    let animDuration = 1;
    let raf: number | null = null;
    let hideTimer: number | null = null;

    const setVisible = (visible: boolean) => {
      root.dataset.visible = visible ? 'true' : 'false';
    };

    const applySurface = () => {
      pane.style.opacity = progress.toFixed(3);
      pane.style.background = `rgba(255, 255, 255, ${glassTuning.tint})`;
      // specular rim: lit from the top-left, thickness shadow at the bottom
      const eh = glassTuning.edgeHighlight;
      pane.style.boxShadow = [
        `inset 0 1.5px 0 rgba(255, 255, 255, ${(0.55 * eh).toFixed(3)})`,
        `inset 1.5px 0 0 rgba(255, 255, 255, ${(0.28 * eh).toFixed(3)})`,
        `inset -1.5px 0 0 rgba(255, 255, 255, ${(0.14 * eh).toFixed(3)})`,
        `inset 0 -1.5px 0 rgba(0, 0, 0, ${(0.4 * eh).toFixed(3)})`,
        `inset 0 0 44px rgba(255, 255, 255, ${(0.05 * eh).toFixed(3)})`,
      ].join(', ');
    };

    const frame = (now: number) => {
      const t = animDuration <= 0 ? 1 : Math.min(1, (now - animStart) / animDuration);
      progress = t >= 1 ? target : animFrom + (target - animFrom) * easeOutQuad(t);
      applySurface();
      // keep the lens geometry glued to the breathing column while active
      glassLens.update(token, root.getBoundingClientRect(), progress);
      if (t >= 1 && target === 0) {
        setVisible(false);
        glassLens.release(token);
        raf = null;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const retarget = (next: 0 | 1) => {
      if (hideTimer !== null) {
        window.clearTimeout(hideTimer);
        hideTimer = null;
      }
      target = next;
      root.dataset.active = next === 1 ? 'true' : 'false';
      if (next === 1) setVisible(true);

      if (reducedMotion) {
        progress = next;
        applySurface();
        glassLens.update(token, root.getBoundingClientRect(), next);
        if (next === 0) {
          hideTimer = window.setTimeout(() => {
            setVisible(false);
            glassLens.release(token);
          }, 260);
        }
        return;
      }

      animFrom = progress;
      animStart = performance.now();
      animDuration = Math.max(1, (next === 1 ? glassTuning.formMs : glassTuning.meltMs) * Math.abs(target - animFrom));
      if (raf === null) raf = requestAnimationFrame(frame);
    };

    const activate = () => {
      glassLens.activate(token, root.getBoundingClientRect(), progress);
      retarget(1);
    };

    const handlePointerEnter = () => activate();
    const handlePointerLeave = () => retarget(0);
    const handleFocusIn = () => activate();
    const handleFocusOut = () => {
      requestAnimationFrame(() => {
        if (!surface?.contains(document.activeElement)) retarget(0);
      });
    };

    surface?.addEventListener('pointerenter', handlePointerEnter);
    surface?.addEventListener('pointerleave', handlePointerLeave);
    surface?.addEventListener('focusin', handleFocusIn);
    surface?.addEventListener('focusout', handleFocusOut);

    return () => {
      surface?.removeEventListener('pointerenter', handlePointerEnter);
      surface?.removeEventListener('pointerleave', handlePointerLeave);
      surface?.removeEventListener('focusin', handleFocusIn);
      surface?.removeEventListener('focusout', handleFocusOut);
      if (raf !== null) cancelAnimationFrame(raf);
      if (hideTimer !== null) window.clearTimeout(hideTimer);
      glassLens.release(token);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden className="column-glass-field" data-visible="false" data-active="false">
      <div ref={paneRef} className="column-glass-pane" />
    </div>
  );
}

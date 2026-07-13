'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { glassLens, mainGlassTuning } from './GlassLens';

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

type PixelGlassLayerProps = {
  /** A route- or click-selected column keeps its lens formed at rest. */
  selected?: boolean;
};

// Interaction controller for one column material. The package engine refracts
// the shared scene through this pane's geometry, while the pane stays below
// the column's readable foreground. This component only animates material
// presence and keeps hover/focus/mobile-width semantics in one place.
export default function PixelGlassLayer({ selected = false }: PixelGlassLayerProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const paneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    const pane = paneRef.current;
    if (!root || !pane) return;

    const surface = (root.closest('.column-surface') as HTMLElement | null) ?? root.parentElement;
    if (!surface) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobileMode = window.matchMedia('(max-width: 768px)').matches;
    const restingProgress = selected ? mainGlassTuning.restOpacity : 0;
    const token = {};
    let progress = restingProgress;
    let target = restingProgress;
    let animFrom = restingProgress;
    let animStart = 0;
    let animDuration = 1;
    let raf: number | null = null;

    const setVisible = (visible: boolean) => {
      root.dataset.visible = visible ? 'true' : 'false';
    };

    glassLens.activate(token, pane, progress, {
      variant: 'clear',
      freezesBreathing: false,
      interactionTarget: surface,
    });
    setVisible(progress > 0.01);

    const frame = (now: number) => {
      const t = animDuration <= 0 ? 1 : Math.min(1, (now - animStart) / animDuration);
      progress = t >= 1 ? target : animFrom + (target - animFrom) * easeOutCubic(t);
      glassLens.update(token, progress);

      if (t >= 1) {
        if (target <= 0.01) setVisible(false);
        raf = null;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const retarget = (next: number, freezesBreathing: boolean) => {
      target = next;
      root.dataset.active = next > restingProgress + 0.01 ? 'true' : 'false';
      if (next > 0.01) setVisible(true);
      glassLens.activate(token, pane, progress, {
        variant: 'clear',
        freezesBreathing,
        interactionTarget: surface,
      });

      if (reducedMotion) {
        progress = next;
        glassLens.update(token, progress);
        if (next <= 0.01) setVisible(false);
        return;
      }

      animFrom = progress;
      animStart = performance.now();
      const baseDuration = next > progress ? mainGlassTuning.formMs : mainGlassTuning.meltMs;
      animDuration = Math.max(1, baseDuration * Math.abs(target - animFrom));
      if (raf === null) raf = requestAnimationFrame(frame);
    };

    const engage = () => retarget(1, !selected);
    const disengage = () => retarget(restingProgress, false);
    let cleanupMode: () => void;

    if (mobileMode && !selected) {
      // Touch has no hover: material follows whichever column the user opens.
      // The gap between thresholds prevents flutter during a width drag.
      const container = surface.parentElement;
      let engaged = false;
      const evaluate = () => {
        if (!container) return;
        const containerWidth = container.getBoundingClientRect().width;
        if (containerWidth <= 0) return;
        const ratio = surface.getBoundingClientRect().width / containerWidth;
        const next = engaged ? ratio > 0.28 : ratio > 0.32;
        if (next === engaged) return;
        engaged = next;
        if (next) engage();
        else disengage();
      };
      const resizeObserver = new ResizeObserver(evaluate);
      resizeObserver.observe(surface);
      evaluate();
      cleanupMode = () => resizeObserver.disconnect();
    } else if (!mobileMode) {
      const handlePointerEnter = () => engage();
      const handlePointerLeave = () => disengage();
      const handleFocusIn = () => engage();
      const handleFocusOut = () => {
        requestAnimationFrame(() => {
          if (!surface.contains(document.activeElement)) disengage();
        });
      };

      surface.addEventListener('pointerenter', handlePointerEnter);
      surface.addEventListener('pointerleave', handlePointerLeave);
      surface.addEventListener('focusin', handleFocusIn);
      surface.addEventListener('focusout', handleFocusOut);

      cleanupMode = () => {
        surface.removeEventListener('pointerenter', handlePointerEnter);
        surface.removeEventListener('pointerleave', handlePointerLeave);
        surface.removeEventListener('focusin', handleFocusIn);
        surface.removeEventListener('focusout', handleFocusOut);
      };
    } else {
      // The selected route remains lensed on touch devices too.
      cleanupMode = () => undefined;
    }

    return () => {
      cleanupMode();
      if (raf !== null) cancelAnimationFrame(raf);
      glassLens.release(token);
    };
  }, [selected]);

  const restingStyle = selected
    ? ({ '--glass-progress': mainGlassTuning.restOpacity } as CSSProperties)
    : undefined;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="column-glass-field"
      data-visible={selected ? 'true' : 'false'}
      data-active="false"
    >
      <div
        ref={paneRef}
        className="glass-material column-glass-pane"
        data-glass-variant="clear"
        style={restingStyle}
      />
    </div>
  );
}

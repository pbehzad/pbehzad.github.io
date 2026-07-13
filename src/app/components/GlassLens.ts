'use client';

import { LiquidGlassEngine, type LiquidGlassOptions } from 'liquid-glass-web-react';

export type GlassVariant = 'clear' | 'regular' | 'navigation';
export type GlassScope = 'main' | 'content';

export type GlassTuning = {
  strength: number;
  chromaticAberration: number;
  identityChroma: number;
  blur: number;
  depth: number;
  curvature: number;
  splay: number;
  glow: number;
  glowSpread: number;
  glowExponent: number;
  edgeHighlight: number;
  edgeWidth: number;
  edgeExponent: number;
  specular: number;
  specularAngle: number;
  quality: number;
  density: number;
  tint: number;
  shadow: number;
  radius: number;
  inset: number;
  restOpacity: number;
  formMs: number;
  meltMs: number;
};

// Main-column frames are deliberately flush. Content panels retain rounded
// chrome and have their own independent profile in the tuner.
export const mainGlassTuning: GlassTuning = {
  strength: 0.415,
  chromaticAberration: 1,
  identityChroma: 1,
  blur: 6.5,
  depth: 40,
  curvature: 1,
  splay: 1,
  glow: 0.3,
  glowSpread: 1,
  glowExponent: 1.5,
  edgeHighlight: 0.52,
  edgeWidth: 4.5,
  edgeExponent: 1.5,
  specular: 1,
  specularAngle: 42,
  quality: 512,
  density: 0.145,
  tint: 0.215,
  shadow: 0.28,
  restOpacity: 1,
  formMs: 600,
  meltMs: 320,
  radius: 0,
  inset: 0,
};

// The identity lens is independent from the shared main-column material.
// These are the exact user-selected package settings for that one column.
export const identityGlassTuning: GlassTuning = {
  strength: 0.2,
  chromaticAberration: 1,
  identityChroma: 7,
  blur: 4,
  depth: 40,
  curvature: 0,
  splay: 0.4,
  glow: 0.3,
  glowSpread: 1,
  glowExponent: 1.5,
  edgeHighlight: 0.52,
  edgeWidth: 3,
  edgeExponent: 1.5,
  specular: 1,
  specularAngle: 42,
  quality: 512,
  density: 0.1,
  tint: 0.055,
  shadow: 0.28,
  restOpacity: 1,
  formMs: 280,
  meltMs: 200,
  radius: 0,
  inset: 0,
};

export const contentGlassTuning: GlassTuning = {
  strength: 0.375,
  chromaticAberration: 6,
  identityChroma: 1,
  blur: 10.75,
  depth: 10,
  curvature: 1,
  splay: 1,
  glow: 0.3,
  glowSpread: 1,
  glowExponent: 1.5,
  edgeHighlight: 0.52,
  edgeWidth: 3,
  edgeExponent: 1.5,
  specular: 1,
  specularAngle: 42,
  quality: 512,
  density: 0.3,
  tint: 0.055,
  shadow: 0.28,
  restOpacity: 1,
  formMs: 280,
  meltMs: 200,
  radius: 28,
  inset: 0,
};

export type GlassTuningKey = keyof GlassTuning;

const tunings: Record<GlassScope, GlassTuning> = {
  main: mainGlassTuning,
  content: contentGlassTuning,
};

const tuningListeners: Record<GlassScope, Set<() => void>> = {
  main: new Set(),
  content: new Set(),
};
const MAP_SHAPE_KEYS = new Set<GlassTuningKey>([
  'radius',
  'inset',
  'depth',
  'curvature',
  'splay',
  'glow',
  'glowSpread',
  'glowExponent',
  'edgeHighlight',
  'edgeWidth',
  'edgeExponent',
  'specularAngle',
  'quality',
]);

export function getGlassTuning(scope: GlassScope): GlassTuning {
  return tunings[scope];
}

export function subscribeGlassTuning(scope: GlassScope, listener: () => void): () => void {
  tuningListeners[scope].add(listener);
  return () => tuningListeners[scope].delete(listener);
}

export function setGlassTuning(scope: GlassScope, patch: Partial<GlassTuning>) {
  const tuning = getGlassTuning(scope);
  let changed = false;
  let changedMapShape = false;
  for (const key of Object.keys(patch) as GlassTuningKey[]) {
    const value = patch[key];
    if (value === undefined || tuning[key] === value) continue;
    tuning[key] = value;
    changed = true;
    if (MAP_SHAPE_KEYS.has(key)) changedMapShape = true;
  }
  if (!changed) return;

  glassLens.refresh(scope, changedMapShape);
  for (const listener of tuningListeners[scope]) listener();
}

type MaterialOptions = {
  variant?: GlassVariant;
  freezesBreathing?: boolean;
  interactionTarget?: HTMLElement | null;
};

type MaterialInstance = {
  element: HTMLElement;
  interactionTarget: HTMLElement;
  variant: GlassVariant;
  progress: number;
  freezesBreathing: boolean;
  order: number;
  pointerCleanup: (() => void) | null;
  resizeObserver: ResizeObserver | null;
};

type LensGeometry = {
  width: number;
  height: number;
  radius: number;
  x: number;
  y: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const VARIANT_SCALE: Record<
  GlassVariant,
  {
    density: number;
    tint: number;
    shadow: number;
  }
> = {
  clear: { density: 0.25, tint: 0.3, shadow: 0.65 },
  regular: { density: 3, tint: 0.3, shadow: 1 },
  navigation: { density: 3.4, tint: 0.3, shadow: 1.25 },
};

function scopeForVariant(variant: GlassVariant): GlassScope {
  return variant === 'clear' ? 'main' : 'content';
}

class GlassMaterialController {
  private materials = new Map<object, MaterialInstance>();
  private engine: LiquidGlassEngine | null = null;
  private engineHost: HTMLElement | null = null;
  private defsHost: HTMLDivElement | null = null;
  private activeGeometry: LensGeometry | null = null;
  private activePosition: { x: number; y: number } | null = null;
  private sequence = 0;
  private syncFrame: number | null = null;

  private applySurfaceTuning(material: MaterialInstance) {
    const scale = VARIANT_SCALE[material.variant];
    const tuning = getGlassTuning(scopeForVariant(material.variant));
    const edge = tuning.edgeHighlight;
    const style = material.element.style;

    material.element.dataset.glassVariant = material.variant;
    style.setProperty('--glass-density', Math.min(0.72, tuning.density * scale.density).toFixed(3));
    style.setProperty('--glass-tint-alpha', Math.min(0.22, tuning.tint * scale.tint).toFixed(3));
    style.setProperty('--glass-specular-alpha', (0.16 * edge).toFixed(3));
    style.setProperty('--glass-edge-top-alpha', (0.34 * edge).toFixed(3));
    style.setProperty('--glass-edge-side-alpha', (0.14 * edge).toFixed(3));
    style.setProperty('--glass-edge-dim-alpha', (0.22 * edge).toFixed(3));
    style.setProperty('--glass-shadow-alpha', Math.min(0.6, tuning.shadow * scale.shadow).toFixed(3));
    style.setProperty('--glass-frame-inset', tuning.inset + 'px');
    style.setProperty('--glass-frame-radius', tuning.radius + 'px');
  }

  private bindPointerLight(material: MaterialInstance): () => void {
    if (
      typeof window === 'undefined' ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return () => undefined;
    }

    const target = material.interactionTarget;
    let raf: number | null = null;
    let pendingX = 24;
    let pendingY = 10;

    const paint = () => {
      raf = null;
      material.element.style.setProperty('--glass-light-x', pendingX.toFixed(2) + '%');
      material.element.style.setProperty('--glass-light-y', pendingY.toFixed(2) + '%');
    };

    const queue = (x: number, y: number) => {
      pendingX = x;
      pendingY = y;
      if (raf === null) raf = window.requestAnimationFrame(paint);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const rect = target.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      queue(
        clamp01((event.clientX - rect.left) / rect.width) * 100,
        clamp01((event.clientY - rect.top) / rect.height) * 100
      );
    };
    const onPointerLeave = () => {
      material.element.dataset.glassPressed = 'false';
      queue(24, 10);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') material.element.dataset.glassPressed = 'true';
    };
    const onPointerUp = () => {
      material.element.dataset.glassPressed = 'false';
    };

    target.addEventListener('pointermove', onPointerMove, { passive: true });
    target.addEventListener('pointerleave', onPointerLeave);
    target.addEventListener('pointerdown', onPointerDown, { passive: true });
    target.addEventListener('pointerup', onPointerUp, { passive: true });
    target.addEventListener('pointercancel', onPointerUp, { passive: true });

    return () => {
      if (raf !== null) window.cancelAnimationFrame(raf);
      target.removeEventListener('pointermove', onPointerMove);
      target.removeEventListener('pointerleave', onPointerLeave);
      target.removeEventListener('pointerdown', onPointerDown);
      target.removeEventListener('pointerup', onPointerUp);
      target.removeEventListener('pointercancel', onPointerUp);
    };
  }

  private activeMaterial(): MaterialInstance | null {
    let selected: MaterialInstance | null = null;
    for (const material of this.materials.values()) {
      if (material.progress <= 0.01) continue;
      // A newly opened menu or hovered column should own the one shared
      // background lens immediately, even while it is still fading in.
      if (!selected || material.order > selected.order) selected = material;
    }
    return selected;
  }

  private sourceHost(): HTMLElement | null {
    return document.querySelector<HTMLElement>('.ascii-space-host');
  }

  private reducedTransparency(): boolean {
    return window.matchMedia('(prefers-reduced-transparency: reduce)').matches;
  }

  private radiusFor(element: HTMLElement, width: number, height: number): number {
    const value = window.getComputedStyle(element).borderTopLeftRadius;
    if (value.includes('%')) return (Number.parseFloat(value) / 100) * Math.min(width, height);
    return Number.parseFloat(value) || 0;
  }

  private geometryFor(material: MaterialInstance, source: HTMLElement): LensGeometry | null {
    const materialRect = material.element.getBoundingClientRect();
    const sourceRect = source.getBoundingClientRect();
    if (
      materialRect.width <= 0 ||
      materialRect.height <= 0 ||
      sourceRect.width <= 0 ||
      sourceRect.height <= 0
    ) {
      return null;
    }

    return {
      width: materialRect.width,
      height: materialRect.height,
      radius: this.radiusFor(material.element, materialRect.width, materialRect.height),
      x: clamp01((materialRect.left + materialRect.width / 2 - sourceRect.left) / sourceRect.width),
      y: clamp01((materialRect.top + materialRect.height / 2 - sourceRect.top) / sourceRect.height),
    };
  }

  private optionsFor(material: MaterialInstance, geometry: LensGeometry): Partial<LiquidGlassOptions> {
    const progress = material.progress;
    const tuning = getGlassTuning(scopeForVariant(material.variant));
    return {
      width: geometry.width,
      height: geometry.height,
      radius: geometry.radius,
      strength: tuning.strength * progress,
      chromaticAberration: tuning.chromaticAberration * progress,
      blur: tuning.blur * progress,
      depth: tuning.depth,
      curvature: tuning.curvature,
      splay: tuning.splay,
      glow: tuning.glow,
      glowSpread: tuning.glowSpread,
      glowExponent: tuning.glowExponent,
      edgeHighlight: tuning.edgeHighlight,
      edgeWidth: tuning.edgeWidth,
      edgeExponent: tuning.edgeExponent,
      specular: tuning.specular * progress,
      specularAngle: tuning.specularAngle,
      quality: tuning.quality,
    };
  }

  private geometryChanged(next: LensGeometry): boolean {
    const previous = this.activeGeometry;
    if (!previous) return true;
    // The map is only regenerated for a meaningful change of lens shape. The
    // engine still receives position updates on every layout change.
    return (
      Math.abs(previous.width - next.width) > 8 ||
      Math.abs(previous.height - next.height) > 8 ||
      Math.abs(previous.radius - next.radius) > 1
    );
  }

  private destroyEngine() {
    this.engine?.destroy();
    this.defsHost?.remove();
    this.engine = null;
    this.engineHost = null;
    this.defsHost = null;
    this.activeGeometry = null;
    this.activePosition = null;
  }

  private sync(forceShape = false) {
    if (this.reducedTransparency()) {
      this.destroyEngine();
      return;
    }

    const material = this.activeMaterial();
    if (!material) {
      this.destroyEngine();
      return;
    }

    const source = this.sourceHost();
    if (!source) return;
    const geometry = this.geometryFor(material, source);
    if (!geometry) return;

    const options = this.optionsFor(material, geometry);
    if (!this.engine || this.engineHost !== source) {
      this.destroyEngine();
      const defsHost = document.createElement('div');
      defsHost.setAttribute('aria-hidden', 'true');
      defsHost.style.position = 'absolute';
      defsHost.style.inset = '0';
      defsHost.style.pointerEvents = 'none';
      source.appendChild(defsHost);
      this.defsHost = defsHost;
      this.engineHost = source;
      this.engine = new LiquidGlassEngine(
        { container: source, filtered: source, defsHost, shadow: null },
        options
      );
      this.activeGeometry = geometry;
    } else {
      // Fast options (strength, chroma, blur, specular) are safe to update
      // per frame. The package regenerates its map only when a shape option
      // actually changed.
      if (forceShape || this.geometryChanged(geometry)) {
        this.engine.setOptions(options);
        this.activeGeometry = geometry;
      } else {
        this.engine.setOptions({
          strength: options.strength,
          chromaticAberration: options.chromaticAberration,
          blur: options.blur,
          specular: options.specular,
        });
      }
    }

    const positionChanged =
      !this.activePosition ||
      Math.abs(this.activePosition.x - geometry.x) > 0.0001 ||
      Math.abs(this.activePosition.y - geometry.y) > 0.0001;
    if (positionChanged) {
      this.engine.setPosition(geometry.x, geometry.y);
      this.activePosition = { x: geometry.x, y: geometry.y };
    }
  }

  private scheduleSync() {
    if (this.syncFrame !== null) return;
    this.syncFrame = window.requestAnimationFrame(() => {
      this.syncFrame = null;
      this.sync();
    });
  }

  private destroyMaterial(material: MaterialInstance) {
    material.pointerCleanup?.();
    material.resizeObserver?.disconnect();
  }

  activate(owner: object, element: HTMLElement, progress = 0, options: MaterialOptions = {}): boolean {
    const interactionTarget = options.interactionTarget ?? element;
    const variant = options.variant ?? 'clear';
    let material = this.materials.get(owner);

    if (!material || material.element !== element || material.interactionTarget !== interactionTarget) {
      if (material) this.destroyMaterial(material);
      material = {
        element,
        interactionTarget,
        variant,
        progress: clamp01(progress),
        freezesBreathing: options.freezesBreathing ?? false,
        order: ++this.sequence,
        pointerCleanup: null,
        resizeObserver: null,
      };
      material.pointerCleanup = this.bindPointerLight(material);
      material.resizeObserver = new ResizeObserver(() => this.scheduleSync());
      material.resizeObserver.observe(element);
      this.materials.set(owner, material);
    } else {
      material.variant = variant;
      material.freezesBreathing = options.freezesBreathing ?? material.freezesBreathing;
      material.order = ++this.sequence;
    }

    this.applySurfaceTuning(material);
    this.update(owner, progress);
    return true;
  }

  update(owner: object, progress: number) {
    const material = this.materials.get(owner);
    if (!material) return;
    material.progress = clamp01(progress);
    material.element.style.setProperty('--glass-progress', material.progress.toFixed(3));
    material.element.dataset.glassActive = material.progress > 0.01 ? 'true' : 'false';
    this.sync();
  }

  // True only while an interaction-driven column material is visibly active.
  // Resting identity/detail materials opt out, so they never stop breathing.
  get active(): boolean {
    return [...this.materials.values()].some(
      (material) => material.freezesBreathing && material.progress > 0.01
    );
  }

  refresh(scope: GlassScope, forceShape = true) {
    for (const material of this.materials.values()) {
      if (scopeForVariant(material.variant) === scope) this.applySurfaceTuning(material);
    }
    const active = this.activeMaterial();
    if (active && scopeForVariant(active.variant) === scope) this.sync(forceShape);
  }

  release(owner: object) {
    const material = this.materials.get(owner);
    if (!material) return;
    this.destroyMaterial(material);
    this.materials.delete(owner);
    this.sync();
  }
}

export const glassLens = new GlassMaterialController();

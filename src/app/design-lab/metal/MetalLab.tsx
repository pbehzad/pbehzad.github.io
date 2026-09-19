'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { metalFragmentShader, metalVertexShader } from './metal.glsl';
import { glassFragmentShader, glassVertexShader } from './glassui.glsl';

// A realm of liquid metal, with liquid-glass windows onto it.
//
// Two passes: the metal field renders to a texture, then the glass pass
// refracts *that* texture inside the panel shapes. The panels have to be
// composited in the shader rather than as CSS — a backdrop filter can only
// blur and displace the pixels already behind an element, whereas this can
// resample the rendered field at arbitrary offsets, which is what genuine
// per-channel dispersion requires.
//
// One layout array drives both the shader's panel SDFs and the absolutely
// positioned HTML on top, so the text can never drift off its own glass.

type Theme = 'light' | 'dark';
type Panel = { x: number; y: number; w: number; h: number; r: number };

const MAX_PANELS = 7;

type Params = {
  scale: number;
  threshold: number;
  flow: number;
  rough: number;
  env: number;
  iridescence: number;
  fog: number;
  bevel: number;
  thickness: number;
  dispersion: number;
  glassRough: number;
  edge: number;
};

const DEFAULTS: Params = {
  scale: 0.85,
  threshold: -0.06,
  flow: 0.35,
  rough: 0.16,
  env: 1.15,
  iridescence: 0.32,
  fog: 0.2,
  bevel: 34,
  thickness: 46,
  dispersion: 1.5,
  glassRough: 0.5,
  edge: 0.45,
};

const SLIDERS: { key: keyof Params; label: string; min: number; max: number; step: number }[] = [
  { key: 'scale', label: 'Cavern scale', min: 0.3, max: 2.2, step: 0.01 },
  { key: 'threshold', label: 'Density', min: -0.35, max: 0.3, step: 0.005 },
  { key: 'flow', label: 'Molten flow', min: 0, max: 1.2, step: 0.01 },
  { key: 'rough', label: 'Metal roughness', min: 0, max: 1, step: 0.01 },
  { key: 'env', label: 'Environment', min: 0.2, max: 2.4, step: 0.02 },
  { key: 'iridescence', label: 'Heat tint', min: 0, max: 1, step: 0.02 },
  { key: 'fog', label: 'Depth haze', min: 0, max: 0.7, step: 0.005 },
  { key: 'bevel', label: 'Glass bevel', min: 6, max: 120, step: 1 },
  { key: 'thickness', label: 'Glass thickness', min: 0, max: 160, step: 1 },
  { key: 'dispersion', label: 'Dispersion', min: 0, max: 4, step: 0.05 },
  { key: 'glassRough', label: 'Glass frost', min: 0, max: 2.5, step: 0.02 },
  { key: 'edge', label: 'Rim light', min: 0, max: 1.4, step: 0.02 },
];

const THEMES: Record<Theme, { tint: THREE.Color; light: number; ink: string; inkSoft: string }> = {
  light: { tint: new THREE.Color(0.95, 0.93, 0.9), light: 1, ink: '#141414', inkSoft: 'rgba(20,20,20,0.62)' },
  dark: { tint: new THREE.Color(0.92, 0.9, 0.86), light: 0, ink: '#f2f1ef', inkSoft: 'rgba(242,241,239,0.66)' },
};

// Panel geometry in CSS pixels, top-left origin. A pure function of viewport
// size, so the shader and the DOM cannot disagree about where the glass is.
function layoutPanels(w: number, h: number): Panel[] {
  const pad = Math.max(28, Math.min(56, w * 0.035));
  const brandW = Math.min(300, w * 0.26);
  const navW = Math.min(420, w * 0.34);
  const heroW = Math.min(460, w * 0.38);
  return [
    { x: pad, y: pad, w: brandW, h: 92, r: 26 },
    { x: w - pad - navW, y: pad, w: navW, h: 60, r: 30 },
    { x: pad, y: h - pad - 196, w: heroW, h: 196, r: 32 },
    { x: w - pad - 240, y: h - pad - 52, w: 240, h: 52, r: 26 },
  ];
}

export default function MetalLab() {
  const hostRef = useRef<HTMLDivElement>(null);
  const paramsRef = useRef<Params>({ ...DEFAULTS });
  const themeRef = useRef<Theme>('dark');
  const [params, setParams] = useState<Params>({ ...DEFAULTS });
  const [theme, setTheme] = useState<Theme>('dark');
  const [panelOpen, setPanelOpen] = useState(false);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [fps, setFps] = useState(0);

  const panelsRef = useRef<Panel[]>([]);
  const openRef = useRef(false);
  const tuneRectRef = useRef<Panel | null>(null);

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);
  useEffect(() => {
    openRef.current = panelOpen;
  }, [panelOpen]);
  useEffect(() => {
    panelsRef.current = panels;
  }, [panels]);

  // The tuner is itself a glass panel, so its rect joins the set the shader
  // draws — otherwise it would be the one piece of UI made of a different
  // material.
  const measureTuner = useCallback((el: HTMLDivElement | null) => {
    if (!el) {
      tuneRectRef.current = null;
      return;
    }
    const r = el.getBoundingClientRect();
    tuneRectRef.current = { x: r.left, y: r.top, w: r.width, h: r.height, r: 26 };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: 'high-performance' });
    } catch {
      return;
    }
    // Capped below devicePixelRatio: this is a per-pixel raymarch with a
    // 5-tap AO, and retina doubles an already heavy fragment cost for detail
    // a smooth metal surface does not show.
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);
    renderer.setPixelRatio(dpr);
    host.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
    });

    // Full resolution. This was dropped to 0.5 while chasing what looked
    // like a severe frame-rate problem, but the measurement was wrong — the
    // machine was loaded, not the GPU — and the specular bars on the metal
    // are sharp enough that halving resolution visibly softens them. Lower
    // this if the page ever needs headroom on weak integrated graphics.
    const FIELD_SCALE = 1.0;
    const target = new THREE.WebGLRenderTarget(2, 2, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
    });

    const shared = {
      uEnv: { value: DEFAULTS.env },
      uLight: { value: 0 },
      uTint: { value: THEMES.dark.tint.clone() },
    };

    const metalUniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2() },
      uScale: { value: DEFAULTS.scale },
      uThreshold: { value: DEFAULTS.threshold },
      uFlow: { value: DEFAULTS.flow },
      uRough: { value: DEFAULTS.rough },
      uIridescence: { value: DEFAULTS.iridescence },
      uFog: { value: DEFAULTS.fog },
      ...shared,
    };

    const glassUniforms = {
      uScene: { value: target.texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uPanels: { value: Array.from({ length: MAX_PANELS }, () => new THREE.Vector4()) },
      uPanelRadius: { value: new Array(MAX_PANELS).fill(0) },
      uPanelCount: { value: 0 },
      uBevel: { value: DEFAULTS.bevel },
      uThickness: { value: DEFAULTS.thickness },
      uDispersion: { value: DEFAULTS.dispersion },
      uGlassRough: { value: DEFAULTS.glassRough },
      uEdge: { value: DEFAULTS.edge },
      ...shared,
    };

    const quad = new THREE.PlaneGeometry(2, 2);
    const camera = new THREE.Camera();

    const metalScene = new THREE.Scene();
    const metalMat = new THREE.ShaderMaterial({
      vertexShader: metalVertexShader,
      fragmentShader: metalFragmentShader,
      uniforms: metalUniforms,
      depthTest: false,
      depthWrite: false,
    });
    metalScene.add(new THREE.Mesh(quad, metalMat));

    const glassScene = new THREE.Scene();
    const glassMat = new THREE.ShaderMaterial({
      vertexShader: glassVertexShader,
      fragmentShader: glassFragmentShader,
      uniforms: glassUniforms,
      depthTest: false,
      depthWrite: false,
    });
    glassScene.add(new THREE.Mesh(quad, glassMat));

    let cssH = 1;
    const layout = () => {
      const cssW = host.clientWidth;
      cssH = host.clientHeight;
      renderer.setSize(cssW, cssH, false);
      target.setSize(Math.round(cssW * dpr * FIELD_SCALE), Math.round(cssH * dpr * FIELD_SCALE));
      metalUniforms.uResolution.value.set(cssW, cssH);
      glassUniforms.uResolution.value.set(cssW, cssH);
      setPanels(layoutPanels(cssW, cssH));
    };
    layout();
    window.addEventListener('resize', layout);

    const aim = new THREE.Vector2();
    const onPointerMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      aim.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    window.addEventListener('pointermove', onPointerMove);

    let rafId = 0;
    let frames = 0;
    let clock = performance.now();
    let last = clock;

    const tick = (t: number) => {
      const p = paramsRef.current;
      const delta = Math.min((t - last) / 1000, 0.05);
      last = t;

      metalUniforms.uTime.value = t / 1000;
      metalUniforms.uScale.value = p.scale;
      metalUniforms.uThreshold.value = p.threshold;
      metalUniforms.uFlow.value = p.flow;
      metalUniforms.uRough.value = p.rough;
      metalUniforms.uIridescence.value = p.iridescence;
      metalUniforms.uFog.value = p.fog;
      metalUniforms.uPointer.value.lerp(aim, 1 - Math.pow(0.0015, delta));

      glassUniforms.uBevel.value = p.bevel;
      glassUniforms.uThickness.value = p.thickness;
      glassUniforms.uDispersion.value = p.dispersion;
      glassUniforms.uGlassRough.value = p.glassRough;
      glassUniforms.uEdge.value = p.edge;

      const th = THEMES[themeRef.current];
      shared.uEnv.value = p.env;
      shared.uTint.value.lerp(th.tint, 0.08);
      shared.uLight.value += (th.light - shared.uLight.value) * 0.08;

      // Panel rects, converted to centre + half-extent in the shader's
      // bottom-up pixel space.
      const rects = [...panelsRef.current];
      if (openRef.current && tuneRectRef.current) rects.push(tuneRectRef.current);
      const n = Math.min(rects.length, MAX_PANELS);
      for (let i = 0; i < n; i++) {
        const r = rects[i];
        glassUniforms.uPanels.value[i].set(r.x + r.w / 2, cssH - (r.y + r.h / 2), r.w / 2, r.h / 2);
        glassUniforms.uPanelRadius.value[i] = r.r;
      }
      glassUniforms.uPanelCount.value = n;

      renderer.setRenderTarget(target);
      renderer.render(metalScene, camera);
      renderer.setRenderTarget(null);
      renderer.render(glassScene, camera);

      frames++;
      if (t - clock >= 500) {
        setFps(Math.round((frames * 1000) / (t - clock)));
        frames = 0;
        clock = t;
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', layout);
      window.removeEventListener('pointermove', onPointerMove);
      host.removeChild(renderer.domElement);
      quad.dispose();
      metalMat.dispose();
      glassMat.dispose();
      target.dispose();
      renderer.dispose();
    };
  }, []);

  const th = THEMES[theme];
  const [brand, nav, hero, toggle] = panels;

  // Inline styles throughout: globals.css carries an unlayered
  // `* { padding: 0 }`, and unlayered CSS beats Tailwind's layered utilities
  // regardless of specificity, so every p-* here silently computed to zero.
  const at = (p?: Panel): React.CSSProperties =>
    p
      ? { position: 'absolute', left: p.x, top: p.y, width: p.w, height: p.h, pointerEvents: 'auto' }
      : { display: 'none' };

  const btn = (active: boolean): React.CSSProperties => ({
    background: active ? 'rgba(255,255,255,0.14)' : 'transparent',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 999,
    padding: '9px 18px',
    fontSize: 13,
    color: active ? th.ink : th.inkSoft,
  });

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100vw', overflow: 'hidden', background: '#0b0c0f' }}>
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} />

      {/* text only — every surface beneath it is drawn by the glass pass */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ ...at(brand), padding: '20px 26px' }}>
          <div style={{ fontSize: 10, letterSpacing: '0.36em', color: th.inkSoft }}>STUDIO</div>
          <div style={{ marginTop: 8, fontSize: 24, color: th.ink }}>Parham Behzad</div>
        </div>

        <nav style={{ ...at(nav), display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
          {['Work', 'Texts', 'Events', 'About'].map((item, i) => (
            <button key={item} type="button" style={btn(i === 0)}>
              {item}
            </button>
          ))}
        </nav>

        <div style={{ ...at(hero), padding: '26px 30px' }}>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: th.ink }}>
            Composition, sound, and the spaces between them.
          </p>
          <p style={{ marginTop: 8, fontSize: 13, lineHeight: 1.6, color: th.inkSoft }}>
            Selected works, writing and performances.
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
            <button type="button" style={btn(true)}>
              Listen
            </button>
            <button type="button" style={btn(false)}>
              Read
            </button>
          </div>
        </div>

        <div style={{ ...at(toggle), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          {(['light', 'dark'] as Theme[]).map((t) => (
            <button key={t} type="button" onClick={() => setTheme(t)} style={btn(theme === t)}>
              {t}
            </button>
          ))}
          <button type="button" onClick={() => setPanelOpen((v) => !v)} style={btn(false)}>
            {fps}fps
          </button>
        </div>
      </div>

      {panelOpen && (
        <div
          ref={measureTuner}
          style={{ position: 'absolute', right: 44, top: 140, width: 264, padding: 24, pointerEvents: 'auto' }}
        >
          {SLIDERS.map((s) => (
            <label key={s.key} style={{ display: 'block', marginBottom: 11 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: th.inkSoft }}>
                <span>{s.label}</span>
                <span>{params[s.key].toFixed(3)}</span>
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={params[s.key]}
                onChange={(e) => setParams((prev) => ({ ...prev, [s.key]: Number(e.target.value) }))}
                style={{ marginTop: 5, width: '100%', accentColor: '#cfd2d6' }}
              />
            </label>
          ))}
          <button
            type="button"
            onClick={() => setParams({ ...DEFAULTS })}
            style={{ ...btn(false), width: '100%', marginTop: 4 }}
          >
            reset
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { glassLens, glassTuning } from './GlassLens';

// Dev tuning panel for the glass lens (à la the Aave article's demo).
// Hidden by default — open the site with ?tune to show it. Hover a column,
// drag sliders, watch it change live; "copy" puts the current values on the
// clipboard, then bake them into glassTuning's defaults.

const DEFAULTS = { ...glassTuning };

type TuningKey = keyof typeof glassTuning;

const CONTROLS: Array<{ key: TuningKey; label: string; min: number; max: number; step: number; regen?: boolean }> = [
  { key: 'depth', label: 'depth', min: 0, max: 160, step: 1 },
  { key: 'edgeBand', label: 'edge width', min: 4, max: 240, step: 1, regen: true },
  { key: 'cornerRadius', label: 'radius', min: 0, max: 160, step: 1, regen: true },
  { key: 'curvature', label: 'curvature', min: 0.5, max: 4, step: 0.1, regen: true },
  { key: 'chroma', label: 'chroma', min: 0, max: 0.6, step: 0.01 },
  { key: 'blur', label: 'blur', min: 0, max: 32, step: 0.5 },
  { key: 'brightness', label: 'brightness', min: 1, max: 2.2, step: 0.05 },
  { key: 'tint', label: 'tint', min: 0, max: 0.2, step: 0.005 },
  { key: 'edgeHighlight', label: 'edge light', min: 0, max: 1, step: 0.05 },
  { key: 'formMs', label: 'form ms', min: 100, max: 1500, step: 20 },
  { key: 'meltMs', label: 'melt ms', min: 100, max: 1000, step: 20 },
];

export default function GlassTunerPanel() {
  const [values, setValues] = useState({ ...glassTuning });
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(new URLSearchParams(window.location.search).has('tune'));
  }, []);

  const set = (key: TuningKey, value: number, regen?: boolean) => {
    glassTuning[key] = value;
    setValues((v) => ({ ...v, [key]: value }));
    if (regen) glassLens.refresh();
  };

  const reset = () => {
    for (const key of Object.keys(DEFAULTS) as TuningKey[]) glassTuning[key] = DEFAULTS[key];
    setValues({ ...glassTuning });
    glassLens.refresh();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(glassTuning, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // clipboard unavailable — values are also visible in the panel
    }
  };

  if (!enabled) return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{ ...chromeStyle, padding: '6px 10px', cursor: 'pointer' }}
        aria-label="Open glass tuner"
      >
        glass ⚙
      </button>
    );
  }

  return (
    <div style={{ ...chromeStyle, width: 300, padding: '12px 14px' }} aria-label="Glass tuner">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ letterSpacing: 2, opacity: 0.8 }}>glass tuner</span>
        <span>
          <button onClick={reset} style={buttonStyle}>
            reset
          </button>
          <button onClick={copy} style={buttonStyle}>
            {copied ? 'copied!' : 'copy'}
          </button>
          <button onClick={() => setOpen(false)} style={buttonStyle} aria-label="Close">
            ×
          </button>
        </span>
      </div>
      {CONTROLS.map(({ key, label, min, max, step, regen }) => (
        <label key={key} style={{ display: 'grid', gridTemplateColumns: '86px 1fr 48px', gap: 8, alignItems: 'center', marginBottom: 7 }}>
          <span style={{ opacity: 0.7 }}>{label}</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={values[key]}
            onChange={(e) => set(key, Number(e.target.value), regen)}
            style={{ accentColor: '#ffffff', width: '100%' }}
          />
          <span style={{ textAlign: 'right', opacity: 0.9 }}>{values[key]}</span>
        </label>
      ))}
      <div style={{ marginTop: 8, opacity: 0.5, fontSize: 10, lineHeight: 1.5 }}>
        hover a column to see changes - edge/radius rebuild the lens map
      </div>
    </div>
  );
}

const chromeStyle: React.CSSProperties = {
  position: 'fixed',
  right: 12,
  bottom: 12,
  zIndex: 50,
  background: 'rgba(10, 10, 12, 0.92)',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: 8,
  fontSize: 11,
  fontFamily: '"JetBrains Mono", monospace',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
};

const buttonStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  borderRadius: 4,
  padding: '2px 8px',
  marginLeft: 6,
  fontSize: 10,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

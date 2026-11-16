'use client';

import { useEffect, useState } from 'react';
import { METAL_SHADES, type Shades } from './metalShader';

// TEMPORARY. A hand-tuning panel for the metal's colours, so the shades can
// be judged on the moving field instead of guessed in code. It is hidden
// unless the address carries `?shades`: in the design lab, and in
// development only on every public page. Once the shades are settled, paste
// the copied values into METAL_SHADES, then delete this file and its two
// call sites (MetalBackground and MetalLab).

type ColourKey = 'metal' | 'ceiling' | 'floor' | 'haze';
type LevelKey = 'highlight' | 'horizon' | 'gamma';

const COLOURS: { key: ColourKey; label: string; hint: string }[] = [
  { key: 'metal', label: 'Metal', hint: 'the metal itself' },
  { key: 'ceiling', label: 'Room above', hint: 'most of what it reflects' },
  { key: 'floor', label: 'Room below', hint: 'seen in downward curves' },
  { key: 'haze', label: 'Distance', hint: 'what far caverns fade into' },
];

const LEVELS: { key: LevelKey; label: string; min: number; max: number; step: number }[] = [
  { key: 'highlight', label: 'Highlights', min: 0, max: 2, step: 0.01 },
  { key: 'horizon', label: 'Horizon line', min: 0, max: 2, step: 0.01 },
  { key: 'gamma', label: 'Midtones (higher is darker)', min: 0.5, max: 2, step: 0.01 },
];

// Shared by the lab and the site on the same origin, so a tuning session
// carries between them and survives a reload.
const STORAGE_KEY = 'design-lab-metal-shades';
const INK = '#f2f1ef';
const INK_SOFT = 'rgba(242,241,239,0.62)';

// Anything malformed falls back to the default for that field.
function loadShades(): Shades {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return METAL_SHADES;
    const saved = JSON.parse(raw) as Record<string, unknown>;
    const next = { ...METAL_SHADES };
    for (const { key } of COLOURS) {
      const v = saved[key];
      if (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v)) next[key] = v;
    }
    for (const { key, min, max } of LEVELS) {
      const v = saved[key];
      if (typeof v === 'number' && v >= min && v <= max) next[key] = v;
    }
    return next;
  } catch {
    return METAL_SHADES;
  }
}

function saveShades(shades: Shades) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shades));
  } catch {
    // Storage blocked: tuning still works, it just will not survive a reload.
  }
}

const button: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 999,
  padding: '8px 14px',
  fontSize: 11,
  color: INK,
  cursor: 'pointer',
};

type TunerProps = {
  /** Must be stable (useCallback): it is called once with the saved shades on mount. */
  onChange: (shades: Shades) => void;
  /** Placement overrides for the panel. */
  style?: React.CSSProperties;
};

/**
 * The panel plus its state: restores the saved shades after mount (so the
 * server render and the first client render agree), saves every change, and
 * reports each one to the renderer.
 *
 * While hidden it renders nothing and applies nothing, so the field shows
 * METAL_SHADES exactly as committed, not a leftover tuning session.
 */
export function ShadesTuner({ onChange, style }: TunerProps) {
  // Null while hidden.
  const [shades, setShades] = useState<Shades | null>(null);

  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('shades')) return;
    const saved = loadShades();
    setShades(saved);
    onChange(saved);
  }, [onChange]);

  if (!shades) return null;

  const change = (next: Shades) => {
    setShades(next);
    saveShades(next);
    onChange(next);
  };

  return <ShadesPanel shades={shades} onChange={change} style={style} />;
}

function ShadesPanel({
  shades,
  onChange,
  style,
}: {
  shades: Shades;
  onChange: (next: Shades) => void;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof Shades>(key: K, value: Shades[K]) => onChange({ ...shades, [key]: value });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(shades, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked; every value is still printed in the panel.
    }
  };

  // Inline styles throughout: the panel renders outside `.ui`, where the
  // unlayered base rules in globals.css (padding reset, 3px input borders)
  // beat any layered or utility class.
  return (
    <section
      aria-label="Metal shades (temporary)"
      style={{
        position: 'fixed',
        left: 'clamp(28px, 3.5vw, 56px)',
        top: 160,
        zIndex: 25,
        width: 300,
        maxWidth: 'calc(100% - 56px)',
        maxHeight: 'calc(100% - 200px)',
        overflowY: 'auto',
        padding: '14px 18px 18px',
        background: 'rgba(10,10,12,0.9)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 18,
        color: INK,
        fontSize: 11,
        fontWeight: 400,
        lineHeight: 1.4,
        ...style,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.28em', color: INK_SOFT }}>SHADES · TEMP</p>
        <button type="button" aria-expanded={open} onClick={() => setOpen((v) => !v)} style={button}>
          {open ? 'hide' : 'show'}
        </button>
      </div>

      {open && (
        <>
          {COLOURS.map(({ key, label, hint }) => (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, cursor: 'pointer' }}>
              <input
                type="color"
                value={shades[key]}
                onChange={(e) => set(key, e.target.value)}
                style={{
                  flex: 'none',
                  width: 44,
                  height: 32,
                  padding: 0,
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 8,
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{label}</span>
                  <span style={{ color: INK_SOFT }}>{shades[key]}</span>
                </span>
                <span style={{ display: 'block', marginTop: 3, fontSize: 10, color: INK_SOFT }}>{hint}</span>
              </span>
            </label>
          ))}

          {LEVELS.map(({ key, label, min, max, step }) => (
            <label key={key} style={{ display: 'block', marginTop: 12 }}>
              <span style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{label}</span>
                <span style={{ color: INK_SOFT }}>{shades[key].toFixed(2)}</span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={shades[key]}
                onChange={(e) => set(key, Number(e.target.value))}
                // Undo the global "brutal" input box: its padding and 3px
                // border are what made each slider row twice as tall.
                style={{
                  display: 'block',
                  marginTop: 6,
                  width: '100%',
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  accentColor: '#cfd2d6',
                }}
              />
            </label>
          ))}

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button type="button" onClick={copy} style={{ ...button, flex: 1 }}>
              {copied ? 'copied' : 'copy values'}
            </button>
            <button type="button" onClick={() => onChange(METAL_SHADES)} style={button}>
              reset
            </button>
          </div>
        </>
      )}
    </section>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  contentGlassTuning,
  getGlassTuning,
  mainGlassTuning,
  setGlassTuning,
  subscribeGlassTuning,
  type GlassTuning,
  type GlassTuningKey,
  type GlassScope,
} from './GlassLens';

const DEFAULTS: Record<GlassScope, GlassTuning> = {
  main: { ...mainGlassTuning },
  content: { ...contentGlassTuning },
};
const SHAPE_KEYS = new Set<GlassTuningKey>([
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
const SHAPE_DEBOUNCE_MS = 140;

type RangeControl = {
  key: GlassTuningKey;
  label: string;
  min: number;
  max: number;
  step: number;
  unit?: string;
};

type Control = RangeControl;

type ControlGroup = {
  title: string;
  description: string;
  controls: Control[];
};

const GROUPS: ControlGroup[] = [
  {
    title: 'Geometry',
    description: 'Frame size and corners',
    controls: [
      { key: 'radius', label: 'corner radius', min: 0, max: 80, step: 1, unit: 'px' },
      { key: 'inset', label: 'frame inset', min: 0, max: 40, step: 0.5, unit: 'px' },
    ],
  },
  {
    title: 'Lens',
    description: 'Refraction and blur',
    controls: [
      { key: 'strength', label: 'strength', min: 0, max: 0.5, step: 0.005 },
      { key: 'chromaticAberration', label: 'chroma', min: 0, max: 8, step: 0.02 },
      { key: 'blur', label: 'blur', min: 0, max: 14, step: 0.25, unit: 'px' },
      { key: 'depth', label: 'edge depth', min: 1, max: 40, step: 1, unit: 'px' },
      { key: 'curvature', label: 'curvature', min: 0, max: 1, step: 0.05 },
      { key: 'splay', label: 'splay', min: 0, max: 1, step: 0.05 },
    ],
  },
  {
    title: 'Specular',
    description: 'Glow, rim, and light direction',
    controls: [
      { key: 'glow', label: 'glow', min: 0, max: 1, step: 0.05 },
      { key: 'glowSpread', label: 'glow spread', min: 0.05, max: 1, step: 0.05 },
      { key: 'glowExponent', label: 'glow falloff', min: 0.25, max: 4, step: 0.05 },
      { key: 'edgeHighlight', label: 'edge light', min: 0, max: 1, step: 0.05 },
      { key: 'edgeWidth', label: 'edge width', min: 1, max: 20, step: 0.5, unit: 'px' },
      { key: 'edgeExponent', label: 'edge falloff', min: 0.25, max: 4, step: 0.05 },
      { key: 'specular', label: 'specular', min: 0, max: 2, step: 0.05 },
      { key: 'specularAngle', label: 'light angle', min: 0, max: 360, step: 1, unit: '°' },
    ],
  },
  {
    title: 'Surface',
    description: 'Material chrome around the package lens',
    controls: [
      { key: 'density', label: 'density', min: 0, max: 0.3, step: 0.005 },
      { key: 'tint', label: 'tint', min: 0, max: 0.22, step: 0.005 },
      { key: 'shadow', label: 'surface shadow', min: 0, max: 0.7, step: 0.01 },
    ],
  },
  {
    title: 'Motion & quality',
    description: 'Transitions and displacement-map resolution',
    controls: [
      { key: 'formMs', label: 'form duration', min: 80, max: 800, step: 20, unit: 'ms' },
      { key: 'meltMs', label: 'melt duration', min: 80, max: 600, step: 20, unit: 'ms' },
      { key: 'quality', label: 'map quality', min: 64, max: 2048, step: 1, unit: 'px' },
    ],
  },
];

function groupsForScope(scope: GlassScope): ControlGroup[] {
  if (scope === 'main') return GROUPS;
  return GROUPS.map((group) => ({
    ...group,
    controls: group.controls.filter((control) => control.key !== 'inset'),
  })).filter((group) => group.controls.length > 0);
}

type GlassTunerPanelProps = {
  scope: GlassScope;
};

export default function GlassTunerPanel({ scope }: GlassTunerPanelProps) {
  const [values, setValues] = useState<GlassTuning>({ ...getGlassTuning(scope) });
  const [open, setOpen] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'select'>('idle');
  const [codeOpen, setCodeOpen] = useState(false);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const valuesRef = useRef(values);
  const pendingShapeCommits = useRef(new Map<GlassTuningKey, number>());

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    const update = () => {
      const next = { ...getGlassTuning(scope) };
      valuesRef.current = next;
      setValues(next);
    };
    update();
    return subscribeGlassTuning(scope, update);
  }, [scope]);

  useEffect(
    () => () => {
      for (const timeout of pendingShapeCommits.current.values()) window.clearTimeout(timeout);
      pendingShapeCommits.current.clear();
    },
    []
  );

  useEffect(() => {
    const updateEnabled = () => {
      const requested = new URLSearchParams(window.location.search).has('tune');
      setEnabled(process.env.NODE_ENV !== 'production' || requested);
    };
    updateEnabled();
    window.addEventListener('popstate', updateEnabled);
    return () => window.removeEventListener('popstate', updateEnabled);
  }, []);

  const copyText = useMemo(
    () =>
      [
        '// liquid-glass-web-react settings',
        'export const ' + (scope === 'main' ? 'mainGlassTuning' : 'contentGlassTuning') + ' = ' +
          JSON.stringify(values, null, 2) + ' as const;',
        '',
      ].join('\n'),
    [scope, values]
  );

  const reset = () => {
    for (const timeout of pendingShapeCommits.current.values()) window.clearTimeout(timeout);
    pendingShapeCommits.current.clear();
    setGlassTuning(scope, DEFAULTS[scope]);
    setValues({ ...getGlassTuning(scope) });
    setCopyState('idle');
  };

  const commitValue = (key: GlassTuningKey, value: number) => {
    pendingShapeCommits.current.delete(key);
    setGlassTuning(scope, { [key]: value } as Partial<GlassTuning>);
  };

  const setValue = (key: GlassTuningKey, rawValue: number) => {
    if (!Number.isFinite(rawValue)) return;
    const value = rawValue;

    valuesRef.current = { ...valuesRef.current, [key]: value };
    setValues(valuesRef.current);

    if (!SHAPE_KEYS.has(key)) {
      commitValue(key, value);
      return;
    }

    const pending = pendingShapeCommits.current.get(key);
    if (pending !== undefined) window.clearTimeout(pending);
    pendingShapeCommits.current.set(
      key,
      window.setTimeout(() => commitValue(key, value), SHAPE_DEBOUNCE_MS)
    );
  };

  const flushShapeValue = (key: GlassTuningKey) => {
    if (!SHAPE_KEYS.has(key)) return;
    const pending = pendingShapeCommits.current.get(key);
    if (pending === undefined) return;
    window.clearTimeout(pending);
    commitValue(key, valuesRef.current[key]);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopyState('copied');
    } catch {
      setCodeOpen(true);
      window.requestAnimationFrame(() => {
        codeRef.current?.focus();
        codeRef.current?.select();
      });
      setCopyState('select');
    }
    window.setTimeout(() => setCopyState('idle'), 1400);
  };

  if (!enabled) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ ...collapsedStyle, cursor: 'pointer' }}
        aria-label="Open glass tuner"
      >
        tune glass
      </button>
    );
  }

  return (
    <aside style={panelStyle} aria-label={scope + ' page liquid glass tuner'}>
      <div style={headerStyle}>
        <div>
          <div style={{ letterSpacing: 1.8, fontSize: 12 }}>{scope} page glass</div>
          <div style={{ marginTop: 2, opacity: 0.55, fontSize: 10 }}>independent live controls</div>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          <button type="button" onClick={reset} style={buttonStyle}>
            reset
          </button>
          <button type="button" onClick={copy} style={buttonStyle}>
            {copyState === 'copied' ? 'copied' : copyState === 'select' ? 'select code' : 'copy all'}
          </button>
          <button type="button" onClick={() => setOpen(false)} style={buttonStyle} aria-label="Minimize glass tuner">
            −
          </button>
        </div>
      </div>

      {groupsForScope(scope).map((group) => (
        <section key={group.title} style={sectionStyle}>
          <div style={groupHeadingStyle}>
            <span>{group.title}</span>
            <span style={{ opacity: 0.45, fontSize: 9 }}>{group.description}</span>
          </div>
          {group.controls.map((control) => {
            const value = values[control.key];
            const id = 'glass-tuning-' + scope + '-' + control.key;
            return (
              <div key={control.key} style={rowStyle}>
                <label htmlFor={id} style={labelStyle}>
                  {control.label}
                </label>
                <input
                  id={id}
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={value}
                  onChange={(event) => setValue(control.key, Number(event.target.value))}
                  onPointerUp={() => flushShapeValue(control.key)}
                  onKeyUp={() => flushShapeValue(control.key)}
                  style={rangeStyle}
                />
                <input
                  type="number"
                  step={control.step}
                  value={value}
                  onChange={(event) => {
                    if (event.target.value === '') return;
                    setValue(control.key, Number(event.target.value));
                  }}
                  onBlur={() => flushShapeValue(control.key)}
                  aria-label={control.label + ' value'}
                  style={numberStyle}
                />
              </div>
            );
          })}
        </section>
      ))}

      <div style={noteStyle}>
        Numeric fields accept any finite value; sliders are only a quick starting range. Frame inset and radius are
        live; lens size and position still follow the active card.
      </div>

      <details open={codeOpen} onToggle={(event) => setCodeOpen(event.currentTarget.open)} style={codeStyle}>
        <summary style={{ cursor: 'pointer' }}>settings code</summary>
        <textarea ref={codeRef} readOnly value={copyText} style={textareaStyle} aria-label="Copyable glass settings" />
      </details>
    </aside>
  );
}

const panelStyle: CSSProperties = {
  position: 'fixed',
  right: 12,
  bottom: 12,
  zIndex: 100,
  width: 'min(370px, calc(100vw - 24px))',
  maxHeight: 'calc(100dvh - 24px)',
  overflowY: 'auto',
  padding: '12px 13px',
  background: 'rgba(10, 10, 12, 0.94)',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  borderRadius: 10,
  fontSize: 11,
  fontFamily: '"JetBrains Mono", monospace',
  boxShadow: '0 12px 42px rgba(0, 0, 0, 0.55)',
  backdropFilter: 'blur(14px)',
};

const collapsedStyle: CSSProperties = {
  position: 'fixed',
  right: 12,
  bottom: 12,
  zIndex: 100,
  padding: '7px 10px',
  background: 'rgba(10, 10, 12, 0.94)',
  color: '#ffffff',
  border: '1px solid rgba(255, 255, 255, 0.24)',
  borderRadius: 8,
  fontSize: 11,
  fontFamily: '"JetBrains Mono", monospace',
  boxShadow: '0 8px 28px rgba(0, 0, 0, 0.45)',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 8,
  marginBottom: 12,
};

const sectionStyle: CSSProperties = {
  marginTop: 10,
  paddingTop: 9,
  borderTop: '1px solid rgba(255, 255, 255, 0.11)',
};

const groupHeadingStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
  marginBottom: 7,
  color: 'rgba(255, 255, 255, 0.86)',
  fontSize: 10,
  letterSpacing: 0.7,
  textTransform: 'uppercase',
};

const rowStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '94px minmax(0, 1fr) 62px',
  alignItems: 'center',
  gap: 8,
  minHeight: 27,
};

const labelStyle: CSSProperties = {
  overflow: 'hidden',
  color: 'rgba(255, 255, 255, 0.68)',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const rangeStyle: CSSProperties = {
  width: '100%',
  accentColor: '#ffffff',
};

const numberStyle: CSSProperties = {
  width: '100%',
  padding: '2px 4px',
  color: '#ffffff',
  background: 'rgba(255, 255, 255, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.16)',
  borderRadius: 4,
  font: 'inherit',
  textAlign: 'right',
};

const buttonStyle: CSSProperties = {
  padding: '3px 6px',
  color: '#ffffff',
  background: 'transparent',
  border: '1px solid rgba(255, 255, 255, 0.25)',
  borderRadius: 4,
  cursor: 'pointer',
  font: 'inherit',
  fontSize: 10,
};

const noteStyle: CSSProperties = {
  marginTop: 11,
  paddingTop: 9,
  borderTop: '1px solid rgba(255, 255, 255, 0.11)',
  color: 'rgba(255, 255, 255, 0.48)',
  fontSize: 10,
  lineHeight: 1.45,
};

const codeStyle: CSSProperties = {
  marginTop: 8,
  color: 'rgba(255, 255, 255, 0.65)',
  fontSize: 10,
};

const textareaStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  minHeight: 170,
  marginTop: 7,
  padding: 8,
  resize: 'vertical',
  color: '#d9e6ff',
  background: 'rgba(0, 0, 0, 0.32)',
  border: '1px solid rgba(255, 255, 255, 0.14)',
  borderRadius: 5,
  font: '10px/1.45 "JetBrains Mono", monospace',
};

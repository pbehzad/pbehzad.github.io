'use client';

import Image from 'next/image';
import Link from 'next/link';
import PixelGlassLayer from '../components/PixelGlassLayer';
import AsciiSpace from '../components/AsciiSpace';
import IdentityGlass from '../components/IdentityGlass';
import LiquidPortrait from '../components/LiquidPortrait';
import { COLUMN_ITEMS, CONTENT_FONT_FAMILY, HEADER_FONT_FAMILY } from './content';
import {
  prepareWithSegments,
  layoutWithLines,
  measureNaturalWidth,
  type PreparedTextWithSegments,
} from '@chenglou/pretext';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';

const MOBILE_BREAKPOINT = 768;
// Columns can be squeezed much narrower on phones than on desktop — there's
// no pointer precision to protect, and screen space is scarce.
const MOBILE_MIN_WIDTH = 16;
const EQUAL_COLUMN_SHARE = 1 / 6;

function getMinWidths(): number[] {
  const isMobileNow = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;
  return COLUMNS.map((c) => (isMobileNow ? MOBILE_MIN_WIDTH : c.minWidth));
}

type ColumnDef = {
  id: string;
  label: string | null;
  minWidth: number;
  initialShare: number;
};

export const COLUMNS: ColumnDef[] = [
  { id: 'identity', label: null, minWidth: 40, initialShare: EQUAL_COLUMN_SHARE },
  { id: 'works', label: 'works', minWidth: 40, initialShare: EQUAL_COLUMN_SHARE },
  { id: 'events', label: 'events', minWidth: 40, initialShare: EQUAL_COLUMN_SHARE },
  { id: 'texts', label: 'texts', minWidth: 40, initialShare: EQUAL_COLUMN_SHARE },
  { id: 'about', label: 'about', minWidth: 40, initialShare: EQUAL_COLUMN_SHARE },
  { id: 'contact', label: 'contact', minWidth: 40, initialShare: EQUAL_COLUMN_SHARE },
];

// Column body text is laid out by pretext instead of native CSS wrapping: as a
// column's width changes every animation frame (idle jitter, drag), we need
// exact line breaks recomputed many times a second without forcing DOM reflow
// (getBoundingClientRect/offsetHeight), which is what prepareWithSegments +
// layoutWithLines gives us — pure arithmetic over a canvas-measured cache.
const TITLE_FONT_SIZE = 28;
const TITLE_LINE_HEIGHT = 32;
const TITLE_WEIGHT = 300;
export const META_FONT_SIZE = 14;
export const META_LINE_HEIGHT = 19;
export const META_WEIGHT = 300;
// globals.css has an unlayered `* { padding: 0; margin: 0 }` reset, which
// beats Tailwind's layered utility classes regardless of specificity — so
// px-*/py-*/space-y-* compute to 0px here. Padding below is applied inline
// (inline styles always win) so it's both real on screen and consistent
// with the width pretext is fed.
export const COLUMN_PAD_X = 12;
export const CONTENT_PADDING_X = COLUMN_PAD_X * 2;

export type FlowTextHandle = { setWidth: (width: number) => void };

export const FlowText = forwardRef<
  FlowTextHandle,
  { text: string; fontSize?: number; lineHeight?: number; weight?: number; dim?: boolean }
>(function FlowText(
  { text, fontSize = TITLE_FONT_SIZE, lineHeight = TITLE_LINE_HEIGHT, weight = TITLE_WEIGHT, dim = false },
  ref
) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const preparedRef = useRef<{ font: string; data: PreparedTextWithSegments } | null>(null);
  const lastLinesKeyRef = useRef<string>('');
  const font = `${weight} ${fontSize}px ${CONTENT_FONT_FAMILY}`;

  useImperativeHandle(
    ref,
    () => ({
      setWidth(width: number) {
        const el = wrapRef.current;
        if (!el || width <= 0) return;
        // fontSize can genuinely change on an already-mounted instance (the
        // mobile breakpoint toggling), so the cache must invalidate on font
        // change, not just prepare once and hold forever.
        if (!preparedRef.current || preparedRef.current.font !== font) {
          preparedRef.current = { font, data: prepareWithSegments(text, font) };
        }
        const { lines } = layoutWithLines(preparedRef.current.data, width, lineHeight);
        const key = lines.map((line) => line.text).join('\n');
        if (key === lastLinesKeyRef.current) return;
        lastLinesKeyRef.current = key;
        el.textContent = '';
        for (const line of lines) {
          const lineEl = document.createElement('div');
          lineEl.textContent = line.text || ' ';
          el.appendChild(lineEl);
        }
      },
    }),
    [text, font, lineHeight]
  );

  return (
    <div
      ref={wrapRef}
      style={{ font, lineHeight: `${lineHeight}px`, whiteSpace: 'pre', opacity: dim ? 0.55 : 1 }}
    />
  );
});
FlowText.displayName = 'FlowText';

// Headers are "huge and responsive": rather than a fixed font-size, we solve
// for the size at which the label's natural (unwrapped) width exactly fills
// the column, so a header is always one giant line, never wrapped or
// clipped — it grows toward poster scale as the column widens and shrinks
// (down to a floor) as it narrows. Monospace glyph width scales linearly
// with font-size, so measuring once at a reference size and scaling
// proportionally is exact — no iterative search needed.
// Major Mono Display only ships one weight (400) — no bold/black cut exists,
// so we measure at its native weight rather than faking one.
export const HEADER_WEIGHT = 400;
const HEADER_REF_SIZE = 100;
const HEADER_MIN_SIZE = 24;
const HEADER_MAX_SIZE = 220;
const headerPreparedCache = new Map<string, PreparedTextWithSegments>();

function getHeaderPrepared(label: string): PreparedTextWithSegments {
  let prepared = headerPreparedCache.get(label);
  if (!prepared) {
    prepared = prepareWithSegments(label, `${HEADER_WEIGHT} ${HEADER_REF_SIZE}px ${HEADER_FONT_FAMILY}`);
    headerPreparedCache.set(label, prepared);
  }
  return prepared;
}

export function computeHeaderFontSize(label: string, availableWidth: number): number {
  const naturalWidth = measureNaturalWidth(getHeaderPrepared(label));
  if (naturalWidth <= 0) return HEADER_MIN_SIZE;
  const fitted = (availableWidth / naturalWidth) * HEADER_REF_SIZE;
  return Math.min(HEADER_MAX_SIZE, Math.max(HEADER_MIN_SIZE, fitted));
}

export function normalizeWidths(raw: number[], mins: number[], total: number): number[] {
  const widths = [...raw];
  let deficit = 0;
  for (let i = 0; i < widths.length; i++) {
    if (widths[i] < mins[i]) {
      deficit += mins[i] - widths[i];
      widths[i] = mins[i];
    }
  }
  if (deficit > 0) {
    const slack = widths.map((w, i) => Math.max(w - mins[i], 0));
    const slackTotal = slack.reduce((a, b) => a + b, 0);
    if (slackTotal > 0) {
      for (let i = 0; i < widths.length; i++) {
        if (slack[i] > 0) widths[i] -= (slack[i] / slackTotal) * deficit;
      }
    }
  }
  const sum = widths.reduce((a, b) => a + b, 0);
  widths[widths.length - 1] += total - sum;
  return widths;
}

export default function ColumnLab() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const titleFontSize = isMobile ? 18 : TITLE_FONT_SIZE;
  const titleLineHeight = isMobile ? 22 : TITLE_LINE_HEIGHT;
  const metaFontSize = isMobile ? 11 : META_FONT_SIZE;
  const metaLineHeight = isMobile ? 15 : META_LINE_HEIGHT;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerWidthRef = useRef(0);
  const widthsRef = useRef<number[]>([]);
  const hasInteractedRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const dragRef = useRef<{ i: number; startX: number; startWidths: number[] } | null>(null);
  const dividerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const flowRegistryRef = useRef<Map<string, (FlowTextHandle | null)[]>>(new Map());

  const positionDividers = useCallback((ws: number[]) => {
    let x = 0;
    for (let i = 0; i < ws.length - 1; i++) {
      x += ws[i];
      const el = dividerRefs.current[i];
      if (el) el.style.left = `${x}px`;
    }
  }, []);

  const reflowContent = useCallback((ws: number[]) => {
    COLUMNS.forEach((col, i) => {
      if (!col.label) return;
      const width = Math.max(ws[i] - CONTENT_PADDING_X, 0);
      const handles = flowRegistryRef.current.get(col.id);
      if (!handles) return;
      handles.forEach((h) => h?.setWidth(width));
    });
  }, []);

  const reflowHeaders = useCallback((ws: number[]) => {
    COLUMNS.forEach((col, i) => {
      if (!col.label) return;
      const el = headerRefs.current[i];
      if (!el) return;
      const width = Math.max(ws[i] - CONTENT_PADDING_X, 1);
      el.style.fontSize = `${computeHeaderFontSize(col.label, width)}px`;
    });
  }, []);

  const applyWidths = useCallback(
    (ws: number[]) => {
      widthsRef.current = ws;
      if (containerRef.current) {
        containerRef.current.style.gridTemplateColumns = ws.map((w) => `${w}px`).join(' ');
      }
      positionDividers(ws);
      reflowContent(ws);
      reflowHeaders(ws);
    },
    [positionDividers, reflowContent, reflowHeaders]
  );

  const startIdle = useCallback(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const phases = COLUMNS.map((_, i) => i * 1.3);
    const amplitude = 10;
    let lastApply = 0;
    // This is a layout-heavy laboratory view, so keep the ambient wobble at
    // 20fps. It looks continuous but avoids reflowing all columns on every
    // display refresh.
    const tick = (t: number) => {
      if (t - lastApply >= 50) {
        lastApply = t;
        const base = widthsRef.current;
        const raw = phases.map((p) => Math.sin(t / 1400 + p));
        const mean = raw.reduce((a, b) => a + b, 0) / raw.length;
        const jittered = base.map((w, i) => w + amplitude * (raw[i] - mean));
        if (containerRef.current) {
          containerRef.current.style.gridTemplateColumns = jittered.map((w) => `${w}px`).join(' ');
        }
        positionDividers(jittered);
        reflowContent(jittered);
        reflowHeaders(jittered);
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);
  }, [positionDividers, reflowContent, reflowHeaders]);

  // Only dismisses the one-time hint caption — no longer touches the idle
  // animation, which now runs for the lifetime of the page.
  const markInteracted = useCallback(() => {
    if (hasInteractedRef.current) return;
    hasInteractedRef.current = true;
    setHasInteracted(true);
  }, []);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const mins = getMinWidths();
    const width = el.getBoundingClientRect().width;
    containerWidthRef.current = width;
    const initial = normalizeWidths(
      COLUMNS.map((c) => c.initialShare * width),
      mins,
      width
    );
    applyWidths(initial);
    if (!hasInteractedRef.current) startIdle();

    const ro = new ResizeObserver((entries) => {
      const newWidth = entries[0].contentRect.width;
      const oldWidth = containerWidthRef.current || newWidth;
      if (Math.abs(newWidth - oldWidth) < 1) return;
      const rescaled = normalizeWidths(
        widthsRef.current.map((w) => (w / oldWidth) * newWidth),
        mins,
        newWidth
      );
      containerWidthRef.current = newWidth;
      applyWidths(rescaled);
    });
    ro.observe(el);

    return () => {
      ro.disconnect();
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    };
  }, [applyWidths, startIdle]);

  const onDividerPointerDown = (i: number) => (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    markInteracted();
    dragRef.current = { i, startX: e.clientX, startWidths: [...widthsRef.current] };
  };

  const onDividerPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = e.clientX - drag.startX;
    const i = drag.i;
    const mins = getMinWidths();
    const next = [...drag.startWidths];

    // Growing one column pulls space from every column on the other side of
    // the divider, nearest neighbor first, cascading further down the row
    // once a donor bottoms out at its min-width — not just the one column
    // directly across the divider.
    const donorIndices: number[] =
      dx > 0
        ? Array.from({ length: next.length - i - 1 }, (_, k) => i + 1 + k)
        : Array.from({ length: i + 1 }, (_, k) => i - k);
    const growIndex = dx > 0 ? i : i + 1;

    let remaining = Math.abs(dx);
    for (const donor of donorIndices) {
      if (remaining <= 0) break;
      const slack = next[donor] - mins[donor];
      if (slack <= 0) continue;
      const take = Math.min(slack, remaining);
      next[donor] -= take;
      remaining -= take;
    }
    next[growIndex] += Math.abs(dx) - remaining;

    applyWidths(next);
  };

  const onDividerPointerUp = () => {
    dragRef.current = null;
  };

  const onHeaderClick = (i: number) => {
    markInteracted();
    const total = containerWidthRef.current;
    const mins = getMinWidths();
    const current = widthsRef.current;

    if (activeIndex === i) {
      const identityW = current[0];
      const remaining = total - identityW;
      const evenShare = remaining / (COLUMNS.length - 1);
      const next = current.map((_, idx) => (idx === 0 ? identityW : evenShare));
      applyWidths(normalizeWidths(next, mins, total));
      setActiveIndex(null);
    } else {
      const identityW = current[0];
      const next = COLUMNS.map((_, idx) => {
        if (idx === 0) return identityW;
        if (idx === i) return 0;
        return mins[idx];
      });
      const usedExceptActive = next.reduce((sum, w, idx) => (idx === i ? sum : sum + w), 0);
      next[i] = Math.max(total - usedExceptActive, mins[i]);
      applyWidths(normalizeWidths(next, mins, total));
      setActiveIndex(i);
    }
  };

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-black text-white">
      <AsciiSpace />
      <Link
        href="/"
        className="absolute right-4 top-4 z-30 text-xs tracking-widest opacity-60 hover:opacity-100"
      >
        back to site
      </Link>

      {!hasInteracted && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-30 text-xs tracking-widest opacity-50">
          drag a hairline to resize · click a label to widen it
        </div>
      )}

      <div ref={containerRef} className="grid h-full w-full grid-cols-6">
        {COLUMNS.map((col, i) => (
          <div key={col.id} className="column-surface relative h-full overflow-hidden">
            {col.id !== 'identity' && <PixelGlassLayer />}
            {col.id === 'identity' ? (
              <>
                <IdentityGlass
                  media={
                    <LiquidPortrait
                      src="/ParhamBehzad.jpg"
                      alt="Parham Behzad"
                      sizes="320px"
                    />
                  }
                />
                <div className="relative z-10 flex h-full flex-col">
                  <div
                    data-identity-header
                    className="relative z-10 shrink-0"
                    style={{
                      paddingLeft: COLUMN_PAD_X,
                      paddingRight: COLUMN_PAD_X,
                      paddingTop: 24,
                      paddingBottom: 24,
                    }}
                  >
                    <h1
                      className={isMobile ? 'text-2xl leading-[1.05]' : 'text-4xl leading-[1.05]'}
                      style={{ fontWeight: 300, textTransform: 'none' }}
                    >
                      parham
                      <br />
                      behzad
                    </h1>
                    <p className="text-sm tracking-widest opacity-80" style={{ marginTop: 12, fontWeight: 300 }}>
                      composer
                    </p>
                  </div>
                  <div className="min-h-0 flex-1" aria-hidden />
                </div>
              </>
            ) : (
              <div className="relative z-10 flex h-full flex-col">
                <button
                  ref={(el) => {
                    headerRefs.current[i] = el;
                    // globals.css forces font-family on `*` with !important;
                    // setProperty(..., 'important') is the only reliable way
                    // to out-rank that from inline style.
                    if (el) el.style.setProperty('font-family', HEADER_FONT_FAMILY, 'important');
                  }}
                  onClick={() => onHeaderClick(i)}
                  className="shrink-0 w-full overflow-hidden whitespace-nowrap text-left leading-[0.95] tracking-tight transition-colors"
                  style={{
                    paddingLeft: COLUMN_PAD_X,
                    paddingRight: COLUMN_PAD_X,
                    paddingTop: 20,
                    paddingBottom: 20,
                    fontSize: HEADER_MIN_SIZE,
                    fontWeight: HEADER_WEIGHT,
                    color: activeIndex === i ? '#0d0d0d' : '#ffffff',
                    background: activeIndex === i ? 'rgba(190,190,190,0.88)' : 'transparent',
                    boxShadow: activeIndex === i
                      ? 'inset 0 -1px 0 rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.28)'
                      : 'none',
                  }}
                >
                  {col.label}
                </button>

                {col.id === 'about' ? (
                  <div className="flex min-h-0 flex-1 flex-col">
                    <div
                      className="shrink-0 opacity-90"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                        paddingLeft: COLUMN_PAD_X,
                        paddingRight: COLUMN_PAD_X,
                        paddingBottom: 16,
                      }}
                    >
                      {COLUMN_ITEMS.about.map((item, idx) => (
                        <FlowText
                          key={idx}
                          ref={(h) => {
                            const arr = flowRegistryRef.current.get('about') ?? [];
                            arr[idx] = h;
                            flowRegistryRef.current.set('about', arr);
                          }}
                          text={item.title}
                          fontSize={titleFontSize}
                          lineHeight={titleLineHeight}
                        />
                      ))}
                    </div>
                    <div className="relative min-h-0 flex-1">
                      <Image
                        src="/ParhamBehzad.jpg"
                        alt="Parham Behzad portrait"
                        fill
                        sizes="200px"
                        className="object-cover grayscale"
                      />
                    </div>
                  </div>
                ) : (
                  <div
                    className="glass-scrollbar min-h-0 flex-1 overflow-y-auto"
                    style={{ paddingLeft: COLUMN_PAD_X, paddingRight: COLUMN_PAD_X, paddingBottom: 24 }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {(COLUMN_ITEMS[col.id] ?? []).map((item, idx, arr) => (
                        <div
                          key={idx}
                          style={{
                            paddingTop: 14,
                            paddingBottom: 14,
                            borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.25)' : 'none',
                          }}
                        >
                          <FlowText
                            ref={(h) => {
                              const list = flowRegistryRef.current.get(col.id) ?? [];
                              list[idx * 2] = h;
                              flowRegistryRef.current.set(col.id, list);
                            }}
                            text={item.title}
                            fontSize={titleFontSize}
                            lineHeight={titleLineHeight}
                          />
                          {item.meta && (
                            <div style={{ marginTop: 4 }}>
                              <FlowText
                                ref={(h) => {
                                  const list = flowRegistryRef.current.get(col.id) ?? [];
                                  list[idx * 2 + 1] = h;
                                  flowRegistryRef.current.set(col.id, list);
                                }}
                                text={item.meta}
                                fontSize={metaFontSize}
                                lineHeight={metaLineHeight}
                                weight={META_WEIGHT}
                                dim
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 h-full w-full">
        {COLUMNS.slice(0, -1).map((col, i) => (
          <div
            key={`divider-${col.id}`}
            ref={(el) => {
              dividerRefs.current[i] = el;
            }}
            onPointerDown={onDividerPointerDown(i)}
            onPointerMove={onDividerPointerMove}
            onPointerUp={onDividerPointerUp}
            className="group pointer-events-auto absolute top-0 h-full w-3 -translate-x-1/2 cursor-col-resize touch-none select-none"
          >
            <div className="column-glass-divider" />
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import AsciiSpace from './AsciiSpace';
import PixelGlassLayer from './PixelGlassLayer';
import IdentityGlass from './IdentityGlass';
import LiquidPortrait from './LiquidPortrait';
import { glassLens } from './GlassLens';
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
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import type { Composition, ContactInfo, Event, Profile, Text } from '@/data/types';

const MOBILE_BREAKPOINT = 768;
const MOBILE_MIN_WIDTH = 18;
const EQUAL_COLUMN_SHARE = 1 / 6;

const CONTENT_FONT_FAMILY = '"JetBrains Mono", monospace';
const HEADER_FONT_FAMILY = "'Major Mono Display', monospace";
const TITLE_FONT_SIZE = 25;
const TITLE_LINE_HEIGHT = 30;
const TITLE_WEIGHT = 300;
const META_FONT_SIZE = 12;
const META_LINE_HEIGHT = 17;
const META_WEIGHT = 300;
const COLUMN_PAD_X = 12;
const CONTENT_PADDING_X = COLUMN_PAD_X * 2;

const HEADER_WEIGHT = 400;
const HEADER_REF_SIZE = 100;
const HEADER_MIN_SIZE = 24;
const HEADER_MAX_SIZE = 180;
const headerPreparedCache = new Map<string, PreparedTextWithSegments>();

type ColumnId = 'identity' | 'works' | 'events' | 'texts' | 'about' | 'contact';

type ColumnDef = {
  id: ColumnId;
  label: string | null;
  path: string;
  minWidth: number;
  initialShare: number;
};

const COLUMNS: ColumnDef[] = [
  { id: 'identity', label: null, path: '/', minWidth: 46, initialShare: EQUAL_COLUMN_SHARE },
  { id: 'works', label: 'works', path: '/compositions', minWidth: 44, initialShare: EQUAL_COLUMN_SHARE },
  { id: 'events', label: 'events', path: '/events', minWidth: 44, initialShare: EQUAL_COLUMN_SHARE },
  { id: 'texts', label: 'texts', path: '/texts', minWidth: 44, initialShare: EQUAL_COLUMN_SHARE },
  { id: 'about', label: 'about', path: '/about', minWidth: 44, initialShare: EQUAL_COLUMN_SHARE },
  { id: 'contact', label: 'contact', path: '/contact', minWidth: 44, initialShare: EQUAL_COLUMN_SHARE },
];

export type ColumnPortalData = {
  compositions: Composition[];
  events: Event[];
  texts: Text[];
  profile: Profile | null;
  contact: ContactInfo | null;
};

type ColumnItem = {
  title: string;
  meta?: string;
  href?: string;
  external?: boolean;
  dim?: boolean;
  heading?: boolean;
};

type FlowTextHandle = { setWidth: (width: number) => void };

function getMinWidths(): number[] {
  const isMobileNow = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;
  return COLUMNS.map((c) => (isMobileNow ? MOBILE_MIN_WIDTH : c.minWidth));
}

function getHeaderPrepared(label: string): PreparedTextWithSegments {
  let prepared = headerPreparedCache.get(label);
  if (!prepared) {
    prepared = prepareWithSegments(label, `${HEADER_WEIGHT} ${HEADER_REF_SIZE}px ${HEADER_FONT_FAMILY}`);
    headerPreparedCache.set(label, prepared);
  }
  return prepared;
}

function computeHeaderFontSize(label: string, availableWidth: number): number {
  const naturalWidth = measureNaturalWidth(getHeaderPrepared(label));
  if (naturalWidth <= 0) return HEADER_MIN_SIZE;
  const fitted = (availableWidth / naturalWidth) * HEADER_REF_SIZE;
  return Math.min(HEADER_MAX_SIZE, Math.max(HEADER_MIN_SIZE, fitted));
}

function normalizeWidths(raw: number[], mins: number[], total: number): number[] {
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

function getPathActiveIndex(path: string): number | null {
  const normalized = path === '/' ? '/' : path.replace(/\/$/, '');
  const index = COLUMNS.findIndex((column) => column.path === normalized);
  return index > 0 ? index : null;
}

// The selected column (clicked, or matching the URL) gets a gentle emphasis
// on desktop while the rest stay near normal.
const ACTIVE_WIDTH_FACTOR = 1.35;

// mobile opens with the identity column dominant (glass on), others as slim
// tabs the user swipes open
const MOBILE_IDENTITY_SHARE = 0.52;

// A URL-selected content column becomes a focused reading surface on mobile,
// rather than receiving the mild desktop emphasis.
const MOBILE_ACTIVE_SHARE = 0.72;

function getRestingWidths(activeIndex: number | null, total: number, mins: number[]): number[] {
  if (activeIndex === null) {
    const mobile = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;
    const shares = mobile
      ? COLUMNS.map((_, index) =>
          index === 0 ? MOBILE_IDENTITY_SHARE : (1 - MOBILE_IDENTITY_SHARE) / (COLUMNS.length - 1)
        )
      : COLUMNS.map((column) => column.initialShare);
    return normalizeWidths(
      shares.map((share) => share * total),
      mins,
      total
    );
  }

  const mobile = typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT;
  if (mobile) {
    const otherShare = (1 - MOBILE_ACTIVE_SHARE) / (COLUMNS.length - 1);
    return normalizeWidths(
      COLUMNS.map((_, index) => (index === activeIndex ? MOBILE_ACTIVE_SHARE : otherShare) * total),
      mins,
      total
    );
  }

  const share = total / COLUMNS.length;
  const activeWidth = share * ACTIVE_WIDTH_FACTOR;
  const otherWidth = (total - activeWidth) / (COLUMNS.length - 1);
  const next = COLUMNS.map((_, index) => (index === activeIndex ? activeWidth : otherWidth));
  return normalizeWidths(next, mins, total);
}

function yearFrom(value: string | number): string {
  return String(value).slice(0, 4);
}

function ensureExternalHref(value: string): string {
  if (/^(https?:|mailto:)/i.test(value)) return value;
  if (value.includes('@') && !value.includes('/')) return `mailto:${value}`;
  return `https://${value}`;
}

const FlowText = forwardRef<
  FlowTextHandle,
  { text: string; fontSize?: number; lineHeight?: number; weight?: number; dim?: boolean }
>(function FlowText(
  { text, fontSize = TITLE_FONT_SIZE, lineHeight = TITLE_LINE_HEIGHT, weight = TITLE_WEIGHT, dim = false },
  ref
) {
  const fallbackRef = useRef<HTMLSpanElement | null>(null);
  const linesRef = useRef<HTMLDivElement | null>(null);
  const preparedRef = useRef<{ font: string; data: PreparedTextWithSegments } | null>(null);
  const lastLinesKeyRef = useRef<string>('');
  const font = `${weight} ${fontSize}px ${CONTENT_FONT_FAMILY}`;

  useImperativeHandle(
    ref,
    () => ({
      setWidth(width: number) {
        const linesEl = linesRef.current;
        if (!linesEl || width <= 0) return;
        if (!preparedRef.current || preparedRef.current.font !== font) {
          preparedRef.current = { font, data: prepareWithSegments(text, font) };
        }
        const { lines } = layoutWithLines(preparedRef.current.data, width, lineHeight);
        const key = lines.map((line) => line.text).join('\n');
        if (key === lastLinesKeyRef.current) return;

        lastLinesKeyRef.current = key;
        linesEl.textContent = '';
        for (const line of lines) {
          const lineEl = document.createElement('div');
          lineEl.textContent = line.text || ' ';
          linesEl.appendChild(lineEl);
        }
        linesEl.style.display = 'block';
        if (fallbackRef.current) fallbackRef.current.style.display = 'none';
      },
    }),
    [text, font, lineHeight]
  );

  return (
    <span
      style={{
        display: 'block',
        font,
        lineHeight: `${lineHeight}px`,
        opacity: dim ? 0.58 : 1,
        textShadow: '0 0 10px rgba(0,0,0,0.95), 0 1px 0 rgba(0,0,0,0.8)',
      }}
    >
      <span ref={fallbackRef} style={{ overflowWrap: 'anywhere' }}>
        {text}
      </span>
      <span ref={linesRef} style={{ display: 'none', whiteSpace: 'pre' }} />
    </span>
  );
});
FlowText.displayName = 'FlowText';

function ColumnRow({
  item,
  columnId,
  index,
  register,
  titleFontSize,
  titleLineHeight,
  metaFontSize,
  metaLineHeight,
}: {
  item: ColumnItem;
  columnId: ColumnId;
  index: number;
  register: (columnId: ColumnId, index: number, handle: FlowTextHandle | null) => void;
  titleFontSize: number;
  titleLineHeight: number;
  metaFontSize: number;
  metaLineHeight: number;
}) {
  if (item.heading) {
    return (
      <div
        style={{
          fontSize: 11,
          letterSpacing: 3,
          textTransform: 'uppercase',
          fontWeight: 300,
          opacity: 0.55,
        }}
      >
        {item.title}
      </div>
    );
  }

  const content = (
    <>
      <FlowText
        ref={(handle) => register(columnId, index * 2, handle)}
        text={item.title}
        fontSize={titleFontSize}
        lineHeight={titleLineHeight}
        dim={item.dim}
      />
      {item.meta && (
        <span style={{ display: 'block', marginTop: 4 }}>
          <FlowText
            ref={(handle) => register(columnId, index * 2 + 1, handle)}
            text={item.meta}
            fontSize={metaFontSize}
            lineHeight={metaLineHeight}
            weight={META_WEIGHT}
            dim
          />
        </span>
      )}
    </>
  );

  const style = {
    display: 'block',
    borderBottom: 'none',
    color: 'inherit',
    background: 'transparent',
    transition: 'opacity 120ms linear, filter 120ms linear',
  };

  if (!item.href) return <div style={style}>{content}</div>;

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noopener noreferrer" className="column-portal-row-link" style={style}>
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} className="column-portal-row-link" style={style}>
      {content}
    </Link>
  );
}

export default function ColumnPortal({
  data,
  initialPath = '/',
}: {
  data: ColumnPortalData;
  initialPath?: string;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(() => getPathActiveIndex(initialPath));
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const containerWidthRef = useRef(0);
  const widthsRef = useRef<number[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const dragRef = useRef<{ i: number; startX: number; startWidths: number[] } | null>(null);
  const dividerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headerRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const flowRegistryRef = useRef<Map<ColumnId, (FlowTextHandle | null)[]>>(new Map());

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setActiveIndex(getPathActiveIndex(initialPath));
  }, [initialPath]);

  const titleFontSize = isMobile ? 18 : TITLE_FONT_SIZE;
  const titleLineHeight = isMobile ? 22 : TITLE_LINE_HEIGHT;
  const metaFontSize = isMobile ? 11 : META_FONT_SIZE;
  const metaLineHeight = isMobile ? 15 : META_LINE_HEIGHT;

  const itemsByColumn = useMemo<Record<ColumnId, ColumnItem[]>>(() => {
    const works = data.compositions.map((composition) => ({
      title: composition.title,
      meta: `${composition.instruments} - ${yearFrom(composition.year)}`,
      href: `/compositions/${composition.slug}`,
    }));

    const toEventItem = (event: Event): ColumnItem => ({
      title: event.title,
      meta: `${event.date} - ${[event.venue, event.city].filter(Boolean).join(', ')}`,
      href: `/events/${event.slug}`,
    });
    // local date, not toISOString (UTC): near midnight the grouping would
    // otherwise flip an event between upcoming and past
    const now = new Date();
    const today = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-');
    const upcoming = data.events
      .filter((event) => event.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));
    const past = data.events
      .filter((event) => event.date < today)
      .sort((a, b) => b.date.localeCompare(a.date));
    const events: ColumnItem[] = [
      ...(upcoming.length ? [{ title: 'upcoming', heading: true }] : []),
      ...upcoming.map(toEventItem),
      ...(past.length ? [{ title: 'past', heading: true }] : []),
      ...past.map(toEventItem),
    ];

    const texts = data.texts.map((text) => {
      // in-app detail page when the text has markdown content; otherwise
      // fall back to the external/PDF link
      const external = !text.content_file ? text.external_url || text.pdf_url || undefined : undefined;
      return {
        title: text.title,
        meta: `${text.year} - ${text.type}`,
        href: text.content_file ? `/texts/${text.slug}` : external,
        external: !!external,
      };
    });

    const about = [
      data.profile?.bio ? { title: data.profile.bio } : null,
      data.profile?.tagline ? { title: data.profile.tagline, dim: true } : null,
      data.profile?.specializations?.length
        ? { title: data.profile.specializations.join(' / '), dim: true }
        : null,
    ].filter(Boolean) as ColumnItem[];

    const contact = [
      data.contact?.email
        ? { title: data.contact.email, href: ensureExternalHref(data.contact.email), external: true }
        : null,
      data.contact?.website
        ? { title: data.contact.website, href: ensureExternalHref(data.contact.website), external: true }
        : null,
      data.contact?.github
        ? { title: data.contact.github, href: ensureExternalHref(data.contact.github), external: true }
        : null,
      data.contact?.availability_status ? { title: data.contact.availability_status, dim: true } : null,
    ].filter(Boolean) as ColumnItem[];

    return {
      identity: [],
      works,
      events,
      texts,
      about,
      contact,
    };
  }, [data]);

  const registerFlow = useCallback((columnId: ColumnId, index: number, handle: FlowTextHandle | null) => {
    const list = flowRegistryRef.current.get(columnId) ?? [];
    list[index] = handle;
    flowRegistryRef.current.set(columnId, list);
  }, []);

  const positionDividers = useCallback((widths: number[]) => {
    let x = 0;
    for (let i = 0; i < widths.length - 1; i++) {
      x += widths[i];
      const el = dividerRefs.current[i];
      if (el) el.style.left = `${x}px`;
    }
  }, []);

  const reflowContent = useCallback((widths: number[]) => {
    COLUMNS.forEach((column, i) => {
      if (!column.label) return;
      const width = Math.max(widths[i] - CONTENT_PADDING_X, 0);
      const handles = flowRegistryRef.current.get(column.id);
      if (!handles) return;
      handles.forEach((handle) => handle?.setWidth(width));
    });
  }, []);

  const reflowHeaders = useCallback((widths: number[]) => {
    COLUMNS.forEach((column, i) => {
      if (!column.label) return;
      const el = headerRefs.current[i];
      if (!el) return;
      const width = Math.max(widths[i] - CONTENT_PADDING_X, 1);
      el.style.fontSize = `${computeHeaderFontSize(column.label, width)}px`;
    });
  }, []);

  // pretext measures via canvas: metrics captured before Major Mono Display
  // finishes loading are fallback-font metrics, which oversize the headers.
  // fonts.load() alone is not enough on a cold cache — when the Google Fonts
  // stylesheet itself hasn't arrived yet, no face is registered and the
  // promise resolves empty without ever retrying. So keep checking until the
  // face is really available, then re-measure once.
  useEffect(() => {
    const font = `${HEADER_WEIGHT} ${HEADER_REF_SIZE}px ${HEADER_FONT_FAMILY}`;
    let done = false;
    let interval = 0;

    const refit = () => {
      if (done || !document.fonts.check(font)) return;
      done = true;
      document.fonts.removeEventListener('loadingdone', refit);
      window.clearInterval(interval);
      headerPreparedCache.clear();
      if (widthsRef.current.length) reflowHeaders(widthsRef.current);
    };

    document.fonts.load(font).then(refit);
    document.fonts.addEventListener('loadingdone', refit);
    // backstop for the late-stylesheet case, where no font event fires here
    interval = window.setInterval(refit, 250);
    const giveUp = window.setTimeout(() => window.clearInterval(interval), 15000);

    return () => {
      done = true;
      document.fonts.removeEventListener('loadingdone', refit);
      window.clearInterval(interval);
      window.clearTimeout(giveUp);
    };
  }, [reflowHeaders]);

  const applyWidths = useCallback(
    (widths: number[]) => {
      widthsRef.current = widths;
      if (containerRef.current) {
        containerRef.current.style.gridTemplateColumns = widths.map((width) => `${width}px`).join(' ');
      }
      positionDividers(widths);
      reflowContent(widths);
      reflowHeaders(widths);
    },
    [positionDividers, reflowContent, reflowHeaders]
  );

  const applyRestingWidths = useCallback(
    (nextActiveIndex: number | null) => {
      const total = containerWidthRef.current;
      if (!total) return;
      const next = getRestingWidths(nextActiveIndex, total, getMinWidths());
      applyWidths(next);
    },
    [applyWidths]
  );

  const startIdle = useCallback(() => {
    const phases = COLUMNS.map((_, i) => i * 1.2);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const baseAmplitude = reducedMotion ? 0 : 5;
    // Freeze the idle width drift while someone is reading an engaged column,
    // keeping its package lens shape stable and avoiding needless map work.
    let amplitude = baseAmplitude;
    let resting = false;
    let lastApply = 0;
    const tick = (t: number) => {
      // no breathing on mobile: widths drive the glass there, and the
      // constant reflow is wasted battery on a touch screen
      const still = reducedMotion || glassLens.active || window.innerWidth <= MOBILE_BREAKPOINT;
      amplitude += ((still ? 0 : baseAmplitude) - amplitude) * 0.05;
      const base = widthsRef.current;
      const idle = amplitude < 0.05;
      // the sine drifts slowly — reflowing the whole page at 25fps is
      // indistinguishable from 60 and much cheaper (Safari especially)
      if (base.length && !(idle && resting) && t - lastApply >= 40) {
        lastApply = t;
        resting = idle;
        // Identity stays fixed while the other column boundaries breathe.
        const raw = phases.map((phase) => Math.sin(t / 1800 + phase));
        const mean = raw.slice(1).reduce((a, b) => a + b, 0) / (raw.length - 1);
        const jittered = base.map((width, i) => (i === 0 ? width : width + amplitude * (raw[i] - mean)));
        if (containerRef.current) {
          containerRef.current.style.gridTemplateColumns = jittered.map((width) => `${width}px`).join(' ');
        }
        positionDividers(jittered);
        reflowContent(jittered);
        reflowHeaders(jittered);
      }
      rafIdRef.current = requestAnimationFrame(tick);
    };
    rafIdRef.current = requestAnimationFrame(tick);
  }, [positionDividers, reflowContent, reflowHeaders]);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const width = el.getBoundingClientRect().width;
    containerWidthRef.current = width;
    applyWidths(getRestingWidths(activeIndex, width, getMinWidths()));
    startIdle();

    const ro = new ResizeObserver((entries) => {
      const newWidth = entries[0].contentRect.width;
      const oldWidth = containerWidthRef.current || newWidth;
      if (Math.abs(newWidth - oldWidth) < 1) return;
      const rescaled = normalizeWidths(
        widthsRef.current.map((width) => (width / oldWidth) * newWidth),
        getMinWidths(),
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
  }, [activeIndex, applyWidths, startIdle]);

  const markInteracted = useCallback(() => {
    setHasInteracted(true);
  }, []);

  const onHeaderClick = (i: number) => {
    markInteracted();
    setActiveIndex(i);
    applyRestingWidths(i);
  };

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
    const donorIndices =
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

  return (
    <main className="column-portal relative h-dvh w-screen overflow-hidden bg-black text-white">
      <AsciiSpace />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/20" />

      {/* initial template comes from CSS (.column-portal-grid) so the first
          paint is already viewport-correct — JS takes over with inline px
          widths after hydration */}
      <div
        ref={containerRef}
        className="column-portal-grid relative z-10 grid h-full w-full"
        data-active-col={activeIndex ?? undefined}
      >
        {COLUMNS.map((column, i) => {
          const isActive = activeIndex === i;
          const IdentityTitle = activeIndex === null ? 'h1' : 'div';
          const SectionTitle = isActive ? 'h1' : 'h2';
          return (
            <section
              key={column.id}
              aria-labelledby={column.label ? `${column.id}-heading` : undefined}
              className="column-surface relative h-full overflow-hidden border-r border-white/10"
              style={{
                background: isActive ? 'rgba(4,6,9,0.18)' : 'rgba(4,6,9,0.08)',
              }}
            >
              {column.id !== 'identity' && <PixelGlassLayer selected={isActive} />}
              {column.id === 'identity' ? (
                <>
                  <IdentityGlass
                    media={
                      <LiquidPortrait
                        src="/ParhamBehzad-display.jpg"
                        alt="Parham Behzad"
                        priority
                        unoptimized
                      />
                    }
                  />
                  <div className="relative z-10 flex h-full flex-col">
                    <Link
                      href="/"
                      data-identity-header
                      className="column-portal-identity-link relative z-10 shrink-0 text-white"
                      style={{
                        borderBottom: 'none',
                        background: 'transparent',
                        paddingLeft: COLUMN_PAD_X,
                        paddingRight: COLUMN_PAD_X,
                        paddingTop: 24,
                        paddingBottom: 24,
                      }}
                    >
                      <IdentityTitle
                        className={isMobile ? 'text-2xl leading-[1.05]' : 'text-4xl leading-[1.05]'}
                        style={{ fontWeight: 300, letterSpacing: 0, textTransform: 'none' }}
                      >
                        parham
                        <br />
                        behzad
                      </IdentityTitle>
                      <p className="text-sm tracking-widest opacity-75" style={{ marginTop: 12, fontWeight: 300 }}>
                        {data.profile?.title?.toLowerCase() || 'composer'}
                      </p>
                    </Link>
                    <div className="min-h-0 flex-1" aria-hidden />
                  </div>
                </>
              ) : (
                <div className="relative z-10 flex h-full flex-col">
                  <SectionTitle
                    id={`${column.id}-heading`}
                    className="shrink-0 w-full overflow-hidden whitespace-nowrap text-left leading-[0.95] tracking-tight transition-colors"
                    style={{
                      margin: 0,
                      fontSize: HEADER_MIN_SIZE,
                      fontWeight: HEADER_WEIGHT,
                      letterSpacing: 0,
                      textTransform: 'none',
                    }}
                  >
                    <Link
                      ref={(el) => {
                        headerRefs.current[i] = el;
                        if (el) el.style.setProperty('font-family', HEADER_FONT_FAMILY, 'important');
                      }}
                      href={column.path}
                      onClick={() => onHeaderClick(i)}
                      className="column-portal-heading-link"
                      data-active={isActive ? 'true' : 'false'}
                      style={{
                        borderBottom: 'none',
                        display: 'block',
                        paddingLeft: COLUMN_PAD_X,
                        paddingRight: COLUMN_PAD_X,
                        paddingTop: 20,
                        paddingBottom: 20,
                        fontSize: 'inherit',
                        fontWeight: 'inherit',
                        lineHeight: 'inherit',
                        color: '#ffffff',
                        background: 'transparent',
                        opacity: isActive ? 1 : 0.72,
                      }}
                    >
                      {column.label}
                    </Link>
                  </SectionTitle>

                  <div
                    className="glass-scrollbar min-h-0 flex-1 overflow-y-auto"
                    style={{
                      paddingLeft: COLUMN_PAD_X,
                      paddingRight: COLUMN_PAD_X,
                      paddingBottom: 28,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {itemsByColumn[column.id].map((item, idx, arr) => (
                        <div
                          key={`${column.id}-${idx}-${item.title}`}
                          style={{
                            paddingTop: item.heading ? (idx === 0 ? 14 : 26) : 14,
                            paddingBottom: item.heading ? 2 : 14,
                            borderBottom:
                              !item.heading && idx < arr.length - 1 && !arr[idx + 1]?.heading
                                ? '1px solid rgba(255,255,255,0.18)'
                                : 'none',
                          }}
                        >
                          <ColumnRow
                            item={item}
                            columnId={column.id}
                            index={idx}
                            register={registerFlow}
                            titleFontSize={titleFontSize}
                            titleLineHeight={titleLineHeight}
                            metaFontSize={metaFontSize}
                            metaLineHeight={metaLineHeight}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-4 left-4 z-30 text-xs tracking-widest opacity-45">
        &copy; {new Date().getFullYear()} parham behzad
      </div>

      <div className="pointer-events-none absolute inset-0 z-20 h-full w-full">
        {COLUMNS.slice(0, -1).map((column, i) => (
          <div
            key={`divider-${column.id}`}
            ref={(el) => {
              dividerRefs.current[i] = el;
            }}
            onPointerDown={onDividerPointerDown(i)}
            onPointerMove={onDividerPointerMove}
            onPointerUp={onDividerPointerUp}
            className="group pointer-events-auto absolute top-0 h-full w-3 -translate-x-1/2 cursor-col-resize touch-none select-none"
          >
            <div className="column-glass-divider" />
            {i === 0 && !hasInteracted && (
              <div className="column-swipe-hint" aria-hidden>
                ‹
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}

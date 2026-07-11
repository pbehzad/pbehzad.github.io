// Aave-style refraction lens (https://aave.com/design/building-glass-for-the-web)
// applied to the ASCII background layer. A single SVG filter carries the whole
// optical stack — displacement-map refraction with a subtle chromatic split,
// frost blur, and brightness lift — and is driven per frame through cheap
// attribute updates only. The displacement map is regenerated rarely: on
// activation and on real size/shape changes.
//
// The filter is applied to the layer's *painted content* (`filter: url(#…)`),
// not via backdrop-filter, so it works cross-browser. Per the article, Safari
// caches filters by ID, so the filter gets a fresh ID whenever the
// displacement map is regenerated.
//
// A column can also mark one of its own layers with .glass-extra-host (the
// identity column's portrait) — that layer gets a twin filter with the same
// map in its local coordinates, so content painted above the ASCII goes
// under the glass too.

const HOST_SELECTOR = '.ascii-lens-host';
export const EXTRA_HOST_CLASS = 'glass-extra-host';
const SVG_NS = 'http://www.w3.org/2000/svg';
const XLINK_NS = 'http://www.w3.org/1999/xlink';
const REGEN_THRESHOLD = 12; // px of size drift before map regen

// Live-tunable optics (see GlassTunerPanel). Map-shape values (edgeBand,
// cornerRadius, curvature) trigger a displacement-map rebuild via
// glassLens.refresh().
// Parham's picked values (2026-07-10) — retune via /?tune
export const glassTuning = {
  depth: 80, // displacement strength at full formation
  edgeBand: 120, // px ring where refraction bends
  cornerRadius: 60,
  curvature: 1.8, // dome profile exponent — higher = flatter center, steeper edge
  chroma: 0.3, // ±per-channel scale split
  blur: 16,
  brightness: 1.15,
  tint: 0.05, // pane surface wash (consumed by PixelGlassLayer)
  edgeHighlight: 0.7, // specular rim strength (consumed by PixelGlassLayer)
  formMs: 620,
  meltMs: 420,
};

type Rect = { x: number; y: number; width: number; height: number };

type FilterParts = {
  svg: SVGSVGElement;
  filter: SVGFilterElement;
  map: SVGFEImageElement;
  bends: SVGFEDisplacementMapElement[];
  blur: SVGFEGaussianBlurElement;
  lit: SVGFEColorMatrixElement;
  mask: SVGFEFloodElement;
  geomKey: string;
  opticsKey: string;
};

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string>): SVGElementTagNameMap[K] {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
}

function setHref(image: SVGFEImageElement, uri: string) {
  image.setAttribute('href', uri);
  image.setAttributeNS(XLINK_NS, 'xlink:href', uri);
}

function roundedRectInsideDistance(x: number, y: number, w: number, h: number, r: number): number {
  // signed distance from a point to the border of a rounded rect (positive inside)
  const qx = Math.abs(x - w / 2) - (w / 2 - r);
  const qy = Math.abs(y - h / 2) - (h / 2 - r);
  const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0));
  const inside = Math.min(Math.max(qx, qy), 0);
  return -(outside + inside - r);
}

// R/G channels encode the sampling direction. The vectors point INWARD with a
// dome profile (flat center, steep edge): sampling toward the lens interior
// magnifies, which is what makes it read as thick glass instead of a smear.
// Only the top-left quadrant is computed; the rest is mirrored with the x/y
// components negated (Aave's four-fold symmetry optimization).
function buildDisplacementMap(
  w: number,
  h: number,
  edgeBand: number,
  cornerRadius: number,
  curvature: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const image = ctx.createImageData(w, h);
  const data = image.data;
  const halfW = Math.ceil(w / 2);
  const halfH = Math.ceil(h / 2);
  const eps = 1;

  const put = (px: number, py: number, nx: number, ny: number, mag: number) => {
    const i = (py * w + px) * 4;
    data[i] = Math.round(128 + nx * 127 * mag);
    data[i + 1] = Math.round(128 + ny * 127 * mag);
    data[i + 2] = 128;
    data[i + 3] = 255;
  };

  for (let y = 0; y < halfH; y++) {
    for (let x = 0; x < halfW; x++) {
      const d = roundedRectInsideDistance(x + 0.5, y + 0.5, w, h, cornerRadius);
      const t = Math.min(1, Math.max(0, 1 - d / edgeBand));
      const mag = Math.pow(t, curvature);
      let nx = 0;
      let ny = 0;
      if (mag > 0.004) {
        // inward normal = gradient of the inside-distance field, so edge
        // pixels sample from just outside the lens — dome magnification
        nx = d - roundedRectInsideDistance(x + 0.5 - eps, y + 0.5, w, h, cornerRadius);
        ny = d - roundedRectInsideDistance(x + 0.5, y + 0.5 - eps, w, h, cornerRadius);
        const len = Math.hypot(nx, ny) || 1;
        nx /= len;
        ny /= len;
      }
      const mx = w - 1 - x;
      const my = h - 1 - y;
      put(x, y, nx, ny, mag);
      put(mx, y, -nx, ny, mag);
      put(x, my, nx, -ny, mag);
      put(mx, my, -nx, -ny, mag);
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL('image/png');
}

// Several lenses can be live at once (the identity column rests with glass ON
// while another column is hovered), so each activation owns a LensInstance and
// the host element chains every active filter: `filter: url(#a) url(#b)`.
// The regions are disjoint, and each filter passes untouched content through,
// so chaining composes cleanly.
type LensInstance = {
  parts: FilterParts;
  extraParts: FilterParts | null;
  extraHost: HTMLElement | null;
  mapUri: string;
  mapW: number;
  mapH: number;
  mapEdgeBand: number;
  mapRadius: number;
  mapCurvature: number;
  lastRect: Rect;
  lastProgress: number;
  freezesBreathing: boolean;
};

class GlassLensController {
  private lenses = new Map<object, LensInstance>();
  private generation = 0;

  private buildFilter(suffix: string): FilterParts {
    const id = `pixel-glass-lens${suffix}-${this.generation}`;
    const filter = el('filter', {
      id,
      x: '-5%',
      y: '-5%',
      width: '110%',
      height: '110%',
      'color-interpolation-filters': 'sRGB',
    });

    const map = el('feImage', { result: 'map', preserveAspectRatio: 'none' });
    filter.appendChild(map);

    // three bends at slightly different strengths = chromatic fringe;
    // every pass keeps its alpha (screen-blending disjoint channels is
    // additive; zeroed alpha would annihilate the color when premultiplied)
    const channels: Array<[string, string]> = [
      ['bentR', '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0'],
      ['bentG', '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0'],
      ['bentB', '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0'],
    ];
    const bends: SVGFEDisplacementMapElement[] = [];
    for (const [result] of channels) {
      const bend = el('feDisplacementMap', {
        in: 'SourceGraphic',
        in2: 'map',
        scale: '0',
        xChannelSelector: 'R',
        yChannelSelector: 'G',
        result,
      });
      bends.push(bend);
      filter.appendChild(bend);
    }
    for (const [result, values] of channels) {
      filter.appendChild(el('feColorMatrix', { in: result, type: 'matrix', values, result: `ch_${result}` }));
    }
    filter.appendChild(el('feBlend', { in: 'ch_bentR', in2: 'ch_bentG', mode: 'screen', result: 'cRG' }));
    filter.appendChild(el('feBlend', { in: 'cRG', in2: 'ch_bentB', mode: 'screen', result: 'bent' }));

    const blur = el('feGaussianBlur', { in: 'bent', stdDeviation: '0', result: 'frost' });
    filter.appendChild(blur);

    const lit = el('feColorMatrix', {
      in: 'frost',
      type: 'matrix',
      values: this.litValues(),
      result: 'lit',
    });
    filter.appendChild(lit);

    // uniform crossfade mask: the glass region fades in as one material
    const mask = el('feFlood', { 'flood-color': '#ffffff', 'flood-opacity': '0', result: 'mask' });
    filter.appendChild(mask);

    filter.appendChild(el('feComposite', { in: 'lit', in2: 'mask', operator: 'in', result: 'glass' }));
    filter.appendChild(el('feComposite', { in: 'SourceGraphic', in2: 'mask', operator: 'out', result: 'clear' }));
    const merge = el('feMerge', {});
    merge.appendChild(el('feMergeNode', { in: 'clear' }));
    merge.appendChild(el('feMergeNode', { in: 'glass' }));
    filter.appendChild(merge);

    const svg = el('svg', { width: '0', height: '0', 'aria-hidden': 'true' });
    svg.style.position = 'absolute';
    svg.style.overflow = 'hidden';
    const defs = el('defs', {});
    defs.appendChild(filter);
    svg.appendChild(defs);
    document.body.appendChild(svg);

    return { svg, filter, map, bends, blur, lit, mask, geomKey: '', opticsKey: '' };
  }

  private litValues(): string {
    const b = glassTuning.brightness;
    return `${b} 0 0 0 0  0 ${b} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`;
  }

  private host(): HTMLElement | null {
    return document.querySelector<HTMLElement>(HOST_SELECTOR);
  }

  private applyGeometry(parts: FilterParts, x: number, y: number, w: number, h: number) {
    const pad = Math.ceil(glassTuning.blur * 3);
    const geomKey = `${x},${y},${w},${h},${pad}`;
    if (geomKey === parts.geomKey) return;
    parts.geomKey = geomKey;
    const geometry = (node: SVGElement, gx: number, gy: number, gw: number, gh: number) => {
      node.setAttribute('x', String(gx));
      node.setAttribute('y', String(gy));
      node.setAttribute('width', String(gw));
      node.setAttribute('height', String(gh));
    };
    geometry(parts.map, x, y, w, h);
    geometry(parts.mask, x, y, w, h); // exact clip of the glass region
    for (const bend of parts.bends) geometry(bend, x - pad, y - pad, w + pad * 2, h + pad * 2);
    geometry(parts.blur, x - pad, y - pad, w + pad * 2, h + pad * 2);
  }

  private applyOptics(parts: FilterParts, progress: number) {
    const strength = progress * glassTuning.depth;
    const opticsKey = `${strength.toFixed(2)},${glassTuning.chroma},${glassTuning.blur},${glassTuning.brightness},${progress.toFixed(3)}`;
    if (opticsKey === parts.opticsKey) return;
    parts.opticsKey = opticsKey;
    parts.bends[0].setAttribute('scale', (strength * (1 - glassTuning.chroma)).toFixed(2));
    parts.bends[1].setAttribute('scale', strength.toFixed(2));
    parts.bends[2].setAttribute('scale', (strength * (1 + glassTuning.chroma)).toFixed(2));
    parts.blur.setAttribute('stdDeviation', (progress * glassTuning.blur).toFixed(2));
    parts.lit.setAttribute('values', this.litValues());
    parts.mask.setAttribute('flood-opacity', Math.min(1, Math.max(0, progress)).toFixed(3));
  }

  private syncHostFilter() {
    const host = this.host();
    if (!host) return;
    const refs = [...this.lenses.values()].map((lens) => `url(#${lens.parts.filter.id})`);
    host.style.filter = refs.join(' ');
  }

  private ensureLens(lens: LensInstance, viewportRect: Rect) {
    const needsRegen =
      Math.abs(viewportRect.width - lens.mapW) > REGEN_THRESHOLD ||
      Math.abs(viewportRect.height - lens.mapH) > REGEN_THRESHOLD ||
      glassTuning.edgeBand !== lens.mapEdgeBand ||
      glassTuning.cornerRadius !== lens.mapRadius ||
      glassTuning.curvature !== lens.mapCurvature;
    if (!needsRegen) return;

    // fresh filter IDs on every map regeneration — Safari caches by ID
    lens.parts.svg.remove();
    lens.extraParts?.svg.remove();
    this.generation += 1;
    lens.parts = this.buildFilter('');
    lens.mapW = Math.round(viewportRect.width);
    lens.mapH = Math.round(viewportRect.height);
    lens.mapEdgeBand = glassTuning.edgeBand;
    lens.mapRadius = glassTuning.cornerRadius;
    lens.mapCurvature = glassTuning.curvature;
    lens.mapUri = buildDisplacementMap(lens.mapW, lens.mapH, lens.mapEdgeBand, lens.mapRadius, lens.mapCurvature);
    setHref(lens.parts.map, lens.mapUri);
    if (lens.extraHost) {
      // twin filter for the column's own layer, same map in local coordinates
      lens.extraParts = this.buildFilter('-x');
      setHref(lens.extraParts.map, lens.mapUri);
      lens.extraHost.style.filter = `url(#${lens.extraParts.filter.id})`;
    } else {
      lens.extraParts = null;
    }
    this.syncHostFilter();
  }

  activate(
    owner: object,
    viewportRect: Rect,
    progress = 0,
    extraHost: HTMLElement | null = null,
    options?: { freezesBreathing?: boolean }
  ): boolean {
    const host = this.host();
    if (!host) return false;

    let lens = this.lenses.get(owner);
    if (!lens) {
      this.generation += 1;
      lens = {
        parts: this.buildFilter(''),
        extraParts: null,
        extraHost,
        mapUri: '',
        mapW: -1,
        mapH: -1,
        mapEdgeBand: -1,
        mapRadius: -1,
        mapCurvature: -1,
        lastRect: viewportRect,
        lastProgress: progress,
        freezesBreathing: options?.freezesBreathing ?? true,
      };
      this.lenses.set(owner, lens);
    }
    lens.freezesBreathing = options?.freezesBreathing ?? lens.freezesBreathing;
    if (lens.extraHost && lens.extraHost !== extraHost) lens.extraHost.style.filter = '';
    lens.extraHost = extraHost;
    // from here on the lens owns the layer's filter — disable the CSS
    // first-paint frost fallback so releasing actually clears the glass
    if (extraHost) extraHost.dataset.lensManaged = 'true';
    this.ensureLens(lens, viewportRect);
    if (extraHost && lens.extraParts) extraHost.style.filter = `url(#${lens.extraParts.filter.id})`;
    this.syncHostFilter();
    this.update(owner, viewportRect, progress);
    return true;
  }

  update(owner: object, viewportRect: Rect, progress: number) {
    const lens = this.lenses.get(owner);
    if (!lens) return;
    const host = this.host();
    if (!host) return;
    lens.lastRect = viewportRect;
    lens.lastProgress = progress;

    const hostRect = host.getBoundingClientRect();
    // quantize to whole pixels: sub-pixel geometry churn makes the refracted
    // content shimmer, and any attribute write invalidates the whole filter
    this.applyGeometry(
      lens.parts,
      Math.round(viewportRect.x - hostRect.x),
      Math.round(viewportRect.y - hostRect.y),
      Math.round(viewportRect.width),
      Math.round(viewportRect.height)
    );
    this.applyOptics(lens.parts, progress);

    if (lens.extraHost && lens.extraParts) {
      // the extra host IS the lensed layer, so the lens fills its own box;
      // the shared map stretches to fit (feImage preserveAspectRatio=none)
      const extraRect = lens.extraHost.getBoundingClientRect();
      this.applyGeometry(lens.extraParts, 0, 0, Math.round(extraRect.width), Math.round(extraRect.height));
      this.applyOptics(lens.extraParts, progress);
    }
  }

  // true while any hover lens is up — the identity column's resting lens
  // opts out so it doesn't freeze the idle breathing forever
  get active(): boolean {
    return [...this.lenses.values()].some((lens) => lens.freezesBreathing);
  }

  // re-apply after tuning changes (map shape params need a rebuild)
  refresh() {
    for (const [owner, lens] of this.lenses) {
      this.ensureLens(lens, lens.lastRect);
      lens.parts.opticsKey = '';
      if (lens.extraParts) lens.extraParts.opticsKey = '';
      this.update(owner, lens.lastRect, lens.lastProgress);
    }
  }

  release(owner: object) {
    const lens = this.lenses.get(owner);
    if (!lens) return;
    this.lenses.delete(owner);
    lens.parts.svg.remove();
    lens.extraParts?.svg.remove();
    if (lens.extraHost) lens.extraHost.style.filter = '';
    this.syncHostFilter();
  }
}

export const glassLens = new GlassLensController();

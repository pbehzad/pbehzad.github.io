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

const HOST_SELECTOR = '.ascii-lens-host';
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
  tint: 0, // pane surface wash (consumed by PixelGlassLayer)
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

class GlassLensController {
  private parts: FilterParts | null = null;
  private owner: object | null = null;
  private lastGeomKey = '';
  private lastOpticsKey = '';
  private generation = 0;
  private mapW = 0;
  private mapH = 0;
  private mapEdgeBand = 0;
  private mapRadius = 0;
  private mapCurvature = 0;
  private lastRect: Rect | null = null;
  private lastProgress = 0;

  private buildFilter(): FilterParts {
    const id = `pixel-glass-lens-${this.generation}`;
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

    return { svg, filter, map, bends, blur, lit, mask };
  }

  private litValues(): string {
    const b = glassTuning.brightness;
    return `${b} 0 0 0 0  0 ${b} 0 0 0  0 0 ${b} 0 0  0 0 0 1 0`;
  }

  private host(): HTMLElement | null {
    return document.querySelector<HTMLElement>(HOST_SELECTOR);
  }

  private ensureFilter(viewportRect: Rect) {
    const needsRegen =
      !this.parts ||
      Math.abs(viewportRect.width - this.mapW) > REGEN_THRESHOLD ||
      Math.abs(viewportRect.height - this.mapH) > REGEN_THRESHOLD ||
      glassTuning.edgeBand !== this.mapEdgeBand ||
      glassTuning.cornerRadius !== this.mapRadius ||
      glassTuning.curvature !== this.mapCurvature;
    if (!needsRegen) return;

    // fresh filter ID on every map regeneration — Safari caches by ID
    this.parts?.svg.remove();
    this.generation += 1;
    this.parts = this.buildFilter();
    this.lastGeomKey = '';
    this.lastOpticsKey = '';
    this.mapW = Math.round(viewportRect.width);
    this.mapH = Math.round(viewportRect.height);
    this.mapEdgeBand = glassTuning.edgeBand;
    this.mapRadius = glassTuning.cornerRadius;
    this.mapCurvature = glassTuning.curvature;
    setHref(
      this.parts.map,
      buildDisplacementMap(this.mapW, this.mapH, this.mapEdgeBand, this.mapRadius, this.mapCurvature)
    );
  }

  activate(owner: object, viewportRect: Rect, progress = 0): boolean {
    const host = this.host();
    if (!host) return false;
    this.owner = owner;
    this.ensureFilter(viewportRect);
    host.style.filter = `url(#${this.parts!.filter.id})`;
    this.update(owner, viewportRect, progress);
    return true;
  }

  update(owner: object, viewportRect: Rect, progress: number) {
    if (this.owner !== owner || !this.parts) return;
    const host = this.host();
    if (!host) return;
    this.lastRect = viewportRect;
    this.lastProgress = progress;

    const hostRect = host.getBoundingClientRect();
    // quantize to whole pixels: sub-pixel geometry churn makes the refracted
    // content shimmer, and any attribute write invalidates the whole filter
    const x = Math.round(viewportRect.x - hostRect.x);
    const y = Math.round(viewportRect.y - hostRect.y);
    const w = Math.round(viewportRect.width);
    const h = Math.round(viewportRect.height);
    const pad = Math.ceil(glassTuning.blur * 3);

    const { map, bends, blur, lit, mask } = this.parts;

    const geomKey = `${x},${y},${w},${h},${pad}`;
    if (geomKey !== this.lastGeomKey) {
      this.lastGeomKey = geomKey;
      const geometry = (node: SVGElement, gx: number, gy: number, gw: number, gh: number) => {
        node.setAttribute('x', String(gx));
        node.setAttribute('y', String(gy));
        node.setAttribute('width', String(gw));
        node.setAttribute('height', String(gh));
      };
      geometry(map, x, y, w, h);
      geometry(mask, x, y, w, h); // exact clip of the glass region
      for (const bend of bends) geometry(bend, x - pad, y - pad, w + pad * 2, h + pad * 2);
      geometry(blur, x - pad, y - pad, w + pad * 2, h + pad * 2);
    }

    const strength = progress * glassTuning.depth;
    const opticsKey = `${strength.toFixed(2)},${glassTuning.chroma},${glassTuning.blur},${glassTuning.brightness},${progress.toFixed(3)}`;
    if (opticsKey !== this.lastOpticsKey) {
      this.lastOpticsKey = opticsKey;
      bends[0].setAttribute('scale', (strength * (1 - glassTuning.chroma)).toFixed(2));
      bends[1].setAttribute('scale', strength.toFixed(2));
      bends[2].setAttribute('scale', (strength * (1 + glassTuning.chroma)).toFixed(2));
      blur.setAttribute('stdDeviation', (progress * glassTuning.blur).toFixed(2));
      lit.setAttribute('values', this.litValues());
      mask.setAttribute('flood-opacity', Math.min(1, Math.max(0, progress)).toFixed(3));
    }
  }

  get active(): boolean {
    return this.owner !== null;
  }

  // re-apply after tuning changes (map shape params need a rebuild)
  refresh() {
    if (!this.owner || !this.lastRect) return;
    const host = this.host();
    if (!host) return;
    this.ensureFilter(this.lastRect);
    host.style.filter = `url(#${this.parts!.filter.id})`;
    this.update(this.owner, this.lastRect, this.lastProgress);
  }

  release(owner: object) {
    if (this.owner !== owner) return;
    this.owner = null;
    this.lastRect = null;
    const host = this.host();
    if (host) host.style.filter = '';
  }
}

export const glassLens = new GlassLensController();

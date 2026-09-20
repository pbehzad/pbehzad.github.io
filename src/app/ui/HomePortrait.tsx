import type { CSSProperties } from 'react';
import Image from 'next/image';
import { HomePortraitRefraction } from './HomePortraitRefraction';
import { HOME_PORTRAIT_RIM_MAP, HOME_PORTRAIT_TRACE } from './homePortraitAssets';
import {
  PHOTO_SOURCE_SIZE,
  RIM_DEPTH,
  TRACE_BOX,
  TRACE_COLUMNS,
  TRACE_LINE_HEIGHT,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './homePortraitGeometry';
import { PORTRAIT_SHAPE_MASK, PORTRAIT_SHAPE_PATH } from './portraitShape';

const PORTRAIT_SRC = '/ParhamBehzad-display.jpg';

// The photo's film grain dominates file size: at 1440 px, quality 75 is
// about 250 kB of AVIF and quality 65 about 80 kB with the detail intact.
const PORTRAIT_QUALITY = 65;
// The photo is drawn at 140% of the frame width (see home.css), so these are
// 1.4 times the frame: 21rem on phones, about 53.5vw up to 48rem above that.
const PORTRAIT_SIZES = '(max-width: 40rem) 29.4rem, (max-width: 90rem) 75vw, 1080px';

// The trace grid spans TRACE_BOX.width of the frame across TRACE_COLUMNS
// glyphs of 0.6em each, so its font size follows the frame.
const TRACE_STYLE = {
  insetInlineStart: `${TRACE_BOX.left * 100}%`,
  insetBlockStart: `${TRACE_BOX.top * 100}%`,
  fontSize: `calc(var(--portrait-inline-size) * ${(TRACE_BOX.width / (TRACE_COLUMNS * 0.6)).toFixed(6)})`,
  lineHeight: TRACE_LINE_HEIGHT,
} satisfies CSSProperties;

const SHAPE_TRANSFORM = `scale(${VIEW_WIDTH} ${VIEW_HEIGHT})`;

// Sample offset at the very edge is half the scale; red, green, and blue
// bend by slightly different amounts for the chromatic fringe.
const CHANNELS = [
  { name: 'r', scale: Math.round(RIM_DEPTH * 1.5), matrix: '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0' },
  { name: 'g', scale: Math.round(RIM_DEPTH * 1.66), matrix: '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0' },
  { name: 'b', scale: Math.round(RIM_DEPTH * 1.82), matrix: '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0' },
] as const;

type HomePortraitProps = {
  alt: string;
};

/**
 * The home signature: one portrait inside one organic liquid form.
 *
 * Layers, back to front:
 * - a faint static ASCII trace of the photo, outside the form;
 * - the photo cropped by the organic outline (the finished flat version);
 * - the same photo refracted through a thick rim, once the browser has the
 *   image (HomePortraitRefraction);
 * - light computed from the outline: cool key, crisp edge, warm spill;
 * - a hairline along the outline.
 *
 * Nothing animates or redraws after first paint. Without JavaScript, or if
 * a filter cannot render, the flat photo, light, and trace remain.
 */
export function HomePortrait({ alt }: HomePortraitProps) {
  return (
    <div className="ui-home-portrait">
      <pre className="ui-home-portrait__trace" style={TRACE_STYLE} aria-hidden="true">
        {HOME_PORTRAIT_TRACE}
      </pre>
      <div className="ui-home-portrait__photo" style={{ maskImage: PORTRAIT_SHAPE_MASK }}>
        <Image
          src={PORTRAIT_SRC}
          alt={alt}
          width={PHOTO_SOURCE_SIZE}
          height={PHOTO_SOURCE_SIZE}
          sizes={PORTRAIT_SIZES}
          quality={PORTRAIT_QUALITY}
          priority
        />
      </div>
      <HomePortraitRefraction />
      <svg
        className="ui-home-portrait__light"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <PortraitGlassDefs />
        {/* The filter sits on an untransformed group so its region is in
            view-box units; the outline itself is scaled from the 0–1 box. */}
        <g className="ui-home-portrait__light-shape" filter="url(#home-portrait-light)">
          <path d={PORTRAIT_SHAPE_PATH} transform={SHAPE_TRANSFORM} />
        </g>
        <path className="ui-home-portrait__rim" d={PORTRAIT_SHAPE_PATH} transform={SHAPE_TRANSFORM} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/**
 * Static filters for the glass. Light is computed rather than painted: the outline's alpha,
 * blurred, is a height map lit at a low angle, so only the curved rim
 * catches light. A thick soft pass gives the body of the edge, thin passes
 * the crisp highlight on both sides, and a warm light from the lower right also spills a
 * little outside the form, as in the mockup. The shape's own fill is almost
 * transparent, so its alpha is amplified back to a solid shape first.
 */
function PortraitGlassDefs() {
  return (
    <defs>
      <clipPath id="home-portrait-clip">
        <path d={PORTRAIT_SHAPE_PATH} transform={SHAPE_TRANSFORM} />
      </clipPath>

      {/* Refraction for HomePortraitRefraction: the generated map pushes
          samples inward along the rim, per colour channel. */}
      <filter
        id="home-portrait-refract"
        filterUnits="userSpaceOnUse"
        primitiveUnits="userSpaceOnUse"
        x={0}
        y={0}
        width={VIEW_WIDTH}
        height={VIEW_HEIGHT}
        colorInterpolationFilters="sRGB"
      >
        <feImage href={HOME_PORTRAIT_RIM_MAP} x={0} y={0} width={VIEW_WIDTH} height={VIEW_HEIGHT} preserveAspectRatio="none" result="map" />
        {CHANNELS.map((channel) => (
          <feDisplacementMap
            key={`${channel.name}-shift`}
            in="SourceGraphic"
            in2="map"
            scale={channel.scale}
            xChannelSelector="R"
            yChannelSelector="G"
            result={`${channel.name}Shifted`}
          />
        ))}
        {CHANNELS.map((channel) => (
          <feColorMatrix
            key={`${channel.name}-isolate`}
            in={`${channel.name}Shifted`}
            type="matrix"
            values={channel.matrix}
            result={`${channel.name}Only`}
          />
        ))}
        <feBlend in="rOnly" in2="gOnly" mode="screen" result="rg" />
        <feBlend in="rg" in2="bOnly" mode="screen" />
      </filter>

      <filter
        id="home-portrait-light"
        filterUnits="userSpaceOnUse"
        primitiveUnits="userSpaceOnUse"
        x={-120}
        y={-120}
        width={VIEW_WIDTH + 240}
        height={VIEW_HEIGHT + 240}
        colorInterpolationFilters="sRGB"
      >
        <feComponentTransfer in="SourceAlpha" result="shape">
          <feFuncA type="linear" slope="100" />
        </feComponentTransfer>

        <feGaussianBlur in="shape" stdDeviation="24" result="thick" />
        <feSpecularLighting in="thick" surfaceScale="16" specularConstant="2" specularExponent="26" lightingColor="#e6eeff" result="key">
          <feDistantLight azimuth="225" elevation="20" />
        </feSpecularLighting>
        <feSpecularLighting in="thick" surfaceScale="16" specularConstant="1.4" specularExponent="26" lightingColor="#f4c28a" result="warm">
          <feDistantLight azimuth="45" elevation="20" />
        </feSpecularLighting>

        <feGaussianBlur in="shape" stdDeviation="4" result="thin" />
        <feSpecularLighting in="thin" surfaceScale="5" specularConstant="2.2" specularExponent="40" lightingColor="#ffffff" result="edge">
          <feDistantLight azimuth="225" elevation="26" />
        </feSpecularLighting>
        <feSpecularLighting in="thin" surfaceScale="5" specularConstant="1.2" specularExponent="40" lightingColor="#ffe2bd" result="edgeWarm">
          <feDistantLight azimuth="45" elevation="26" />
        </feSpecularLighting>

        <feMerge result="lights">
          <feMergeNode in="key" />
          <feMergeNode in="warm" />
          <feMergeNode in="edge" />
          <feMergeNode in="edgeWarm" />
        </feMerge>
        {/* Softens 8-bit height-map quantization, which reads as grain. */}
        <feGaussianBlur in="lights" stdDeviation="1" result="smooth" />
        <feComposite in="smooth" in2="shape" operator="in" result="onGlass" />

        <feGaussianBlur in="warm" stdDeviation="22" result="warmBlur" />
        <feComposite in="warmBlur" in2="shape" operator="out" result="spillOutside" />
        <feComponentTransfer in="spillOutside" result="spill">
          <feFuncA type="linear" slope="0.28" />
        </feComponentTransfer>

        <feMerge>
          <feMergeNode in="spill" />
          <feMergeNode in="onGlass" />
        </feMerge>
      </filter>
    </defs>
  );
}

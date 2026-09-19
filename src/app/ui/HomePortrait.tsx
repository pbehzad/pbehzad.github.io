import Image from 'next/image';
import { PORTRAIT_SHAPE_MASK, PORTRAIT_SHAPE_PATH } from './portraitShape';

const PORTRAIT_SRC = '/ParhamBehzad-display.jpg';
const PORTRAIT_SOURCE_SIZE = 1800;
// The photo's film grain dominates file size: at 1440 px, quality 75 is
// about 250 kB of AVIF and quality 65 about 80 kB with the detail intact.
const PORTRAIT_QUALITY = 65;

// The photo is drawn at 140% of the frame width (see home.css), so these are
// 1.4 times the frame: 21rem on phones, about 53.5vw up to 48rem above that.
const PORTRAIT_SIZES = '(max-width: 40rem) 29.4rem, (max-width: 90rem) 75vw, 1080px';

type HomePortraitProps = {
  alt: string;
};

/**
 * The home signature: one portrait inside one organic glass form.
 *
 * Layers, back to front:
 * - the photo, cropped by the organic mask (the finished flat version);
 * - a static rim of light computed by an SVG filter from the outline itself;
 * - a hairline along the outline.
 *
 * Nothing moves or re-renders after first paint. If the light filter cannot
 * render, its layer is a 1% veil and the page looks the same, minus the rim.
 */
export function HomePortrait({ alt }: HomePortraitProps) {
  return (
    <div className="ui-home-portrait">
      <PortraitLightDefs />
      <div className="ui-home-portrait__photo" style={{ maskImage: PORTRAIT_SHAPE_MASK }}>
        <Image
          src={PORTRAIT_SRC}
          alt={alt}
          width={PORTRAIT_SOURCE_SIZE}
          height={PORTRAIT_SOURCE_SIZE}
          sizes={PORTRAIT_SIZES}
          quality={PORTRAIT_QUALITY}
          priority
        />
      </div>
      <svg
        className="ui-home-portrait__light"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d={PORTRAIT_SHAPE_PATH} />
      </svg>
      <svg
        className="ui-home-portrait__rim"
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path d={PORTRAIT_SHAPE_PATH} vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

/**
 * Static specular rim for the portrait form, the same technique as the menu
 * droplet: the outline's alpha, blurred, serves as a height map lit at a low
 * angle, so only the curved edge catches light. A cool key light comes from
 * the upper left and a faint warm light from the lower right, as in the
 * mockup. The light layer's fill is almost transparent, so its alpha is
 * amplified back to a solid shape first.
 */
function PortraitLightDefs() {
  return (
    <svg className="ui-visually-hidden" aria-hidden="true" focusable="false">
      <defs>
        <filter
          id="home-portrait-light"
          x="-5%"
          y="-5%"
          width="110%"
          height="110%"
          colorInterpolationFilters="sRGB"
        >
          <feComponentTransfer in="SourceAlpha" result="shape">
            <feFuncA type="linear" slope="100" />
          </feComponentTransfer>
          <feGaussianBlur in="shape" stdDeviation="9" result="height" />
          <feSpecularLighting
            in="height"
            surfaceScale="9"
            specularConstant="1.4"
            specularExponent="34"
            lightingColor="#ffffff"
            result="key"
          >
            <feDistantLight azimuth="225" elevation="28" />
          </feSpecularLighting>
          <feSpecularLighting
            in="height"
            surfaceScale="9"
            specularConstant="0.7"
            specularExponent="34"
            lightingColor="#f2c48c"
            result="warm"
          >
            <feDistantLight azimuth="45" elevation="28" />
          </feSpecularLighting>
          <feMerge result="lights">
            <feMergeNode in="key" />
            <feMergeNode in="warm" />
          </feMerge>
          {/* Softens 8-bit height-map quantization, which reads as grain. */}
          <feGaussianBlur in="lights" stdDeviation="0.8" result="smooth" />
          <feComposite in="smooth" in2="shape" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

import Image from 'next/image';
import { HomePortraitCrt } from './HomePortraitCrt';

const PORTRAIT_SRC = '/ParhamBehzad-display.jpg';
/** The source photo is square, and it is shown whole, uncropped. */
const PORTRAIT_SOURCE_SIZE = 1800;

// The photo's film grain dominates file size: at 1440 px, quality 75 is
// about 250 kB of AVIF and quality 65 about 80 kB with the detail intact.
const PORTRAIT_QUALITY = 65;
// The rendered width, --portrait-inline-size in home.css: the column less its
// gutters, up to 30rem, below 56rem; then 38vw up to 36rem. A 3x phone takes
// the 1080 px file.
const PORTRAIT_SIZES = '(max-width: 34rem) calc(100vw - 2.5rem), (max-width: 56rem) 30rem, (max-width: 94.7rem) 38vw, 36rem';

type HomePortraitProps = {
  alt: string;
};

/**
 * The home portrait: the photo as a picture on a CRT. The photo is the real
 * image (alt text, loading priority, the fallback); HomePortraitCrt draws
 * the tube over it once and hides it only when that has worked. It is the
 * largest image on the page, so it loads with priority.
 */
export function HomePortrait({ alt }: HomePortraitProps) {
  return (
    <div className="ui-home-portrait">
      <Image
        className="ui-home-portrait__photo"
        src={PORTRAIT_SRC}
        alt={alt}
        width={PORTRAIT_SOURCE_SIZE}
        height={PORTRAIT_SOURCE_SIZE}
        sizes={PORTRAIT_SIZES}
        quality={PORTRAIT_QUALITY}
        priority
      />
      <HomePortraitCrt />
    </div>
  );
}

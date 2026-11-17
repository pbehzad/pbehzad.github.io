import Image from 'next/image';
import { CrtCanvas } from './CrtCanvas';

type CrtPortraitProps = {
  src: string;
  alt: string;
  /** The source photo's pixel size; it is shown whole, at this proportion. */
  width: number;
  height: number;
  sizes: string;
  quality?: number;
  priority?: boolean;
  /** The tube's gain (CrtCanvas); lower for a pale, bright photo. */
  gain?: number;
  /** Sets the frame's width; the height follows the photo's proportion. */
  className: string;
};

/**
 * A portrait as a picture on a CRT (crt.css). The photo is the real image
 * (alt text, loading priority, the fallback); CrtCanvas draws the tube over
 * it once and hides it only when that has worked.
 */
export function CrtPortrait({ src, alt, width, height, sizes, quality, priority, gain, className }: CrtPortraitProps) {
  return (
    <div className={`ui-crt ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
      <Image
        className="ui-crt__photo"
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        quality={quality}
        priority={priority}
      />
      <CrtCanvas gain={gain} />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { PHOTO_BOX, VIEW_HEIGHT, VIEW_WIDTH } from './homePortraitGeometry';

/**
 * The refracting rim. It reuses the photo the browser already chose for the
 * flat layer (its currentSrc), so there is no second download, and draws it
 * once through the static `home-portrait-refract` filter and
 * `home-portrait-clip` outline defined in HomePortrait. Until then, or if the
 * filter cannot render, the flat photo shows through.
 */
export function HomePortraitRefraction() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    const photo = svgRef.current?.parentElement?.querySelector('img');
    if (!photo) return;
    const adopt = () => {
      if (photo.currentSrc) setHref(photo.currentSrc);
    };
    if (photo.complete) {
      adopt();
      return;
    }
    photo.addEventListener('load', adopt, { once: true });
    return () => photo.removeEventListener('load', adopt);
  }, []);

  return (
    <svg
      ref={svgRef}
      className="ui-home-portrait__glass"
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {href && (
        <g clipPath="url(#home-portrait-clip)">
          <image
            href={href}
            x={PHOTO_BOX.x}
            y={PHOTO_BOX.y}
            width={PHOTO_BOX.size}
            height={PHOTO_BOX.size}
            preserveAspectRatio="none"
            filter="url(#home-portrait-refract)"
          />
        </g>
      )}
    </svg>
  );
}

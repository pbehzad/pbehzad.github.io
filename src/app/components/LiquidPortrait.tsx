'use client';

import Image from 'next/image';

type LiquidPortraitProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  unoptimized?: boolean;
};

// The identity column owns one full-height liquid-glass pane. Keep the image
// itself neutral so it never creates a second, portrait-only lens.
export default function LiquidPortrait({
  src,
  alt,
  priority = false,
  sizes,
  unoptimized = false,
}: LiquidPortraitProps) {
  return (
    <div className="identity-portrait">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized={unoptimized}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/25" />
    </div>
  );
}

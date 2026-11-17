'use client';

import { useEffect, useRef } from 'react';
import { createCrtRenderer, type CrtRenderer } from './crtRenderer';

// Device pixels per CSS pixel, capped at 3 (current phones). The canvas is
// drawn once, so full density costs only memory, and anything less is
// upscaled, which blurs the phosphor grille.
const MAX_PIXEL_RATIO = 3;

/** The gain the tube was tuned at, on the home page's black-and-white photo. */
const DEFAULT_GAIN = 1.6;

type CrtCanvasProps = {
  /**
   * The tube's gain, its contrast knob. The default suits a photo of mostly
   * middle and dark tones; a pale, bright one needs less, or its highlights
   * burn out to white and its colours clip.
   */
  gain?: number;
};

/**
 * The CRT treatment over a portrait (CrtPortrait): a canvas the size of the
 * photo, drawn once the photo has loaded, and again only when the frame
 * resizes or the browser swaps in another size of the photo. Nothing
 * animates.
 *
 * The photo underneath stays the page's real image (its alt text, its
 * loading priority). It is hidden only once the canvas holds a frame, via
 * `data-crt` on the frame, so without JavaScript or WebGL, in forced
 * colours, or after a lost context, the plain photo shows.
 */
export function CrtCanvas({ gain = DEFAULT_GAIN }: CrtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = canvas?.parentElement;
    const photo = frame?.querySelector('img');
    if (!canvas || !frame || !photo) return;
    if (window.matchMedia('(forced-colors: active)').matches) return;

    let renderer: CrtRenderer | null = createCrtRenderer(canvas, gain);
    if (!renderer) return;

    const render = () => {
      if (!renderer || !photo.naturalWidth || !frame.clientWidth) return;
      renderer.draw(frame.clientWidth, frame.clientHeight, Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO));
      frame.dataset.crt = '';
    };

    const upload = () => {
      if (!renderer || !photo.naturalWidth) return;
      renderer.setImage(photo);
      render();
    };

    const onContextLost = (event: Event) => {
      event.preventDefault();
      renderer = null;
      delete frame.dataset.crt;
    };

    const onContextRestored = () => {
      renderer = createCrtRenderer(canvas, gain);
      upload();
    };

    if (photo.complete) upload();
    // Not once: a wider window makes the browser load a larger candidate.
    photo.addEventListener('load', upload);
    const observer = new ResizeObserver(render);
    observer.observe(frame);
    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    return () => {
      photo.removeEventListener('load', upload);
      observer.disconnect();
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      delete frame.dataset.crt;
      renderer?.dispose();
    };
  }, [gain]);

  return <canvas ref={canvasRef} className="ui-crt__canvas" aria-hidden="true" />;
}

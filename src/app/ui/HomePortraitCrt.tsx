'use client';

import { useEffect, useRef } from 'react';
import { createCrtRenderer, type CrtRenderer } from './crtRenderer';

// Device pixels per CSS pixel, capped at 3 (current phones). The canvas is
// drawn once, so full density costs only memory, and anything less is
// upscaled, which blurs the phosphor grille.
const MAX_PIXEL_RATIO = 3;

/**
 * The CRT treatment over the home portrait: a canvas the size of the photo,
 * drawn once the photo has loaded, and again only when the frame resizes or
 * the browser swaps in another size of the photo. Nothing animates.
 *
 * The photo underneath stays the page's real image (its alt text, its
 * loading priority). It is hidden only once the canvas holds a frame, via
 * `data-crt` on the frame, so without JavaScript or WebGL, in forced
 * colours, or after a lost context, the plain photo shows.
 */
export function HomePortraitCrt() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const frame = canvas?.parentElement;
    const photo = frame?.querySelector('img');
    if (!canvas || !frame || !photo) return;
    if (window.matchMedia('(forced-colors: active)').matches) return;

    let renderer: CrtRenderer | null = createCrtRenderer(canvas);
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
      renderer = createCrtRenderer(canvas);
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
  }, []);

  return <canvas ref={canvasRef} className="ui-home-portrait__crt" aria-hidden="true" />;
}

# Zaya viewer fork

This directory vendors [pbehzad/Zaya](https://github.com/pbehzad/Zaya), forked
from [ibra-kdbra/Zaya](https://github.com/ibra-kdbra/Zaya) at upstream commit
`8f8d89349a0bfad1ace515f48ed5be8668cfe376` (2026-04-04).
The upstream MIT license is preserved in `LICENSE`.

Local changes keep the PDF.js/DFlip rendering engine while adapting it for an
inline Next.js viewer:

- a restrained monochrome reader skin;
- the focused navigation, thumbnails, zoom, fullscreen, sharing, and download
  controls;
- removal of the runtime Tailwind compiler and external font dependency;
- local Toastify assets and cacheable script URLs;
- a service worker restricted to `/zaya/` so it cannot control the host site;
- subpath-safe module and asset URLs.

The host component is `src/app/components/PdfFlipViewer.tsx`.

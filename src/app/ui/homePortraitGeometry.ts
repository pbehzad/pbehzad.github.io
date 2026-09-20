/**
 * Fixed geometry for the home portrait, shared by the component and the
 * build-time asset generator so the photo crop, glass layer, displacement
 * map, and ASCII trace always line up.
 *
 * Units are the glass layer's view box: the frame is VIEW_WIDTH × VIEW_HEIGHT
 * and scales with the page, so SVG filter values stay fixed.
 */

export const VIEW_WIDTH = 1140;
export const VIEW_HEIGHT = 1000;

/** Source photo, square. */
export const PHOTO_SOURCE_SIZE = 1800;

/**
 * Head-and-shoulders crop: the photo drawn at 140% of the frame width.
 * Must match `.ui-home-portrait__photo img` in home.css.
 */
export const PHOTO_BOX = {
  x: -0.21 * VIEW_WIDTH,
  y: -0.154 * VIEW_HEIGHT,
  size: 1.4 * VIEW_WIDTH,
} as const;

/** Depth of the refracting rim, in view-box units. */
export const RIM_DEPTH = 78;

/**
 * The ASCII trace field, as fractions of the frame. It extends past the
 * form to the right and below, where the mockup shows it.
 */
export const TRACE_BOX = {
  left: -0.12,
  top: -0.06,
  width: 1.45,
} as const;
export const TRACE_COLUMNS = 226;
export const TRACE_ROWS = 70;
/** Line height relative to font size; the mono advance is 0.6em. */
export const TRACE_LINE_HEIGHT = 1.35;

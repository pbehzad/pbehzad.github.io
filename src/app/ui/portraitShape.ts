/**
 * The home portrait's organic outline, traced from the canonical home mockup.
 *
 * Points run clockwise from the top in a 0–1 box (x right, y down). They are
 * joined by a closed Catmull-Rom spline, so the outline stays smooth however
 * the box is sized. Coordinates stay inside the box so the rim is never cut
 * off at the edges.
 */
const OUTLINE: readonly (readonly [number, number])[] = [
  [0.485, 0.02],
  [0.72, 0.16],
  [0.97, 0.52],
  [0.875, 0.81],
  [0.59, 0.98],
  [0.32, 0.82],
  [0.075, 0.675],
  [0.02, 0.44],
  [0.12, 0.2],
];

function round(value: number) {
  return Number(value.toFixed(4));
}

function toClosedSplinePath(points: readonly (readonly [number, number])[]) {
  const count = points.length;
  let path = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (let i = 0; i < count; i++) {
    const [x0, y0] = points[(i - 1 + count) % count];
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % count];
    const [x3, y3] = points[(i + 2) % count];
    const c1 = [x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6];
    const c2 = [x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6];
    path += `C${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(x2)} ${round(y2)}`;
  }
  return `${path}Z`;
}

/** SVG path data in a `0 0 1 1` view box. */
export const PORTRAIT_SHAPE_PATH = toClosedSplinePath(OUTLINE);

/** The same outline as a stretchable CSS mask image. */
export const PORTRAIT_SHAPE_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" preserveAspectRatio="none"><path d="${PORTRAIT_SHAPE_PATH}"/></svg>`,
)}")`;

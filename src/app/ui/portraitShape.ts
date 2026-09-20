/**
 * The home portrait's organic outline, traced from the canonical home mockup.
 *
 * Points run clockwise from the top in a 0–1 box (x right, y down). They are
 * joined by a closed Catmull-Rom spline, so the outline stays smooth however
 * the box is sized. Coordinates stay inside the box so the rim is never cut
 * off at the edges.
 */
export const PORTRAIT_OUTLINE: readonly (readonly [number, number])[] = [
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

type Point = readonly [number, number];
type Segment = readonly [Point, Point, Point, Point];

/** Cubic Bézier segments equivalent to a closed Catmull-Rom spline. */
function toClosedSplineSegments(points: readonly Point[]): Segment[] {
  const count = points.length;
  return points.map((_, i) => {
    const [x0, y0] = points[(i - 1 + count) % count];
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % count];
    const [x3, y3] = points[(i + 2) % count];
    const c1: Point = [x1 + (x2 - x0) / 6, y1 + (y2 - y0) / 6];
    const c2: Point = [x2 - (x3 - x1) / 6, y2 - (y3 - y1) / 6];
    return [[x1, y1], c1, c2, [x2, y2]] as const;
  });
}

function toClosedSplinePath(points: readonly Point[]) {
  const segments = toClosedSplineSegments(points);
  let path = `M${round(points[0][0])} ${round(points[0][1])}`;
  for (const [, c1, c2, end] of segments) {
    path += `C${round(c1[0])} ${round(c1[1])} ${round(c2[0])} ${round(c2[1])} ${round(end[0])} ${round(end[1])}`;
  }
  return `${path}Z`;
}

/**
 * Samples the outline as a closed polygon in the 0–1 box, for build-time
 * tools that need the exact shape the mask draws.
 */
export function samplePortraitOutline(stepsPerSegment: number): Point[] {
  const samples: Point[] = [];
  for (const [p0, p1, p2, p3] of toClosedSplineSegments(PORTRAIT_OUTLINE)) {
    for (let step = 0; step < stepsPerSegment; step++) {
      const t = step / stepsPerSegment;
      const u = 1 - t;
      const a = u * u * u;
      const b = 3 * u * u * t;
      const c = 3 * u * t * t;
      const d = t * t * t;
      samples.push([
        a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0],
        a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1],
      ]);
    }
  }
  return samples;
}

/** SVG path data in a `0 0 1 1` view box. */
export const PORTRAIT_SHAPE_PATH = toClosedSplinePath(PORTRAIT_OUTLINE);

/** The same outline as a stretchable CSS mask image. */
export const PORTRAIT_SHAPE_MASK = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" preserveAspectRatio="none"><path d="${PORTRAIT_SHAPE_PATH}"/></svg>`,
)}")`;

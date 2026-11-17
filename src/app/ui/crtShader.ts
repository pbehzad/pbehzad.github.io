// A portrait as a picture on a cathode-ray tube (CrtPortrait). Drawn once
// into a canvas over the photo (crtRenderer.ts), and again only when its
// size changes; nothing here animates.
//
// What makes a CRT read as real, and where each lives below:
// - the glass bulges, so the picture's edges curve and its corners round;
// - the image is drawn as horizontal beams (scanlines) whose width grows
//   with brightness, so dark areas show the gaps and highlights fill them;
// - a phosphor aperture grille of red, green and blue stripes;
// - halation: bright areas glow into their surroundings;
// - imperfect convergence: red and blue land slightly beside green;
// - the tube darkens towards its edges, and the glass catches a reflection.
//
// Like a real set, the picture has a fixed number of scanlines whatever its
// size, so a phone shows the same picture as a desktop, only smaller. The
// phosphor grille is in CSS pixels, a fixed pitch on the glass. Both are
// computed at the canvas's own resolution, so they never beat against the
// photo's resampling.

export const crtVertexShader = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export const crtFragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;
uniform sampler2D uImage;
uniform vec2  uSize;        // the screen in CSS pixels
uniform float uPixelRatio;  // device pixels per CSS pixel
uniform float uGain;        // the tube's gain, its contrast knob (CrtCanvas)

// Geometry. Lower CURVE bulges more.
const vec2  CURVE = vec2(5.0, 4.4);
const float CORNER = 0.08;        // corner radius, in half-widths

// Beam, grille and tube.
const float LINES = 200.0;        // scanlines from top to bottom
const float TRIAD_PX = 3.0;       // CSS pixels per red-green-blue triad
const float MASK_DARK = 0.6;
const float MASK_LIGHT = 1.3;
const float CONVERGENCE_PX = 0.8; // red and blue offset from green
const float BLOOM = 0.32;
const vec3  PHOSPHOR_FLOOR = vec3(0.010, 0.013, 0.011);

vec3 toLinear(vec3 c) { return c * c * (c * 0.3 + 0.7); }  // close to sRGB, cheap
vec3 tex(vec2 uv) { return toLinear(texture2D(uImage, uv).rgb); }

// The beam spot is soft horizontally as well.
vec3 soft(vec2 uv) {
  vec2 px = vec2(1.0 / uSize.x, 0.0);
  return 0.25 * tex(uv - px) + 0.5 * tex(uv) + 0.25 * tex(uv + px);
}

// One scanline's colour at x, with red and blue slightly misconverged.
vec3 row(float x, float y) {
  float c = CONVERGENCE_PX / uSize.x;
  return vec3(soft(vec2(x + c, y)).r, soft(vec2(x, y)).g, soft(vec2(x - c, y)).b);
}

void main() {
  // Curved glass: screen coordinates bulge outwards towards the corners.
  vec2 c = vUv * 2.0 - 1.0;
  vec2 bend = abs(c.yx) / CURVE;
  vec2 cc = c + c * bend * bend;
  vec2 uv = cc * 0.5 + 0.5;

  // The tube's rounded edge, antialiased over about one device pixel.
  // Measured in half the shorter side, so a tall picture's corners stay
  // round; a square one is unchanged.
  vec2 span = uSize / min(uSize.x, uSize.y);
  vec2 q = abs(cc) * span - (span - CORNER);
  float edge = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - CORNER;
  float aa = 2.0 / (min(uSize.x, uSize.y) * uPixelRatio);
  float screen = 1.0 - smoothstep(-aa, aa, edge);
  if (screen <= 0.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Scanlines: each pixel sums the three nearest beams, each a gaussian
  // whose width grows with that beam's brightness.
  float lines = LINES;
  float y = uv.y * lines;
  float base = floor(y);
  vec3 col = vec3(0.0);
  for (int k = -1; k <= 1; k++) {
    float line = base + float(k);
    vec3 beam = row(uv.x, clamp((line + 0.5) / lines, 0.0, 1.0));
    float width = mix(0.24, 0.48, sqrt(dot(beam, vec3(0.2126, 0.7152, 0.0722))));
    float d = y - (line + 0.5);
    col += beam * exp(-0.5 * d * d / (width * width));
  }

  // Aperture grille, fixed to the glass in CSS pixels.
  float stripe = mod(floor(gl_FragCoord.x / (TRIAD_PX * uPixelRatio / 3.0)), 3.0);
  vec3 mask = vec3(MASK_DARK);
  if (stripe < 0.5) mask.r = MASK_LIGHT;
  else if (stripe < 1.5) mask.g = MASK_LIGHT;
  else mask.b = MASK_LIGHT;
  col *= mask;

  // Halation: a wide, highlight-weighted glow from two rings of samples.
  vec3 glow = vec3(0.0);
  vec2 aspect = vec2(1.0, uSize.x / uSize.y);
  for (int i = 0; i < 12; i++) {
    float a = float(i) * 0.5236;
    vec2 dir = vec2(cos(a), sin(a)) * aspect;
    glow += tex(uv + dir * 0.012) + tex(uv + dir * 0.03);
  }
  glow /= 24.0;
  col += glow * glow * BLOOM * 2.0;

  // The tube darkens towards its edges.
  float vignette = clamp(16.0 * uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y), 0.0, 1.0);
  col *= pow(vignette, 0.25);

  col = col * uGain + PHOSPHOR_FLOOR;

  // A soft reflection on the glass, upper left.
  vec2 r = (c - vec2(-0.5, 0.55)) * vec2(1.0, 1.7);
  col += vec3(smoothstep(0.85, 0.0, length(r)) * 0.035);

  col = sqrt(clamp(col, 0.0, 1.0));  // back towards sRGB
  gl_FragColor = vec4(col * screen, screen);
}
`;

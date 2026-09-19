import { ENV_SOURCE } from './metal.glsl';

// Pass 2 — the windows. Liquid glass panels refracting the metal realm.
//
// This is the earlier lens work applied to UI rather than to a column, and
// it composites in the shader for a reason CSS cannot match: a backdrop
// filter can only blur and displace the pixels already behind an element,
// whereas this has the rendered metal field as a texture it can resample at
// arbitrary offsets. That is what allows genuine per-channel dispersion and
// a refracted image that bends rather than smears.
//
// The panels are dielectric, not conductor: they keep a transmitted image
// and reflect white, where the metal behind them has no transmission at all
// and tints its reflection. Two different materials, one environment.

export const glassVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const glassFragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform sampler2D uScene;    // the metal realm
uniform vec2  uResolution;

uniform vec4  uPanels[7];    // xy = centre, zw = half-extent, in px
uniform float uPanelRadius[7];
uniform int   uPanelCount;

uniform float uBevel;        // width of the rolled edge, px
uniform float uThickness;    // how far the refracted ray travels
uniform float uDispersion;
uniform float uGlassRough;
uniform float uEdge;

${ENV_SOURCE}

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
}

// Distance to the nearest panel. Panels are kept as separate boxes rather
// than smooth-unioned: these are windows, and a window with a melted corner
// stops reading as a window.
float panels(vec2 px) {
  float d = 1e9;
  for (int i = 0; i < 7; i++) {
    if (i >= uPanelCount) break;
    vec4 r = uPanels[i];
    d = min(d, sdRoundBox(px - r.xy, r.zw, uPanelRadius[i]));
  }
  return d;
}

// Slab with a rolled edge: flat through the middle, falling away over uBevel
// pixels at the rim. Refraction follows the *gradient* of this height, so a
// flat centre keeps text legible and puts all the bending in the bevel —
// which is how thick glass actually behaves. An evenly domed panel reads as
// a cheap bulge and makes anything behind it unreadable.
float height(vec2 px) {
  float t = clamp(-panels(px) / max(uBevel, 0.001), 0.0, 1.0);
  return sqrt(1.0 - (1.0 - t) * (1.0 - t));
}

void main() {
  vec2 px = vUv * uResolution;
  px.y = uResolution.y - px.y;  // CSS origin is top-left

  vec3 base = texture2D(uScene, vUv).rgb;
  float d = panels(px);

  // Antialias the boundary over a pixel rather than discarding.
  float inside = smoothstep(1.0, -1.0, d);
  if (inside <= 0.001) {
    gl_FragColor = vec4(base, 1.0);
    return;
  }

  float e = 1.0;
  float hx = height(px + vec2(e, 0.0)) - height(px - vec2(e, 0.0));
  float hy = height(px + vec2(0.0, e)) - height(px - vec2(0.0, e));
  vec3 n = normalize(vec3(-hx, -hy, 2.0 / max(uThickness, 0.001)));

  vec3 viewDir = vec3(0.0, 0.0, -1.0);
  vec2 texel = 1.0 / uResolution;

  // Three refractions at slightly different indices — real dispersion, not
  // an RGB offset of one result. The channels separate where the surface
  // bends hardest and stay together where it is flat, which puts the fringe
  // on the rim the way real glass does instead of haloing the whole panel.
  vec3 rr = refract(viewDir, n, 1.0 / (1.5 - uDispersion * 0.012));
  vec3 rg = refract(viewDir, n, 1.0 / 1.5);
  vec3 rb = refract(viewDir, n, 1.0 / (1.5 + uDispersion * 0.012));

  vec2 offR = rr.xy * uThickness * texel;
  vec2 offG = rg.xy * uThickness * texel;
  vec2 offB = rb.xy * uThickness * texel;
  // Screen y is flipped relative to the panel space the normal was built in.
  offR.y = -offR.y; offG.y = -offG.y; offB.y = -offB.y;

  // Roughness as a few taps along the refracted ray: directional blur along
  // the ray looks like frosted thickness, where an isotropic blur just looks
  // out of focus.
  const int TAPS = 5;
  vec3 refracted = vec3(0.0);
  for (int i = 0; i < TAPS; i++) {
    float f = (float(i) / float(TAPS - 1) - 0.5) * uGlassRough;
    refracted.r += texture2D(uScene, vUv + offR * (1.0 + f)).r;
    refracted.g += texture2D(uScene, vUv + offG * (1.0 + f)).g;
    refracted.b += texture2D(uScene, vUv + offB * (1.0 + f)).b;
  }
  refracted /= float(TAPS);

  // Schlick with F0 = 0.04: a dielectric, so it reflects white and keeps its
  // transmitted image — the opposite of the conductor behind it.
  float cosT = clamp(dot(n, -viewDir), 0.0, 1.0);
  float fresnel = 0.04 + 0.96 * pow(1.0 - cosT, 5.0);

  // Tone-mapped on its own: the scene texture is already display-referred,
  // and running the mix through a second curve would crush the midtones of
  // everything seen through the glass.
  vec3 env = envSample(reflect(viewDir, n)) * uEnv;
  env = env / (env + 0.78);
  env = pow(env, vec3(0.86));

  vec3 col = mix(refracted * 1.06, env, fresnel);

  // Rim light driven by the actual gradient, so it stays correct wherever
  // the surface is steepest rather than at a hand-placed inset.
  float slope = length(vec2(hx, hy));
  col += vec3(0.9, 0.94, 1.0) * smoothstep(0.06, 0.45, slope) * uEdge;

  gl_FragColor = vec4(mix(base, col, inside), 1.0);
}
`;

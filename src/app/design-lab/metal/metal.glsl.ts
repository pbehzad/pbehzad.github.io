// Pass 1 — the realm. An infinite liquid-metal volume, rendered to a texture
// that the glass pass then refracts.
//
// The earlier version raymarched a cluster of metaballs floating in a
// background, which is a figure on a ground: the frame divides into "the
// thing" and "not the thing", and you look *at* it. No amount of shading
// makes that immersive, because the composition itself says you are outside.
//
// Here the metal is an infinite isosurface and the camera is inside it.
// Every ray terminates on metal, so there is no background left to be
// outside of — the frame fills edge to edge and the only spatial cue is
// depth. Travel is continuous and the field aperiodic, so there is no
// vantage point from which it resolves back into an object.

export const metalVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Shared with the glass pass so both reflect the same room. If the glass
// reflected a different environment from the metal it refracts, the panels
// would read as cut out from a different photograph.
export const ENV_SOURCE = /* glsl */ `
uniform float uEnv;
uniform float uLight;
uniform vec3  uTint;

// A studio, deliberately not the page colour. A mirror in a pale room still
// reflects dark corners; deriving the environment from the background leaves
// nothing dark to reflect and the metal reads as clay.
vec3 envSample(vec3 r) {
  vec3 d = normalize(r);
  float y = d.y * 0.5 + 0.5;
  vec3 sky = mix(vec3(0.03, 0.035, 0.05), vec3(0.62, 0.65, 0.73), smoothstep(0.0, 1.0, y));

  // Hard-edged bars. A soft gradient highlight reads as shading; an edge the
  // surface curvature can bend reads as a reflection.
  float key = smoothstep(0.88, 0.995, dot(d, normalize(vec3(-0.45, 0.85, 0.3))));
  sky += vec3(1.0, 0.98, 0.95) * key * (uLight > 0.5 ? 5.5 : 4.4);

  float fill = smoothstep(0.90, 1.0, dot(d, normalize(vec3(0.8, 0.15, 0.55))));
  sky += vec3(0.86, 0.92, 1.0) * fill * 3.0;

  float strip = smoothstep(0.965, 1.0, dot(d, normalize(vec3(0.15, 0.55, -0.85))));
  sky += vec3(1.0, 0.96, 0.88) * strip * 2.4;

  // Somewhere genuinely dark, or every angle washes out to one value.
  float shade = smoothstep(0.45, 1.0, dot(d, normalize(vec3(-0.25, -0.92, -0.2))));
  sky *= 1.0 - shade * 0.88;

  sky += vec3(0.55, 0.58, 0.66) * smoothstep(0.05, 0.0, abs(d.y)) * 1.2;
  return sky;
}
`;

export const metalFragmentShader = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform vec2  uResolution;
uniform float uTime;
uniform vec2  uPointer;

uniform float uScale;        // field frequency — size of the caverns
uniform float uThreshold;    // how much of space is solid
uniform float uFlow;
uniform float uRough;
uniform float uIridescence;
uniform float uFog;

${ENV_SOURCE}

// No sin(). The usual sin-based hash costs a transcendental per call, and
// noise3 calls this eight times, map() evaluates two noise fields, and the
// march evaluates map() ~78 times per pixel — around 2,500 sin() per pixel,
// which is what pinned this to 12fps on integrated graphics. This variant is
// a handful of multiplies and fracts for indistinguishable output.
float hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash31(i + vec3(0.0, 0.0, 0.0)), hash31(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z) * 2.0 - 1.0;
}

// Three octaves only. More would add crags, which is exactly what stops a
// surface reading as liquid — a fluid has no small features, because surface
// tension erases them. Blobism is a low-frequency condition.
float fbm3(vec3 p) {
  float a = 0.55, s = 0.0;
  for (int i = 0; i < 3; i++) { s += a * noise3(p); p *= 2.03; a *= 0.5; }
  return s;
}

float map(vec3 p) {
  vec3 q = p * uScale;
  q.z += uTime * 0.16;
  q.y += sin(uTime * 0.11) * 0.25;

  float d = fbm3(q) + uThreshold;

  // A second field beating against the first, so the caverns open and close
  // as you pass rather than merely sliding by. One noise octave, not another
  // fbm3: map() runs ~78 times per ray for the march, six more per normal
  // and four per AO tap, so a second three-octave field doubles the cost of
  // the whole frame to add a beat the eye reads as one wavelength anyway.
  d += noise3(q * 0.55 + vec3(11.3, 4.1, uTime * 0.07)) * uFlow * 0.55;

  // Always hold a cavity open around the viewer. Without it the origin sits
  // inside solid metal roughly half the time: the ray registers a hit on its
  // first step, the AO probes all land deeper inside the solid, occlusion
  // saturates, and the entire frame renders black. Being inside the volume
  // is the whole idea, but you have to be inside a *space* within it.
  d += smoothstep(2.6, 0.0, length(p)) * 0.9;

  // The pointer opens a further void ahead — the realm responds.
  d += smoothstep(2.1, 0.0, length(p - vec3(uPointer * 1.9, -2.2))) * 0.42;

  return d * 0.85 / uScale;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.0025, 0.0);
  return normalize(vec3(
    map(p + e.xyy) - map(p - e.xyy),
    map(p + e.yxy) - map(p - e.yxy),
    map(p + e.yyx) - map(p - e.yyx)
  ));
}

float ao(vec3 p, vec3 n) {
  float occ = 0.0, sca = 1.0;
  for (int i = 1; i <= 4; i++) {
    float h = 0.04 + 0.15 * float(i);
    occ += (h - map(p + n * h)) * sca;
    sca *= 0.68;
  }
  return clamp(1.0 - 1.25 * occ, 0.0, 1.0);
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= uResolution.x / uResolution.y;

  vec3 ro = vec3(0.0);
  vec3 rd = normalize(vec3(uv, -1.75));

  // Short fixed steps rather than sphere tracing: an isosurface of noise is
  // not a true distance bound, and full steps tunnel straight through the
  // thin walls between caverns.
  float t = 0.35;
  bool hit = false;
  for (int i = 0; i < 78; i++) {
    float d = map(ro + rd * t);
    if (d < 0.0025) { hit = true; break; }
    t += max(d * 0.62, 0.028);
    if (t > 9.0) break;
  }

  vec3 col;
  if (hit) {
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p);
    float occ = ao(p, n);

    // Conductor: no diffuse term anywhere. All of a metal's colour lives in
    // its Fresnel-weighted specular; a diffuse lobe is what turns CG metal
    // into grey plastic.
    vec3 refl = reflect(rd, n);
    vec3 blurred = normalize(mix(refl, n, uRough * 0.6));
    vec3 env = mix(envSample(refl), envSample(blurred), uRough) * uEnv;

    float cosT = clamp(dot(n, -rd), 0.0, 1.0);
    vec3 F = uTint + (1.0 - uTint) * pow(1.0 - cosT, 5.0);
    col = env * F * occ;

    // Thin-film heat tint at the rim, where an oxide layer actually shows.
    float rim = pow(1.0 - cosT, 3.0);
    vec3 iri = vec3(0.5 + 0.5 * sin(rim * 9.0),
                    0.5 + 0.5 * sin(rim * 9.0 + 2.1),
                    0.5 + 0.5 * sin(rim * 9.0 + 4.2));
    col = mix(col, col * iri * 1.6, uIridescence * rim);
  } else {
    // Rays that escape are looking down a long throat: read as depth, not as
    // a hole in the world.
    col = envSample(rd) * uEnv * uTint * 0.25;
  }

  // Depth haze, so the volume has extent. Without it every cavern wall sits
  // at the same apparent distance and the field flattens into a pattern.
  float fog = 1.0 - exp(-t * uFog);
  col = mix(col, vec3(0.05, 0.052, 0.062) * (uLight > 0.5 ? 3.2 : 1.0), fog);

  // Tone-mapped here, not in the glass pass: the render target is 8-bit, so
  // the specular bars would clip to flat white before the glass ever got to
  // refract them.
  col = col / (col + 0.78);
  col = pow(col, vec3(0.86));

  gl_FragColor = vec4(col, 1.0);
}
`;

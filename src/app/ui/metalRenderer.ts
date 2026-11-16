import { hexToRgb, METAL_FIELD, metalFragmentShader, type Shades } from './metalShader';

// Plain WebGL for the page background. The field is one full-screen
// fragment shader, so Three.js would add its whole runtime to every public
// page in exchange for compiling a program and drawing one triangle.

const VERTEX_SHADER = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const UNIFORMS = [
  'uResolution',
  'uTime',
  'uPointer',
  'uScale',
  'uThreshold',
  'uFlow',
  'uRough',
  'uIridescence',
  'uFog',
  'uEnv',
  'uCeil',
  'uFloor',
  'uHighlight',
  'uHorizon',
  'uMetal',
  'uHaze',
  'uGamma',
] as const;

type UniformName = (typeof UNIFORMS)[number];

export type MetalRenderer = {
  /** True when WebGL runs on the CPU, where animating the raymarch would pin it. */
  software: boolean;
  /** Pixel ratio is drawing-buffer pixels per CSS pixel; below 1 the browser upscales. */
  resize(cssWidth: number, cssHeight: number, pixelRatio: number): void;
  setShades(shades: Shades): void;
  draw(seconds: number, pointer: readonly [number, number]): void;
  dispose(): void;
};

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  if (process.env.NODE_ENV !== 'production') console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  return null;
}

/**
 * Returns null when WebGL or the shader is unavailable; the caller then
 * leaves the flat background in place.
 */
export function createMetalRenderer(canvas: HTMLCanvasElement): MetalRenderer | null {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'default',
  });
  if (!gl) return null;

  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, metalFragmentShader);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (process.env.NODE_ENV !== 'production') console.error(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);

  // One triangle that covers the viewport; cheaper than a two-triangle quad
  // because no fragment along the diagonal is shaded twice.
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const u = Object.fromEntries(UNIFORMS.map((name) => [name, gl.getUniformLocation(program, name)])) as Record<
    UniformName,
    WebGLUniformLocation | null
  >;

  // The field's shape never changes at runtime, so it is set once.
  gl.uniform1f(u.uScale, METAL_FIELD.scale);
  gl.uniform1f(u.uThreshold, METAL_FIELD.threshold);
  gl.uniform1f(u.uFlow, METAL_FIELD.flow);
  gl.uniform1f(u.uRough, METAL_FIELD.rough);
  gl.uniform1f(u.uIridescence, METAL_FIELD.iridescence);
  gl.uniform1f(u.uFog, METAL_FIELD.fog);
  gl.uniform1f(u.uEnv, METAL_FIELD.env);

  // SwiftShader, llvmpipe and Microsoft's Basic Render Driver: what browsers
  // fall back to with no usable GPU, or with hardware acceleration off. The
  // extension may be missing (some browsers withhold it); then assume a GPU.
  const info = gl.getExtension('WEBGL_debug_renderer_info');
  const rendererName = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
  const software = /swiftshader|llvmpipe|softpipe|software|basic render/i.test(rendererName);

  return {
    software,
    resize(cssWidth, cssHeight, pixelRatio) {
      canvas.width = Math.max(1, Math.round(cssWidth * pixelRatio));
      canvas.height = Math.max(1, Math.round(cssHeight * pixelRatio));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(u.uResolution, cssWidth, cssHeight);
    },
    setShades(shades) {
      gl.uniform3f(u.uCeil, ...hexToRgb(shades.ceiling));
      gl.uniform3f(u.uFloor, ...hexToRgb(shades.floor));
      gl.uniform3f(u.uMetal, ...hexToRgb(shades.metal));
      gl.uniform3f(u.uHaze, ...hexToRgb(shades.haze));
      gl.uniform1f(u.uHighlight, shades.highlight);
      gl.uniform1f(u.uHorizon, shades.horizon);
      gl.uniform1f(u.uGamma, shades.gamma);
    },
    draw(seconds, pointer) {
      gl.uniform1f(u.uTime, seconds);
      gl.uniform2f(u.uPointer, pointer[0], pointer[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    // Frees the GPU objects but deliberately keeps the context. A canvas
    // hands back the same context on its next getContext() call, and React's
    // development double-mount runs exactly that sequence: forcing a context
    // loss here would leave the remount with a dead one and no metal.
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    },
  };
}

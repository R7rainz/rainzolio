"use client";

import { useEffect, useRef } from "react";

const VERTEX = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += noise(p) * amplitude;
    p = p * 2.02 + 8.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  vec2 drift = vec2(time * 0.015, -time * 0.009) + (pointer - 0.5) * 0.08;
  vec2 p = uv * 1.45 + drift;
  float terrain = fbm(p * 1.25);
  float contour = abs(fract(terrain * 7.0 + time * 0.01) - 0.5);
  float lines = 1.0 - smoothstep(0.015, 0.035, contour);

  float nodes = 0.0;
  for (int i = 0; i < 7; i++) {
    float n = float(i);
    vec2 node = vec2(
      sin(n * 2.4 + time * 0.025),
      cos(n * 1.8 - time * 0.02)
    ) * vec2(0.76, 0.56);
    float distanceToNode = length(uv - node);
    nodes += 0.00035 / max(distanceToNode * distanceToNode, 0.001);
  }

  float vignette = 1.0 - smoothstep(0.35, 1.55, length(uv));
  vec3 dragonStone = vec3(0.56, 0.64, 0.61);
  vec3 dragonRed = vec3(0.77, 0.45, 0.42);
  vec3 colour = (dragonStone * lines * 0.08 + dragonRed * nodes * 0.035) * vignette;
  gl_FragColor = vec4(colour, (lines * 0.2 + nodes * 0.035) * vignette);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

export function BackgroundField() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const gl = element?.getContext("webgl", { alpha: true, antialias: false });
    if (!element || !gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;

    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const resolution = gl.getUniformLocation(program, "resolution");
    const pointer = gl.getUniformLocation(program, "pointer");
    const time = gl.getUniformLocation(program, "time");
    const cursor = { x: 0.5, y: 0.5 };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const draw = (now: number) => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.25);
      const width = Math.round(element.clientWidth * scale);
      const height = Math.round(element.clientHeight * scale);
      if (element.width !== width || element.height !== height) {
        element.width = width;
        element.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.uniform2f(resolution, width, height);
      gl.uniform2f(pointer, cursor.x, cursor.y);
      gl.uniform1f(time, now * 0.001);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduced) frame = requestAnimationFrame(draw);
    };

    const move = (event: PointerEvent) => {
      cursor.x = event.clientX / window.innerWidth;
      cursor.y = 1 - event.clientY / window.innerHeight;
    };

    window.addEventListener("pointermove", move, { passive: true });
    if (reduced) draw(0);
    else frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", move);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <div className="background-field pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <canvas ref={canvas} className="h-full w-full" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent_15%,var(--background)_78%)]" />
    </div>
  );
}

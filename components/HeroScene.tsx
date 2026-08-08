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

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  vec2 mouse = (pointer * 2.0 - 1.0) * vec2(resolution.x / resolution.y, 1.0);
  uv -= mouse * 0.045;

  vec3 ink = vec3(0.025, 0.032, 0.028);
  vec3 signal = vec3(0.48, 0.6, 1.0);
  float glow = 0.0;

  for (int i = 0; i < 8; i++) {
    float n = float(i);
    vec2 point = vec2(
      sin(n * 2.17 + time * (0.08 + n * 0.003)),
      cos(n * 1.73 - time * (0.07 + n * 0.004))
    ) * vec2(0.56, 0.7);
    point += vec2(sin(n * 4.1), cos(n * 3.7)) * 0.12;
    float distanceToNode = length(uv - point);
    glow += 0.0025 / max(distanceToNode * distanceToNode, 0.001);
  }

  vec2 gridUv = uv * 5.5;
  vec2 gridLine = abs(fract(gridUv) - 0.5);
  float grid = 1.0 - smoothstep(0.47, 0.5, max(gridLine.x, gridLine.y));
  float vignette = 1.0 - smoothstep(0.35, 1.45, length(uv));
  float scan = 0.5 + 0.5 * sin(uv.y * 9.0 - time * 0.35);

  vec3 colour = ink + signal * (glow * 0.075 + grid * 0.025 + scan * 0.012);
  colour *= 0.56 + vignette * 0.62;
  gl_FragColor = vec4(colour, 1.0);
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

export function HeroScene() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const element = canvas.current;
    const gl = element?.getContext("webgl", { alpha: false, antialias: false });
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
    let frame = 0;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const draw = (now: number) => {
      const scale = Math.min(window.devicePixelRatio || 1, 1.5);
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
      const box = element.getBoundingClientRect();
      cursor.x = (event.clientX - box.left) / box.width;
      cursor.y = 1 - (event.clientY - box.top) / box.height;
    };

    element.addEventListener("pointermove", move);
    if (reduced) draw(0);
    else frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", move);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <div className="scene-card relative min-h-[310px] overflow-hidden rounded-2xl border border-white/10 bg-[#09090c] shadow-[0_25px_70px_-40px_rgba(0,0,0,0.7)] sm:min-h-[360px]">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(4,6,5,0.82))]" />

      <div className="absolute inset-x-5 top-5 flex items-center justify-between font-mono text-[0.58rem] uppercase tracking-[0.16em] text-white/45 sm:inset-x-7 sm:top-7">
        <span>System topology</span>
        <span className="flex items-center gap-2">
          <span className="status-dot h-1.5 w-1.5 rounded-full bg-[#91a7ff]" /> live
        </span>
      </div>

      <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-md sm:inset-x-7 sm:bottom-7 sm:p-5">
        <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2 font-mono text-[0.58rem] sm:text-[0.64rem]">
          {[
            ["01", "API"],
            ["02", "QUEUE"],
            ["03", "WORKER"],
          ].map(([number, label], index) => (
            <div key={label} className="contents">
              <div className="rounded-xl border border-white/10 bg-white/[0.045] p-3 text-white/85">
                <span className="block text-white/30">{number}</span>
                <span className="mt-1.5 block">{label}</span>
              </div>
              {index < 2 && <span className="text-[#91a7ff]/60">→</span>}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 font-mono text-[0.56rem] text-white/35">
          <span>p95 · 42ms</span>
          <span>99.99% uptime</span>
          <span className="text-[#91a7ff]/75">healthy</span>
        </div>
      </div>
    </div>
  );
}

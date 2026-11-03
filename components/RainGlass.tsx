"use client";

import { useEffect, useRef } from "react";
import { THEME_EVENT } from "@/lib/useTheme";

/**
 * The landing section is a rainy window. Out of focus behind the glass, soft
 * lights drift (the accent blue and the warm wave colour). The pane is misted;
 * beads sit on it, slowly forming and evaporating, and a few drops run down
 * leaving clear trails. Each drop is a little lens: the world shows through
 * it sharp and flipped, with a highlight on top. The pointer wipes the glass.
 *
 * One fragment shader, no library. Colours come from theme tokens, re-read on
 * theme change. Renders only while on screen and the tab is visible; reduced
 * motion gets one still frame and no wiping. Without WebGL it stays empty and
 * the page's rain shows instead.
 */

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 res;      // CSS px
uniform float dpr;
uniform float t;
uniform vec2 mouse;    // CSS px, origin top-left
uniform vec3 base;
uniform vec3 colA;
uniform vec3 colB;
uniform float glow;    // how bright the lights are
uniform float mist;    // how fogged the pane is

float h21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// The world behind the glass: big soft lights, drifting.
vec3 scene(vec2 p) {
  vec3 c = base;
  for (int i = 0; i < 10; i++) {
    float f = float(i);
    vec2 o = vec2(h21(vec2(f, 1.)), h21(vec2(f, 2.)));
    vec2 q = res * (o + 0.05 * vec2(sin(t * 0.05 + f), cos(t * 0.04 + f * 1.7)));
    float r = mix(60., 170., h21(vec2(f, 3.)));
    vec3 tint = h21(vec2(f, 4.)) > 0.5 ? colA : colB;
    c = mix(c, tint, exp(-dot(p - q, p - q) / (r * r)) * glow);
  }
  return c;
}

// Beads resting on the pane: (lens offset, coverage).
vec3 beads(vec2 p, float cell, float seed) {
  vec2 id = floor(p / cell);
  vec2 g = fract(p / cell) - 0.5;
  float n = h21(id + seed);
  if (n < 0.4) return vec3(0.);
  vec2 c = (vec2(h21(id + seed + 1.3), h21(id + seed + 2.7)) - 0.5) * 0.55;
  float life = 0.5 + 0.5 * sin(t * 0.3 + n * 40.);
  float r = mix(0.1, 0.22, h21(id + seed + 4.1)) * smoothstep(0., 0.35, life);
  vec2 d = g - c;
  float m = smoothstep(r, r * 0.5, length(d));
  return vec3(d / max(r, 1e-3) * m, m);
}

// Drops running down: (lens offset, coverage, trail).
vec4 runs(vec2 p, float w) {
  float col = floor(p.x / w);
  float n = h21(vec2(col, 7.1));
  if (n < 0.55) return vec4(0.);
  float speed = mix(30., 90., h21(vec2(col, 1.9)));
  float span = res.y + 300.;
  float y = mod(t * speed + n * span * 9., span) - 150.;
  float x0 = (col + 0.5 + (h21(vec2(col, 3.3)) - 0.5) * 0.5) * w;
  float x = x0 + sin(y * 0.025 + n * 9.) * 5.;
  float r = mix(7., 12., h21(vec2(col, 5.7)));
  vec2 d = (p - vec2(x, y)) / r;
  d.y *= 0.82;
  float m = smoothstep(1., 0.55, length(d));
  float above = y - p.y;
  float xt = x0 + sin(p.y * 0.025 + n * 9.) * 5.;
  float trail = smoothstep(r * 0.55, r * 0.15, abs(p.x - xt)) * smoothstep(0., 14., above) * smoothstep(240., 40., above);
  return vec4(d * m, m, trail);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, res.y * dpr - gl_FragCoord.y) / dpr;
  float wipe = smoothstep(110., 50., length(p - mouse));
  vec3 b1 = beads(p, 22., 0.) * (1. - wipe);
  vec3 b2 = beads(p + 11., 46., 17.) * (1. - wipe);
  vec4 rn = runs(p, 64.);
  float drop = max(max(b1.z, b2.z), rn.z);
  vec2 lens = b1.xy * 22. + b2.xy * 36. + rn.xy * 54.;

  // Through a drop the world is sharp and flipped; elsewhere it's misted.
  vec3 c = scene(p - lens * 1.8);
  float clear = max(drop, max(rn.w * 0.85, wipe));
  c = mix(c, base, (1. - clear) * mist);

  // A highlight on top and a soft dark rim, so drops read on any background.
  vec3 nrm = normalize(vec3(b1.xy + b2.xy + rn.xy, 0.6));
  c += drop * pow(max(0., dot(nrm, normalize(vec3(-0.5, -0.7, 0.6)))), 14.) * 0.4;
  c -= drop * (1. - drop) * 0.1;
  gl_FragColor = vec4(c, 1.);
}`;

export function RainGlass() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const gl = canvas?.getContext("webgl", { antialias: false });
    if (!canvas || !gl) return;

    const shader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(prog, name);
    const uni = {
      res: u("res"), dpr: u("dpr"), t: u("t"), mouse: u("mouse"),
      base: u("base"), a: u("colA"), b: u("colB"), glow: u("glow"), mist: u("mist"),
    };

    const rgb = (token: string) => {
      canvas.style.color = `var(${token})`;
      const [r, g, b] = (getComputedStyle(canvas).color.match(/[\d.]+/g) ?? ["0", "0", "0"]).map(Number);
      return [r / 255, g / 255, b / 255] as const;
    };
    const readColors = () => {
      const base = rgb("--background");
      const dark = base[0] * 0.3 + base[1] * 0.59 + base[2] * 0.11 < 0.5;
      gl.uniform3f(uni.base, ...base);
      gl.uniform3f(uni.a, ...rgb("--wave-a"));
      gl.uniform3f(uni.b, ...rgb("--wave-b"));
      gl.uniform1f(uni.glow, dark ? 0.55 : 0.42);
      gl.uniform1f(uni.mist, dark ? 0.5 : 0.62);
    };

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mouse = [-1e4, -1e4];
    let visible = false;
    let raf = 0;
    const start = performance.now();

    const draw = () => {
      // shortcut: time wraps hourly, so the drops jump once an hour; fine for a hero.
      gl.uniform1f(uni.t, reduced ? 30 : ((performance.now() - start) / 1000) % 3600);
      gl.uniform2f(uni.mouse, mouse[0], mouse[1]);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (reduced) draw();
      else if (visible && !document.hidden) loop();
    };

    const resize = () => {
      // Capped below 2x: the pane is mostly soft, and this is a full-screen shader.
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uni.res, canvas.clientWidth, canvas.clientHeight);
      gl.uniform1f(uni.dpr, dpr);
      draw();
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse = [e.clientX - r.left, e.clientY - r.top];
    };
    const onLeave = () => (mouse = [-1e4, -1e4]);
    const onTheme = () => {
      readColors();
      draw();
    };

    readColors();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    io.observe(canvas);
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", onTheme);
    window.addEventListener(THEME_EVENT, onTheme);
    document.addEventListener("visibilitychange", run);
    if (!reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      scheme.removeEventListener("change", onTheme);
      window.removeEventListener(THEME_EVENT, onTheme);
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none block h-full w-full" />;
}

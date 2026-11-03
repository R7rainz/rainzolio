"use client";

import { useEffect, useRef } from "react";
import { THEME_EVENT } from "@/lib/useTheme";

/**
 * The landing: rain on a pane of glass the colour of the page. Each droplet is
 * shaded as a small lens: dim on top and bright underneath (a lens flips the
 * light), a refracting rim, a crisp highlight, and a soft shadow on the glass
 * behind it. The light drifts slowly on its own, so highlights shift without
 * any pointer input; beads form and evaporate; a few drops run down.
 *
 * One fragment shader, no library. The glass is the --background token, so it
 * matches the page in both themes (re-read on theme change). Renders only
 * while on screen and the tab is visible; reduced motion gets one still frame.
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
uniform vec3 bg;       // the page background
uniform float dark;    // 0 light theme, 1 dark theme

float h21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Composite one droplet of radius r (px) centred at c onto col.
void drop(vec2 p, vec2 c, float r, vec3 L, inout vec3 col) {
  // Contact shadow on the glass, cast away from the light.
  vec2 so = -L.xy * r * 0.35 + vec2(0., r * 0.15);
  float sh = 1. - smoothstep(0.6, 1.15, length(p - c - so) / (r * 1.08));
  col = mix(col, bg * mix(0.86, 0.35, dark), sh * 0.55);

  vec2 d = (p - c) / r;
  float l = length(d);
  if (l >= 1.) return;
  vec3 n = normalize(vec3(d, sqrt(1. - l * l)));
  vec3 body = mix(bg * mix(0.9, 0.55, dark), bg + mix(0.04, 0.07, dark), smoothstep(-0.7, 0.9, d.y));
  body = mix(body, mix(bg * 0.78, bg + 0.08, dark), smoothstep(0.72, 1., l));
  body += pow(max(dot(n, normalize(L + vec3(0., 0., 1.))), 0.), 70.) * mix(0.9, 0.8, dark);
  col = mix(col, body, smoothstep(1., 0.9, l));
}

// Beads stuck to the pane, one per grid cell at most.
void beads(vec2 p, float cell, float seed, float rmin, float rmax, vec3 L, inout vec3 col) {
  vec2 id = floor(p / cell);
  float n = h21(id + seed);
  if (n < 0.45) return;
  vec2 c = (id + 0.5 + (vec2(h21(id + seed + 1.3), h21(id + seed + 2.7)) - 0.5) * 0.4) * cell;
  float life = 0.5 + 0.5 * sin(t * 0.12 + n * 40.);
  float r = mix(rmin, rmax, h21(id + seed + 4.1)) * smoothstep(0., 0.3, life);
  if (r > 0.5) drop(p, c, r, L, col);
}

// A few drops running slowly down the pane.
void runs(vec2 p, float w, vec3 L, inout vec3 col) {
  float k = floor(p.x / w);
  float n = h21(vec2(k, 7.1));
  if (n < 0.75) return;
  float span = res.y + 300.;
  float y = mod(t * mix(18., 45., h21(vec2(k, 1.9))) + n * span * 9., span) - 150.;
  float x = (k + 0.5 + (h21(vec2(k, 3.3)) - 0.5) * 0.4) * w + sin(y * 0.02 + n * 9.) * 4.;
  drop(p, vec2(x, y), mix(7., 11., h21(vec2(k, 5.7))), L, col);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, res.y * dpr - gl_FragCoord.y) / dpr;
  // The light wanders slowly around the upper left.
  float a = t * 0.12;
  vec3 L = normalize(vec3(-0.45 + 0.25 * sin(a), -0.75 + 0.15 * cos(a * 0.7), 0.7));
  vec3 col = bg;
  beads(p, 26., 0., 1.5, 5., L, col);
  beads(p + 13., 64., 17., 5., 13., L, col);
  runs(p, 96., L, col);
  gl_FragColor = vec4(col, 1.);
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
    const uni = { res: u("res"), dpr: u("dpr"), t: u("t"), bg: u("bg"), dark: u("dark") };

    // The glass is the page: read --background as the browser computes it.
    const readColors = () => {
      canvas.style.color = "var(--background)";
      const [r, g, b] = (getComputedStyle(canvas).color.match(/[\d.]+/g) ?? ["0", "0", "0"]).map((v) => Number(v) / 255);
      gl.uniform3f(uni.bg, r, g, b);
      gl.uniform1f(uni.dark, r * 0.3 + g * 0.59 + b * 0.11 < 0.5 ? 1 : 0);
    };

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let visible = false;
    let raf = 0;
    const start = performance.now();

    const draw = () => {
      // shortcut: time wraps hourly, so the beads jump once an hour; fine for a hero.
      gl.uniform1f(uni.t, reduced ? 30 : ((performance.now() - start) / 1000) % 3600);
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
      // Capped below 2x: a full-screen shader, and the beads are soft-edged anyway.
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uni.res, canvas.clientWidth, canvas.clientHeight);
      gl.uniform1f(uni.dpr, dpr);
      draw();
    };
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

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      scheme.removeEventListener("change", onTheme);
      window.removeEventListener(THEME_EVENT, onTheme);
      document.removeEventListener("visibilitychange", run);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="block h-full w-full" />;
}

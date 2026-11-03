"use client";

import { useEffect, useRef } from "react";
import { THEME_EVENT } from "@/lib/useTheme";

/**
 * The landing: rain running down a pane of glass the colour of the page
 * (black in the dark theme). Drops are teardrops, round below and drawn out
 * above, shaded as small lenses: a darker refracting rim, a brighter underside,
 * a crisp highlight and a faint shadow on the glass. They run stop-and-go and
 * leave a broken line of tiny beads that stay put and shrink as they dry.
 *
 * One fragment shader, no library, no pointer input. The glass is the
 * --background token (re-read on theme change). Renders only while on screen
 * and the tab is visible; reduced motion gets one still frame.
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

// Composite one droplet. d is the pixel's offset from its centre in radii
// (already shaped), r its radius in px.
void shade(vec2 d, float r, inout vec3 col) {
  float l = length(d);
  float sh = 1. - smoothstep(0.7, 1.3, length(d - vec2(0.12, 0.25)));
  col = mix(col, bg * mix(0.9, 0.45, dark), sh * 0.45);
  if (l >= 1.) return;
  vec3 n = normalize(vec3(d, sqrt(1. - l * l)));
  // A lens flips the light: dim on top, bright underneath, darker at the rim.
  vec3 body = mix(bg * mix(0.86, 0.5, dark), bg + mix(0.05, 0.08, dark), smoothstep(-0.8, 0.9, d.y));
  body = mix(body, mix(bg * 0.72, bg + 0.15, dark), smoothstep(0.7, 1., l));
  body += pow(max(dot(n, normalize(vec3(-0.35, -0.6, 0.72))), 0.), 60.) * mix(0.95, 0.85, dark);
  col = mix(col, body, clamp((1. - l) * r, 0., 1.));
}

// One drop per column at most, running down and leaving beads behind.
void runs(vec2 p, float w, inout vec3 col) {
  float k = floor(p.x / w);
  float n = h21(vec2(k, 7.1));
  if (n < 0.5) return;
  float speed = mix(35., 80., h21(vec2(k, 1.9)));
  float span = res.y + 400.;
  // Stop-and-go: speed swings between about half and one and a half.
  float y = mod(speed * (t + 0.6 * sin(t * 0.9 + n * 6.)) + n * span * 9., span) - 200.;
  float x0 = (k + 0.5 + (h21(vec2(k, 3.3)) - 0.5) * 0.4) * w;
  float x = x0 + sin(y * 0.03 + n * 9.) * 3.;
  float r = mix(5.5, 9.5, h21(vec2(k, 5.7)));

  // The beads it left: fixed on the glass, shrinking as it moves on.
  float seg = floor(p.y / 11.);
  float by = (seg + 0.5) * 11.;
  float age = (y - by) / 240.;
  float hb = h21(vec2(k * 3.1, seg));
  if (age > 0.05 && age < 1. && hb > 0.4) {
    float br = mix(0.9, 2.3, h21(vec2(seg, k))) * (1. - age);
    vec2 bc = vec2(x0 + sin(by * 0.03 + n * 9.) * 3. + (hb - 0.7) * 3., by);
    if (br > 0.4) shade((p - bc) / br, br, col);
  }

  // The drop: round below, drawn out and narrower above.
  vec2 d = (p - vec2(x, y)) / r;
  if (d.y < 0.) d = vec2(d.x / (1. - 0.3 * min(-d.y, 1.)), d.y * 0.62);
  shade(d, r, col);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, res.y * dpr - gl_FragCoord.y) / dpr;
  vec3 col = bg;
  runs(p, 52., col);
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
      // shortcut: time wraps hourly, so the drops jump once an hour; fine for a hero.
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
      // Capped below 2x: a full-screen shader, and the drops are soft-edged anyway.
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

"use client";

import { useEffect, useRef } from "react";

/**
 * The landing: black glass with rain on it. Almost everything is pure black;
 * only the droplets show, as faint bodies with a small white highlight and a
 * hint of rim. The light comes from the pointer, so droplets near it glint
 * brighter as it moves; with no pointer it sits up and to the left. Beads
 * slowly form and evaporate, and a few drops run down the pane.
 *
 * One fragment shader, no library, the same in both themes. Renders only while
 * on screen and the tab is visible; reduced motion gets one still frame.
 * Without WebGL the pane is plain black.
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
uniform vec2 mouse;    // CSS px, origin top-left; far away when absent

float h21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

// Beads stuck to the pane: (outward normal, coverage).
vec3 beads(vec2 p, float cell, float seed) {
  vec2 id = floor(p / cell);
  vec2 g = fract(p / cell) - 0.5;
  float n = h21(id + seed);
  if (n < 0.45) return vec3(0.);
  vec2 c = (vec2(h21(id + seed + 1.3), h21(id + seed + 2.7)) - 0.5) * 0.55;
  float life = 0.5 + 0.5 * sin(t * 0.25 + n * 40.);
  float r = mix(0.08, 0.2, h21(id + seed + 4.1)) * smoothstep(0., 0.35, life);
  vec2 d = g - c;
  float m = smoothstep(r, r * 0.6, length(d));
  return vec3(d / max(r, 1e-3) * m, m);
}

// A few drops running down: (outward normal, coverage).
vec3 runs(vec2 p, float w) {
  float col = floor(p.x / w);
  float n = h21(vec2(col, 7.1));
  if (n < 0.72) return vec3(0.);
  float speed = mix(25., 70., h21(vec2(col, 1.9)));
  float span = res.y + 300.;
  float y = mod(t * speed + n * span * 9., span) - 150.;
  float x = (col + 0.5 + (h21(vec2(col, 3.3)) - 0.5) * 0.5) * w + sin(y * 0.025 + n * 9.) * 4.;
  float r = mix(6., 10., h21(vec2(col, 5.7)));
  vec2 d = (p - vec2(x, y)) / r;
  d.y *= 0.82;
  float m = smoothstep(1., 0.6, length(d));
  return vec3(d * m, m);
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, res.y * dpr - gl_FragCoord.y) / dpr;
  vec3 b1 = beads(p, 24., 0.);
  vec3 b2 = beads(p + 11., 54., 17.);
  vec3 rn = runs(p, 80.);
  float drop = max(max(b1.z, b2.z), rn.z);
  vec3 nrm = normalize(vec3(b1.xy + b2.xy + rn.xy, 0.6));

  bool lit = mouse.x > -1e3;
  vec2 lamp = lit ? mouse : vec2(res.x * 0.2, -res.y * 0.4);
  vec3 toLight = normalize(vec3(lamp - p, 240.));
  float near = lit ? exp(-dot(p - mouse, p - mouse) / 70000.) : 0.;

  float spec = pow(max(0., dot(nrm, toLight)), 22.);
  float rim = drop * (1. - drop) * 4.;
  vec3 c = vec3(drop * 0.022);                 // the bead itself, barely there
  c += drop * spec * (0.3 + 0.7 * near);       // the glint
  c += rim * 0.035 * (0.5 + near);             // a hint of edge
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
    const uni = { res: u("res"), dpr: u("dpr"), t: u("t"), mouse: u("mouse") };

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let mouse = [-1e4, -1e4];
    let visible = false;
    let raf = 0;
    const start = performance.now();

    const draw = () => {
      // shortcut: time wraps hourly, so the beads jump once an hour; fine for a hero.
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
      // Capped below 2x: a full-screen shader, and the beads are small anyway.
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

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      run();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", run);
    if (!reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", run);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="block h-full w-full" />;
}

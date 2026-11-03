"use client";

import { useEffect, useRef } from "react";
import { THEME_EVENT } from "@/lib/useTheme";

/**
 * rainz: the page background is light rain. Thin streaks fall at a slight wind
 * angle, a few tinted with the accent; some land in tiny ripples. The pointer
 * is an umbrella: drops stop at an invisible canopy above it and splash off
 * the edge.
 *
 * Plain 2D canvas, fixed behind everything (cards sit on top and stay dry).
 * Colours come from theme tokens and are re-read on theme change. Pauses with
 * the tab; reduced motion gets one still frame.
 */

type Drop = { x: number; y: number; len: number; v: number; a: number; end: number; blue: boolean };
type Ripple = { x: number; y: number; t: number };
type Spark = { x: number; y: number; vx: number; vy: number; t: number };

const WIND = 0.12; // sideways drift per pixel of fall
const CANOPY = 54; // umbrella radius around the pointer, px
const RIPPLE = 0.6; // seconds
const SPARK = 0.4;

export function Rain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let drops: Drop[] = [];
    const ripples: Ripple[] = [];
    const sparks: Spark[] = [];
    let grey = "0,0,0";
    let blue = "0,0,0";
    let mouse = { x: -1e4, y: -1e4 };
    let raf = 0;
    let last = 0;

    const spawn = (y = -Math.random() * h): Drop => ({
      x: Math.random() * (w + 120) - 120,
      y,
      len: 10 + Math.random() * 18,
      v: 520 + Math.random() * 520,
      a: 0.1 + Math.random() * 0.22,
      end: h * (0.5 + Math.random() * 0.6),
      blue: Math.random() < 0.2,
    });

    // Resolve a token to "r,g,b" by letting the browser compute it.
    const rgb = (token: string) => {
      canvas.style.color = `var(${token})`;
      return (getComputedStyle(canvas).color.match(/[\d.]+/g) ?? ["0", "0", "0"]).slice(0, 3).join(",");
    };
    const readColors = () => {
      grey = rgb("--foreground-subtle");
      blue = rgb("--accent");
    };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = innerWidth;
      h = innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(260, Math.round((w * h) / 7000));
      drops = Array.from({ length: count }, () => spawn(Math.random() * h));
    };

    const step = (dt: number) => {
      for (const d of drops) {
        d.y += d.v * dt;
        d.x += d.v * dt * WIND;

        // Under the umbrella: stop at the canopy and splash outward.
        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        if (dy < 0 && dx * dx + dy * dy < CANOPY * CANOPY) {
          const side = dx < 0 ? -1 : 1;
          for (let i = 0; i < 2; i++) {
            sparks.push({ x: d.x, y: d.y, vx: side * (40 + Math.random() * 70), vy: -(50 + Math.random() * 90), t: 0 });
          }
          Object.assign(d, spawn(-d.len));
          continue;
        }

        if (d.y > d.end) {
          if (d.end < h) ripples.push({ x: d.x, y: d.end, t: 0 });
          Object.assign(d, spawn(-d.len));
        }
      }
      for (const r of ripples) r.t += dt;
      for (const s of sparks) {
        s.t += dt;
        s.vy += 600 * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
      }
      while (ripples.length && ripples[0].t > RIPPLE) ripples.shift();
      while (sparks.length && sparks[0].t > SPARK) sparks.shift();
    };

    const paint = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineWidth = 1;
      for (const d of drops) {
        ctx.strokeStyle = `rgba(${d.blue ? blue : grey},${d.a})`;
        ctx.beginPath();
        ctx.moveTo(d.x - d.len * WIND, d.y - d.len);
        ctx.lineTo(d.x, d.y);
        ctx.stroke();
      }
      for (const r of ripples) {
        const k = r.t / RIPPLE;
        ctx.strokeStyle = `rgba(${grey},${(1 - k) * 0.28})`;
        ctx.beginPath();
        ctx.ellipse(r.x, r.y, 2 + k * 14, (2 + k * 14) * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.fillStyle = `rgba(${blue},0.45)`;
      for (const s of sparks) {
        ctx.globalAlpha = 1 - s.t / SPARK;
        ctx.fillRect(s.x, s.y, 1.4, 1.4);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      step(Math.min(0.05, (now - last) / 1000));
      last = now;
      paint();
      raf = requestAnimationFrame(loop);
    };
    const run = () => {
      cancelAnimationFrame(raf);
      if (reduced || document.hidden) return paint();
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const onResize = () => {
      resize();
      paint();
    };
    const onMove = (e: PointerEvent) => (mouse = { x: e.clientX, y: e.clientY });
    const onLeave = () => (mouse = { x: -1e4, y: -1e4 });
    const onTheme = () => {
      readColors();
      paint();
    };

    readColors();
    resize();
    run();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", run);
    const scheme = matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", onTheme);
    window.addEventListener(THEME_EVENT, onTheme);
    if (!reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", run);
      scheme.removeEventListener("change", onTheme);
      window.removeEventListener(THEME_EVENT, onTheme);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}

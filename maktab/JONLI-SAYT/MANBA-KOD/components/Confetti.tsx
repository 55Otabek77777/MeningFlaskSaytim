"use client";

import { useEffect, useRef } from "react";

/**
 * Self-contained canvas confetti — no external library (CSP-safe). When
 * `active` turns true it fires a celebratory burst from the lower centre and
 * then rains brand-coloured confetti from the top for `durationMs`, easing off
 * as it ends. Fills its positioned parent (absolute inset-0) and is purely
 * decorative (pointer-events none). Honours prefers-reduced-motion.
 */

const COLORS = ["#d4af37", "#f5c451", "#3b5bdb", "#6082f0", "#ef4444", "#ffffff"];
const GRAVITY = 0.12;
const DRAG = 0.0025;
const MAX = 220;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  size: number;
  color: string;
  circle: boolean;
  life: number;
}

export default function Confetti({
  active,
  durationMs = 9000,
}: {
  active: boolean;
  durationMs?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    const parent = canvas.parentElement;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = parent?.getBoundingClientRect();
      w = rect?.width ?? window.innerWidth;
      h = rect?.height ?? 400;
      if (canvas === null) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    // Vary randomness by index (Date.now()/Math.random allowed in the browser).
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = () => COLORS[Math.floor(Math.random() * COLORS.length)];

    function spawnRain(count: number) {
      for (let i = 0; i < count && particles.length < MAX; i += 1) {
        particles.push({
          x: rand(0, w),
          y: rand(-40, -8),
          vx: rand(-0.6, 0.6),
          vy: rand(1.4, 3.6),
          rot: rand(0, Math.PI * 2),
          vr: rand(-0.2, 0.2),
          size: rand(5, 11),
          color: pick(),
          circle: Math.random() < 0.28,
          life: 1,
        });
      }
    }

    function burst() {
      const cx = w / 2;
      const cy = h * 0.72;
      const n = Math.min(120, MAX);
      for (let i = 0; i < n; i += 1) {
        const angle = rand(-Math.PI * 0.85, -Math.PI * 0.15);
        const speed = rand(6, 15);
        particles.push({
          x: cx + rand(-40, 40),
          y: cy,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          rot: rand(0, Math.PI * 2),
          vr: rand(-0.35, 0.35),
          size: rand(6, 12),
          color: pick(),
          circle: Math.random() < 0.28,
          life: 1,
        });
      }
    }

    const start = performance.now();
    let raf = 0;

    burst();

    function frame(now: number) {
      const elapsed = now - start;
      const spawning = elapsed < durationMs;
      if (ctx === null) return;
      ctx.clearRect(0, 0, w, h);

      // Rain intake tapers off over the final second.
      if (spawning) {
        const fade = elapsed > durationMs - 1200 ? Math.max(0, (durationMs - elapsed) / 1200) : 1;
        if (Math.random() < 0.9) spawnRain(Math.round(rand(2, 5) * fade));
      }

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.vy += GRAVITY;
        p.vx *= 1 - DRAG;
        p.vy *= 1 - DRAG;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (!spawning) p.life -= 0.006;

        if (p.y > h + 30 || p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.circle) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
        }
        ctx.restore();
      }

      if (spawning || particles.length > 0) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, w, h);
      }
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [active, durationMs]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none z-20 h-full w-full"
      // Inline position so nothing can knock the canvas back into flow (which
      // would inflate the banner with an empty gap above the content).
      style={{ position: "absolute", inset: 0 }}
    />
  );
}

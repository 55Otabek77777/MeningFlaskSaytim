"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

/**
 * Analog clock styled for the dark achievements panel — a bright WHITE dial
 * that lifts off the navy background via a soft blue glow halo, with dark-navy
 * numerals/hands, an orange second hand, the school logo at the top and
 * "MIRZO ULUG'BEK / xususiy maktabi" where the date used to be.
 * Purely visual — the certificate rotation is driven separately by
 * useSecondTick so both stay aligned to real time.
 *
 * Rendered on a fixed 350px coordinate system and scaled by `sizePx/350`,
 * so it stays crisp at any size (desktop corner / mobile).
 */
export default function AchievementsClock({ sizePx = 210 }: { sizePx?: number }) {
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);
  // Second-hand angle base: captured at first tick so the running angle stays
  // small (≈ +6°/s, < 1e6 for ~46h) — safely under the browser's CSS numeric
  // rounding, so every per-second step is a distinct, exact +6°. It only ever
  // increases, so the snap always animates forward (no 59→0 backward whip).
  const secBase = useRef<{ sec: number; angle: number } | null>(null);
  const secPrimed = useRef(false);

  const tick = useCallback(() => {
    const ms = Date.now();
    const totalSec = Math.floor(ms / 1000);
    const d = new Date(ms);
    const h = d.getHours() % 12;
    const m = d.getMinutes();
    const s = d.getSeconds();

    if (hourRef.current) {
      hourRef.current.style.transform = `rotate(${h * 30 + (m / 60) * 30}deg)`;
    }
    if (minuteRef.current) {
      minuteRef.current.style.transform = `rotate(${m * 6 + (s / 60) * 6}deg)`;
    }
    const el = secondRef.current;
    if (el) {
      if (secBase.current === null) {
        secBase.current = { sec: totalSec, angle: s * 6 };
      }
      const base = secBase.current;
      const angle = base.angle + (totalSec - base.sec) * 6;
      if (!secPrimed.current) {
        // First placement must NOT animate — otherwise the hand spins from 0°
        // to the initial angle. Disable the transition, commit, then hand the
        // transition back to the .ach-second-hand class for real ticks.
        el.style.transition = "none";
        el.style.transform = `rotate(${angle}deg)`;
        void el.offsetWidth; // force reflow so the jump isn't animated
        el.style.transition = "";
        secPrimed.current = true;
      } else {
        el.style.transform = `rotate(${angle}deg)`;
      }
    }
  }, []);

  // Update the hands only when the whole second changes (same boundary that
  // advances the certificates), so the second hand steps discretely instead of
  // sweeping — and stays perfectly in rhythm with the coverflow.
  useEffect(() => {
    let raf = 0;
    let last = -1;
    const loop = () => {
      const sec = Math.floor(Date.now() / 1000);
      if (sec !== last) {
        last = sec;
        tick();
      }
      raf = requestAnimationFrame(loop);
    };
    tick();
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [tick]);

  const marks = [];
  for (let i = 0; i < 60; i += 1) {
    if (i % 5 === 0) {
      const idx = i / 5;
      const angle = (i * 6 * Math.PI) / 180;
      const r = 145;
      // Round in JS math so the server and client emit byte-identical style
      // strings (raw Math.sin/cos floats serialize at different precision and
      // trip React hydration).
      const left = Math.round((175 + Math.sin(angle) * r - 15) * 1000) / 1000;
      const top = Math.round((175 - Math.cos(angle) * r - 10) * 1000) / 1000;
      marks.push(
        <div
          key={`n${i}`}
          className="pointer-events-none absolute h-[20px] w-[30px] select-none text-center font-bold leading-[20px] text-[#1e2d5a]"
          style={{ left: `${left}px`, top: `${top}px`, fontSize: "17px", zIndex: 15 }}
        >
          {idx === 0 ? "12" : idx.toString()}
        </div>
      );
    } else {
      marks.push(
        <div
          key={`m${i}`}
          className="absolute left-[175px] top-[10px] h-[10px] w-[1px]"
          style={{
            backgroundColor: "rgba(30,45,90,0.32)",
            transformOrigin: "center 165px",
            transform: `rotate(${i * 6}deg)`,
          }}
        />
      );
    }
  }

  return (
    <div
      className="relative"
      style={{ width: sizePx, height: sizePx }}
      aria-hidden="true"
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width: 350, height: 350, transform: `scale(${sizePx / 350})` }}
      >
        {/* Soft glow halo so the white dial clearly lifts off the navy panel */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 452,
            height: 452,
            background:
              "radial-gradient(circle, rgba(190,210,255,0.60) 0%, rgba(120,150,245,0.28) 40%, rgba(90,120,240,0) 70%)",
            filter: "blur(10px)",
          }}
        />
        <div
          className="relative h-[350px] w-[350px] overflow-hidden rounded-full"
          style={{
            background:
              "radial-gradient(125% 120% at 50% 16%, #ffffff 0%, #f4f7fd 52%, #e6ecf8 100%)",
            boxShadow:
              "0 26px 55px rgba(8,16,44,0.55), inset 0 3px 8px rgba(255,255,255,0.95), inset 0 -14px 30px rgba(31,48,95,0.14)",
          }}
        >
          {/* Bezel: crisp white inner edge + brand-blue ring + gold hairline */}
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.9), inset 0 0 0 5px rgba(59,91,219,0.22)" }}
          />
          <div
            className="pointer-events-none absolute inset-[8px] rounded-full"
            style={{ boxShadow: "inset 0 0 0 1px rgba(212,175,55,0.35)" }}
          />

          <div className="absolute left-0 top-0 h-full w-full">{marks}</div>

          {/* School logo (replaces the sample yellow logo) */}
          <div className="absolute left-1/2 top-[78px] z-10 -translate-x-1/2">
            <Image
              src="/logo.png"
              alt=""
              width={50}
              height={50}
              className="drop-shadow-[0_1px_3px_rgba(30,45,90,0.28)]"
            />
          </div>

          {/* Hour hand */}
          <div
            ref={hourRef}
            className="absolute bottom-[175px] left-[175px] z-20 ml-[-3px] h-[70px] w-[6px] rounded-[3px] will-change-transform"
            style={{ transformOrigin: "center bottom", backgroundColor: "#1c2c58", boxShadow: "0 1px 4px rgba(20,35,80,0.35)" }}
          />
          {/* Minute hand */}
          <div
            ref={minuteRef}
            className="absolute bottom-[175px] left-[175px] z-20 ml-[-2px] h-[100px] w-[4px] rounded-[2px] will-change-transform"
            style={{ transformOrigin: "center bottom", backgroundColor: "#1c2c58", boxShadow: "0 1px 4px rgba(20,35,80,0.35)" }}
          />
          {/* Second hand */}
          <div
            ref={secondRef}
            className="ach-second-hand absolute left-[174px] top-[55px] z-20 h-[120px] w-[2px] will-change-transform"
            style={{ transformOrigin: "1px 120px" }}
          >
            <div className="absolute bottom-0 left-0 h-[120px] w-[2px] shadow-[0_0_6px_rgba(255,107,0,0.6)]" style={{ backgroundColor: "rgba(255,107,0,1)" }} />
            <div className="absolute -bottom-[14px] left-[-2px] h-[14px] w-[6px] rounded-b-[4px]" style={{ backgroundColor: "rgba(255,107,0,1)" }} />
          </div>

          {/* Centre cap */}
          <div
            className="pointer-events-none absolute left-[161px] top-[161px] z-20 h-[28px] w-[28px] rounded-full"
            style={{ backgroundColor: "#1c2c58", boxShadow: "0 0 0 3px rgba(255,255,255,0.95), 0 2px 6px rgba(10,20,50,0.35)" }}
          />

          {/* Brand text (replaces date / timezone) */}
          <div className="pointer-events-none absolute bottom-[112px] left-1/2 z-10 -translate-x-1/2 select-none text-center">
            <div className="text-[17px] font-extrabold uppercase tracking-wide text-[#2445c4]">
              Mirzo Ulug’bek
            </div>
            <div className="mt-0.5 text-[12px] font-semibold text-slate-500">
              xususiy maktabi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

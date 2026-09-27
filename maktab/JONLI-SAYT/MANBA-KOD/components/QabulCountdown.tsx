"use client";

import { Bebas_Neue } from "next/font/google";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import Confetti from "@/components/Confetti";
import { COUNTDOWN_FROM } from "@/lib/qabul";
import { CONTACTS } from "@/lib/site";

// Short admission link (redirects to this site) shown once the countdown ends.
const MUROJAAT_URL = "https://mirzolink.com";

// Tall display numerals for the countdown (Midnight design).
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400" });

const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const SHIFT_MS = 350;

const UNITS = [
  { unit: "Day", label: "Kun" },
  { unit: "Hour", label: "Soat" },
  { unit: "Minute", label: "Daqiqa" },
  { unit: "Second", label: "Soniya" },
] as const;

type Unit = (typeof UNITS)[number]["unit"];

function unitValue(distance: number, unit: Unit): number {
  if (distance <= 0) {
    return 0;
  }
  switch (unit) {
    case "Day":
      return Math.floor(distance / DAY);
    case "Hour":
      return Math.floor((distance % DAY) / HOUR);
    case "Minute":
      return Math.floor((distance % HOUR) / MINUTE);
    case "Second":
      return Math.floor((distance % MINUTE) / SECOND);
  }
}

/**
 * ShiftingCountdown timer: on change the digit slides up-and-out, swaps,
 * then slides in from below (CSS keyframes cd-out/cd-in, 0.35s each).
 */
function useTimer(unit: Unit) {
  const timeRef = useRef<number | null>(null);
  const swapTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [time, setTime] = useState(0);
  const [phase, setPhase] = useState<"idle" | "out" | "in">("idle");

  useEffect(() => {
    function handleCountdown() {
      const distance = +new Date(COUNTDOWN_FROM) - +new Date();
      const newTime = unitValue(distance, unit);
      if (newTime === timeRef.current) {
        return;
      }
      if (timeRef.current === null) {
        timeRef.current = newTime;
        setTime(newTime);
        return;
      }
      timeRef.current = newTime;
      setPhase("out");
      if (swapTimeout.current !== null) {
        clearTimeout(swapTimeout.current);
      }
      swapTimeout.current = setTimeout(() => {
        setTime(newTime);
        setPhase("in");
      }, SHIFT_MS);
    }
    handleCountdown();
    const intervalId = setInterval(handleCountdown, 1000);
    return () => {
      clearInterval(intervalId);
      if (swapTimeout.current !== null) {
        clearTimeout(swapTimeout.current);
      }
    };
  }, [unit]);

  return { time, phase };
}

function CountdownItem({ unit, label }: { unit: Unit; label: string }) {
  const { time, phase } = useTimer(unit);
  const display = unit === "Day" ? String(time) : String(time).padStart(2, "0");
  const anim = phase === "out" ? "cd-out" : phase === "in" ? "cd-in" : "";

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="relative overflow-hidden text-center">
        <span
          className={`${bebasNeue.className} block text-6xl leading-none tracking-wide text-white md:text-[7rem] ${anim}`}
        >
          {display}
        </span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50 md:text-xs">
        {label}
      </span>
    </div>
  );
}

export default function QabulCountdown() {
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    // ?qabul=preview lets staff (and us) preview the celebration before the
    // real date without touching the countdown target.
    const preview =
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("qabul") === "preview";
    function check() {
      setFinished(preview || +new Date(COUNTDOWN_FROM) - +new Date() <= 0);
    }
    check();
    const intervalId = setInterval(check, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <section className="bg-mist py-12 transition-colors md:py-16 dark:bg-[#0e1730]">
      <div className="mx-auto max-w-5xl px-4">
        {/* Midnight admission banner — deep navy-black blend, red accents. */}
        <div
          className={`cd-midnight relative overflow-hidden rounded-3xl px-4 py-10 text-center text-white shadow-2xl md:px-12 md:py-14${
            finished
              ? " flex min-h-[460px] flex-col items-center justify-center md:min-h-[540px]"
              : ""
          }`}
        >
          <Confetti active={finished} />
          <p className="relative z-10 text-sm font-bold uppercase tracking-[0.2em] text-red-400">
            2026–2027 o’quv yili
          </p>

          {finished ? (
            <>
              <h2 className="relative z-10 mt-2 text-4xl font-extrabold text-white md:text-6xl">
                Qabul boshlandi! 🎉
              </h2>
              <p className="relative z-10 mx-auto mt-4 max-w-xl text-base text-white/75 md:text-lg">
                2026–2027 o’quv yili qabuli ochiq. Joylar soni cheklangan —
                hoziroq qabul uchun murojaat qiling.
              </p>

              {/* Prominent admission bar → short link (mirzolink.com). */}
              <a
                href={MUROJAAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-shimmer cta-gradient relative z-10 mx-auto mt-9 flex w-full max-w-2xl items-center justify-center gap-3 rounded-2xl px-8 py-5 text-lg font-extrabold text-white shadow-xl shadow-red-900/30 transition-transform hover:scale-[1.02] md:text-2xl"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 10 12 5 2 10l10 5 10-5Z" />
                  <path d="M6 12v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5" />
                  <path d="M22 10v6" />
                </svg>
                Qabul uchun murojaat qiling
              </a>
              <p className="relative z-10 mt-3 text-sm font-semibold tracking-wide text-white/50">
                mirzolink.com
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight text-white md:text-5xl">
                Qabul boshlanishiga qoldi
              </h2>

              <div className="mx-auto mt-10 flex max-w-3xl items-start justify-center gap-3 md:gap-6">
                {UNITS.map((u, i) => (
                  <div key={u.unit} className="flex items-start gap-3 md:gap-6">
                    {i > 0 ? (
                      <span
                        className={`${bebasNeue.className} mt-1 text-5xl leading-none text-red-500/70 md:text-8xl`}
                      >
                        :
                      </span>
                    ) : null}
                    <CountdownItem unit={u.unit} label={u.label} />
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
                {["📅 1-avgust", "🕖 soat 07:00", "🎓 8–11-sinflar"].map(
                  (chip) => (
                    <span
                      key={chip}
                      className="rounded-full border border-white/12 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur-sm"
                    >
                      {chip}
                    </span>
                  )
                )}
                <span className="cd-hover rounded-full border border-white/12 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-white/85 backdrop-blur-sm transition-colors hover:border-red-400/50 hover:text-red-200">
                  🎯 <span className="cd-hover-base">Birinchi</span>
                  <span className="cd-hover-alt">Birinchilardan</span> bo’lib
                  joy band qiling
                </span>
              </div>
            </>
          )}

          {!finished ? (
            <div className="relative z-10 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/qabul"
                className="btn-shimmer cta-gradient inline-block w-full rounded-2xl px-9 py-4 text-lg font-bold text-white shadow-xl shadow-red-900/30 transition-transform hover:scale-[1.04] sm:w-auto"
              >
                Hoziroq ariza qoldiring
              </Link>
              <a
                href={CONTACTS.phones[0].href}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white/25 px-8 py-[14px] text-base font-bold text-white transition-colors hover:border-white/60 hover:bg-white/10 sm:w-auto"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.96.35 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.45c.9.35 1.84.6 2.8.7A2 2 0 0 1 22 16.9z" />
                </svg>
                {CONTACTS.phones[0].label}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

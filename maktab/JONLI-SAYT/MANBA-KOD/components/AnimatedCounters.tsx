"use client";

import { useEffect, useRef, useState } from "react";

export interface CounterStat {
  /** Numeric string for count-up, or "" when a text `display` is used. */
  value: string;
  /** Non-numeric big text (e.g. student count is never a number). */
  display?: string;
  label: string;
  icon?: string;
}

const ICON_PATHS: Record<string, React.ReactNode> = {
  award: (
    <>
      <circle cx="12" cy="9" r="6" />
      <path d="M8.5 14.5L7 22l5-3 5 3-1.5-7.5" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9M16.5 3.1a4 4 0 0 1 0 7.8" />
    </>
  ),
  scroll: (
    <>
      <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  briefcase: (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2M2 13h20" />
    </>
  ),
  camera: (
    <>
      <path d="M2 8l14-4 1.5 5.5L4 13.5z" />
      <path d="M9 12.5V17a2 2 0 0 0 2 2h2M17.5 9.5L20 9l1 4-2.5.5" />
      <circle cx="9" cy="9.5" r="1.2" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
};

/** Parses "27" -> 27, "1560" -> 1560; returns null for non-numeric. */
function numericPart(value: string): number | null {
  const match = value.match(/^\d+/);
  if (match === null) {
    return null;
  }
  return Number.parseInt(match[0], 10);
}

function CounterValue({ value, started }: { value: string; started: boolean }) {
  const target = numericPart(value);
  const suffix = target === null ? "" : value.slice(String(target).length);
  const [display, setDisplay] = useState(target === null ? value : "0");

  useEffect(() => {
    if (!started || target === null) {
      return;
    }
    const durationMs = 1400;
    let raf = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(String(Math.round(eased * target)));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target]);

  return (
    <>
      {display}
      {suffix}
    </>
  );
}

/**
 * Stats grid with count-up animation and PRO card styling: accent top
 * border, gradient number, icon, hover lift. Counting starts when the
 * section scrolls into view (IntersectionObserver + rAF, no libs).
 */
export default function AnimatedCounters({ stats }: { stats: CounterStat[] }) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (node === null) {
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setStarted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setStarted(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 pb-14 pt-9 sm:grid-cols-3"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="shadow-card rounded-2xl border-t-4 border-accent bg-white p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          {stat.icon !== undefined && ICON_PATHS[stat.icon] !== undefined ? (
            <span className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {ICON_PATHS[stat.icon]}
              </svg>
            </span>
          ) : null}
          <div
            className={`bg-gradient-to-b from-brand to-brand-dark bg-clip-text font-extrabold text-transparent ${
              stat.value.length > 0 ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {stat.value.length > 0 ? (
              <CounterValue value={stat.value} started={started} />
            ) : (
              (stat.display ?? "")
            )}
          </div>
          <div className="mt-2 text-sm leading-snug text-muted">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}

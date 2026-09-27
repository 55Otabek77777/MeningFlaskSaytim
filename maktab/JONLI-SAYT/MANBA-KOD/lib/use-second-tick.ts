"use client";

import { useEffect, useRef } from "react";

/**
 * Calls `cb` once every `everyN` whole seconds, aligned to the epoch clock
 * (driven by requestAnimationFrame, so it stays in step with the visible
 * clock's second hand). The initial boundary is skipped so nothing advances
 * the instant it mounts. Independent of any visible clock, so the certificate
 * rotation ticks even where the clock is hidden (mobile).
 *
 * everyN = 3 → one certificate every 3 seconds (enough time to read the name
 * and grade) while the clock itself keeps ticking every second.
 */
export function useSecondTick(cb: () => void, everyN = 1): void {
  const cbRef = useRef(cb);
  cbRef.current = cb;

  useEffect(() => {
    let raf = 0;
    let lastBucket = -1;
    const loop = () => {
      const bucket = Math.floor(Date.now() / 1000 / everyN);
      if (bucket !== lastBucket) {
        if (lastBucket !== -1) cbRef.current();
        lastBucket = bucket;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [everyN]);
}

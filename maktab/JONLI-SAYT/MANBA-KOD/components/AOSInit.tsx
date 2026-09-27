"use client";

import AOS from "aos";
import "aos/dist/aos.css";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Initialises AOS once and refreshes it on route changes. */
export default function AOSInit() {
  const pathname = usePathname();

  useEffect(() => {
    // Defer AOS init to idle time so it doesn't add to hydration TBT.
    const start = () => AOS.init({ once: true, duration: 700, offset: 80 });
    const ric = (
      window as typeof window & {
        requestIdleCallback?: (cb: () => void) => number;
      }
    ).requestIdleCallback;
    if (typeof ric === "function") {
      ric(start);
    } else {
      const id = setTimeout(start, 200);
      return () => clearTimeout(id);
    }
  }, []);

  useEffect(() => {
    AOS.refreshHard();
  }, [pathname]);

  return null;
}

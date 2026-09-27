"use client";

import { useEffect, useState } from "react";

/**
 * Footer visit counter. Increments the site-wide total once per browser
 * session (sessionStorage guard), otherwise just reads it, and shows the
 * formatted number next to the copyright line. Renders nothing until the
 * total is known, so there is no hydration mismatch and no "0" flash.
 */
export default function VisitorCounter() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const counted = sessionStorage.getItem("mu_visit_counted") === "1";
    fetch("/api/visit", { method: counted ? "GET" : "POST" })
      .then((r) => r.json())
      .then((d: { total?: number }) => {
        if (cancelled || typeof d.total !== "number" || d.total <= 0) return;
        setTotal(d.total);
        if (!counted) sessionStorage.setItem("mu_visit_counted", "1");
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  if (total === null) return null;

  return (
    <span className="inline-flex items-center gap-1.5 text-white/60">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      <span className="font-semibold text-white/80 tabular-nums">
        {total.toLocaleString("uz-UZ")}
      </span>
      marta tashrif buyurilgan
    </span>
  );
}

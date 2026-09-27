"use client";

import Link from "next/link";

import { CONTACTS } from "@/lib/site";

/**
 * Conversion bar pinned to the bottom of the viewport on mobile only:
 * [Qo’ng’iroq] + [Hujjat topshirish]. Hidden from md upward.
 */
export default function MobileStickyBar() {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-px border-t border-mist bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      role="navigation"
      aria-label="Tezkor amallar"
    >
      <a
        href={CONTACTS.phones[0].href}
        onClick={() => {
          fetch("/api/track-call", { method: "POST" }).catch(() => undefined);
        }}
        className="flex items-center justify-center gap-2 bg-white py-3.5 text-sm font-bold text-brand"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c1 .3 2 .5 3 .6a2 2 0 0 1 1.6 2z" />
        </svg>
        Qo’ng’iroq
      </a>
      <Link
        href="/qabul"
        className="flex items-center justify-center bg-accent py-3.5 text-sm font-bold text-white"
      >
        Hujjat topshirish
      </Link>
    </div>
  );
}

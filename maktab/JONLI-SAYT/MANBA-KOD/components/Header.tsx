"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import ThemeToggle from "@/components/ThemeToggle";
import { SITE_SHORT_NAME } from "@/lib/site";
import { YONALISHLAR } from "@/lib/yonalishlar";

const NAV_ITEMS = [
  { href: "/", label: "Bosh sahifa" },
  { href: "/maktab-haqida", label: "Maktab haqida" },
  { href: "/yonalishlar", label: "Yo’nalishlar", dropdown: true },
  { href: "/qabul", label: "Qabul" },
  { href: "/yutuqlar", label: "Yutuqlar" },
  { href: "/yangiliklar", label: "Yangiliklar" },
  { href: "/faq", label: "FAQ" },
  { href: "/aloqa", label: "Aloqa" },
] as const;

export default function Header() {
  const [open, setOpen] = useState(false);
  const [mobileDirsOpen, setMobileDirsOpen] = useState(false);
  const [desktopDirsOpen, setDesktopDirsOpen] = useState(false);
  const pathname = usePathname();

  // The Telegram mini-app (/bot-admin) is a standalone screen — no site nav.
  if (pathname?.startsWith("/bot-admin")) {
    return null;
  }

  function isActive(href: string): boolean {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  }

  function closeAll() {
    setOpen(false);
    setMobileDirsOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-mist bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5" onClick={closeAll}>
          <Image
            src="/logo.png"
            alt={`${SITE_SHORT_NAME} logotipi`}
            width={40}
            height={40}
            priority
          />
          <span className="text-sm font-bold leading-tight text-brand">
            MIRZO ULUG’BEK
            <span className="block text-[11px] font-medium text-ink/70">
              xususiy maktabi
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-0.5 lg:flex"
          aria-label="Asosiy menyu"
        >
          {NAV_ITEMS.map((item) =>
            "dropdown" in item && item.dropdown ? (
              <div
                key={item.href}
                className="group relative"
                onMouseEnter={() => setDesktopDirsOpen(true)}
                onMouseLeave={() => setDesktopDirsOpen(false)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDesktopDirsOpen(false);
                  }
                }}
              >
                <button
                  type="button"
                  className={`flex items-center gap-1 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                    isActive("/yonalishlar")
                      ? "bg-brand-soft text-brand"
                      : "text-ink/80 hover:bg-mist hover:text-ink"
                  }`}
                  aria-haspopup="true"
                  aria-expanded={desktopDirsOpen}
                  onFocus={() => setDesktopDirsOpen(true)}
                >
                  {item.label}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="w-60 rounded-2xl border border-mist bg-white p-2 shadow-lg">
                    {YONALISHLAR.map((y) => (
                      <Link
                        key={y.slug}
                        href={`/yonalishlar/${y.slug}`}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/85 hover:bg-brand-soft hover:text-brand"
                      >
                        {y.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-brand-soft text-brand"
                    : "text-ink/80 hover:bg-mist hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
          <Link
            href="/qabul"
            className="btn-beam ml-2 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          >
            Hujjat topshirish
          </Link>
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-ink lg:hidden"
          aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
        </div>
      </div>

      {open ? (
        <nav
          className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-mist bg-white px-4 pb-6 pt-2 lg:hidden"
          aria-label="Mobil menyu"
        >
          {NAV_ITEMS.map((item) =>
            "dropdown" in item && item.dropdown ? (
              <div key={item.href}>
                <button
                  type="button"
                  onClick={() => setMobileDirsOpen((v) => !v)}
                  aria-expanded={mobileDirsOpen}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium text-ink/80 hover:bg-mist"
                >
                  {item.label}
                  <svg
                    className={`transition-transform ${mobileDirsOpen ? "rotate-180" : ""}`}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {mobileDirsOpen ? (
                  <div className="ml-3 border-l-2 border-brand-soft pl-2">
                    {YONALISHLAR.map((y) => (
                      <Link
                        key={y.slug}
                        href={`/yonalishlar/${y.slug}`}
                        onClick={closeAll}
                        className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink/75 hover:bg-brand-soft hover:text-brand"
                      >
                        {y.title}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeAll}
                className={`block rounded-lg px-3 py-3 text-base font-medium ${
                  isActive(item.href)
                    ? "bg-brand-soft text-brand"
                    : "text-ink/80 hover:bg-mist"
                }`}
              >
                {item.label}
              </Link>
            )
          )}
          <Link
            href="/qabul"
            onClick={closeAll}
            className="mt-2 block rounded-lg bg-accent px-4 py-3 text-center text-base font-semibold text-white"
          >
            Hujjat topshirish
          </Link>
        </nav>
      ) : null}
    </header>
  );
}

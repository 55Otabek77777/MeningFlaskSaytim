import Image from "next/image";
import Link from "next/link";

import VisitorCounter from "@/components/VisitorCounter";
import { CONTACTS, experienceYears, SITE_NAME, WORK_HOURS } from "@/lib/site";

const QUICK_LINKS = [
  { href: "/maktab-haqida", label: "Maktab haqida" },
  { href: "/tarix", label: "Tarix" },
  { href: "/qabul", label: "Qabul" },
  { href: "/yutuqlar", label: "Yutuqlar" },
  { href: "/yangiliklar", label: "Yangiliklar" },
  { href: "/faq", label: "FAQ" },
  { href: "/aloqa", label: "Aloqa" },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-mist bg-[#0f172a] text-white dark:bg-[#080e1a]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        {/* 1 — About */}
        <div>
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Maktab logotipi"
              width={44}
              height={44}
              className="rounded-md bg-white p-0.5"
            />
            <span className="text-sm font-bold leading-tight">
              MIRZO ULUG’BEK
              <span className="block text-xs font-medium text-white/60">
                xususiy maktabi
              </span>
            </span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Uchko’prik tumanida sifatli ta’lim — tajribali jamoa va bitta
            maqsad: farzandingizning kelajagi.
          </p>
        </div>

        {/* 2 — Quick links */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
            Tezkor havolalar
          </h3>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {QUICK_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-white/80 hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="mt-5 space-y-1.5 border-t border-white/10 pt-4 text-sm">
            {WORK_HOURS.map((row) => (
              <li key={row.days} className="flex justify-between gap-2">
                <span className="text-white/60">{row.days}</span>
                <span className="text-white/90">{row.hours}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3 — Contact + social */}
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-white/50">
            Aloqa
          </h3>
          <ul className="mt-3 space-y-2 text-sm">
            {CONTACTS.phones.map((phone) => (
              <li key={phone.href}>
                <a href={phone.href} className="text-white/80 hover:text-white">
                  {phone.label}
                </a>
              </li>
            ))}
            <li className="text-white/70">{CONTACTS.address}</li>
          </ul>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={CONTACTS.telegram.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Telegram kanalimiz"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-accent hover:text-white"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M21.9 4.4L2.9 11.7c-1 .4-1 1.8.1 2.1l4.6 1.4 1.8 5.6c.3 1 1.6 1.2 2.2.4l2.6-3.1 4.8 3.5c.8.6 2 .2 2.2-.8l3-14.6c.2-1.1-.8-2-1.9-1.6z" />
              </svg>
            </a>
            <a
              href={CONTACTS.instagram.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram sahifamiz"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-accent hover:text-white"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href={CONTACTS.youtube.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube kanalimiz"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-accent hover:text-white"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.6 3.6 12 3.6 12 3.6s-4.6 0-7.8.3c-.4.1-1.4.1-2.3 1-.7.7-.9 2.3-.9 2.3S.8 9.1.8 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.3 7.6.3s4.6 0 7.8-.3c.4-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8zM9.9 15.1V8.4l6.2 3.4-6.2 3.3z" />
              </svg>
            </a>
            <a
              href={CONTACTS.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Xaritada manzilimiz"
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/80 transition-colors hover:bg-accent hover:text-white"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </a>
          </div>
          <a
            href="https://t.me/mirzorasmiybot?start=web"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white"
          >
            🤖 Rasmiy bot (AI yordamchi) →
          </a>
          <a
            href="https://mirzolink.com"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-semibold text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            Barcha havolalar bir sahifada →
          </a>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
        <p className="font-semibold text-white/80">
          {experienceYears()} yillik an’ana. Bir oila — bir maqsad.
        </p>
        <p className="mt-1 text-white/50">
          © {new Date().getFullYear()} {SITE_NAME}. Barcha huquqlar
          himoyalangan.
        </p>
        <div className="mt-3 flex justify-center text-xs">
          <VisitorCounter />
        </div>
      </div>
    </footer>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import AchievementsClock from "@/components/AchievementsClock";
import { type Certificate, certificateAlt } from "@/lib/certificates";
import { CONTACTS } from "@/lib/site";
import { useSecondTick } from "@/lib/use-second-tick";

const RENDER = 3; // cards each side (2 shown + 1 faint fade edge)
const TRANSITION = 520;
const EASE = "cubic-bezier(0.33, 1, 0.68, 1)";
// With this ease-out the outgoing/incoming cards cross the centre at ~20% of
// the transition; swap the caption there so it tracks the central card.
const CAPTION_SWAP = Math.round(TRANSITION * 0.2);
const MAX = 200;

export default function AchievementsCarousel({
  certs,
}: {
  certs: Certificate[];
}) {
  const items = certs.slice(0, MAX);
  const total = items.length;
  const [index, setIndex] = useState(0);
  const [viewIndex, setViewIndex] = useState(0);
  const barRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const indexRef = useRef(0);
  const loadedIds = useRef<Set<string>>(new Set());
  const lastAdvance = useRef(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Respect the OS "reduce motion" setting: stop the auto-advance and drop the
  // 3D slide/rotate/blur transition down to a plain cross-fade.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const go = useCallback(
    (delta: number) => setIndex((i) => (i + delta + total) % total),
    [total]
  );

  // Advance one certificate per clock second — but only once the incoming
  // certificate image has loaded, so the coverflow never flips to a blank
  // frame. A 2.5s cap keeps the show moving even if an image fails to load.
  const onSecond = useCallback(() => {
    if (reduced || dragging.current || total <= 1) return;
    const next = (indexRef.current + 1) % total;
    const now = Date.now();
    // Hold if the incoming image isn't loaded yet (cap > the 3s interval, so
    // the guard can actually skip a tick instead of being a no-op).
    if (!loadedIds.current.has(items[next].id) && now - lastAdvance.current < 6000) {
      return;
    }
    lastAdvance.current = now;
    setIndex(next);
  }, [reduced, total, items]);
  useSecondTick(onSecond, 3);

  // Caption swaps at the slide's crossover — the moment the incoming card
  // becomes the visually central one — so the name always matches the centred
  // certificate (instant while dragging).
  useEffect(() => {
    if (dragging.current) {
      setViewIndex(index);
      return;
    }
    const t = setTimeout(() => setViewIndex(index), CAPTION_SWAP);
    return () => clearTimeout(t);
  }, [index]);

  const seekTo = useCallback(
    (clientX: number) => {
      const bar = barRef.current;
      if (bar === null || total < 2) return;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      setIndex(Math.round(ratio * (total - 1)));
    },
    [total]
  );
  useEffect(() => {
    function move(e: PointerEvent) {
      if (dragging.current) seekTo(e.clientX);
    }
    function up() {
      dragging.current = false;
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, [seekTo]);

  if (total === 0) {
    return null;
  }

  const active = items[viewIndex];

  return (
    <section className="ach-panel relative overflow-hidden py-14 md:py-20">
      <div className="relative z-10 mx-auto max-w-6xl px-4 text-center text-white">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-300">
          Yutuqlarimiz
        </p>
        <h2 className="mt-2 text-3xl font-extrabold leading-tight sm:text-4xl">
          Natijalar o’zi gapiradi
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-white/70">
          «Mirzo Ulug’bek» xususiy maktabi o’quvchilari 2025–2026 o’quv yilida
          1560+ milliy va xalqaro sertifikat qo’lga kiritdi. Quyida — ana shu
          natijalardan namunalar; ular maktabimizning rasmiy Telegram kanalidan
          bot orqali avtomatik saytga uzatiladi.
        </p>

        {/* Clock — centred above the coverflow at every size. Its ticking
            second hand advances the certificates. */}
        <div className="mt-10 flex flex-col items-center">
          <AchievementsClock sizePx={200} />
          <p className="mt-3 text-sm font-bold text-white">
            Vaqtingizni qadrlang
          </p>
          <p className="text-xs text-white/60">
            Har lahza — kelajagingiz uchun bir qadam
          </p>
          <p className="mt-0.5 text-[11px] text-white/70">
            Ushbu kelajagingizni «Mirzo Ulug’bek» bilan birga yarating
          </p>
        </div>

        {/* Coverflow stage */}
        <div className="relative mt-6 flex h-[360px] items-center justify-center [perspective:1600px] md:h-[560px]">
          {items.map((cert, i) => {
            let pos = i - index;
            if (pos > total / 2) pos -= total;
            if (pos < -total / 2) pos += total;
            if (Math.abs(pos) > RENDER) {
              return null;
            }
            const abs = Math.abs(pos);
            const isCenter = pos === 0;
            // Strong falloff so ONE certificate clearly dominates in front
            // and the rest recede small into the background.
            const scale = [1, 0.66, 0.48, 0.36][abs];
            const opacity = [1, 0.5, 0.24, 0.08][abs];
            const blur = [0, 2, 3.6, 5.5][abs];
            return (
              <Link
                key={cert.id}
                href="/yutuqlar"
                aria-label={`${certificateAlt(cert)} — barcha yutuqlarni ochish`}
                tabIndex={isCenter ? 0 : -1}
                className="absolute will-change-transform"
                style={{
                  transform: `translateX(${pos * 38}%) scale(${scale}) rotateY(${pos * -13}deg)`,
                  opacity,
                  filter: blur === 0 ? "none" : `blur(${blur}px)`,
                  zIndex: 30 - abs,
                  pointerEvents: isCenter ? "auto" : "none",
                  transition: reduced
                    ? `opacity ${TRANSITION}ms ${EASE}`
                    : `transform ${TRANSITION}ms ${EASE}, opacity ${TRANSITION}ms ${EASE}, filter ${TRANSITION}ms ${EASE}`,
                }}
              >
                <span className="block overflow-hidden rounded-2xl border border-white/15 bg-white shadow-2xl ring-1 ring-black/20">
                  <Image
                    src={cert.imageUrl}
                    alt={certificateAlt(cert)}
                    width={cert.width}
                    height={cert.height}
                    priority={i < 3}
                    onLoad={() => loadedIds.current.add(cert.id)}
                    className="h-[330px] w-auto object-contain md:h-[500px]"
                    sizes="(max-width: 768px) 62vw, 360px"
                  />
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Oldingi"
            className="absolute left-1 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white md:left-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Keyingi"
            className="absolute right-1 top-1/2 z-40 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur transition-colors hover:bg-black/60 hover:text-white md:right-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        {/* Caption */}
        <div className="mx-auto mt-6 min-h-[3.75rem] max-w-md rounded-2xl border border-white/12 bg-white/[0.06] px-5 py-3 backdrop-blur-sm">
          <p className="text-lg font-bold text-white">{active.name}</p>
          <p className="text-sm text-white/70">
            {active.subject} · {active.grade} daraja
          </p>
        </div>

        {/* Draggable progress — drag to scrub through the certificates. */}
        <div className="mx-auto mt-4 flex max-w-md items-center gap-3">
          <div
            ref={barRef}
            onPointerDown={(e) => {
              dragging.current = true;
              seekTo(e.clientX);
            }}
            className="relative h-3 flex-1 cursor-pointer touch-none"
          >
            <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-amber-300"
                style={{ width: `${((index + 1) / total) * 100}%` }}
              />
            </div>
            <div
              className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300 shadow"
              style={{ left: `${((index + 1) / total) * 100}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold tabular-nums text-white/60">
            {index + 1} / {total}
          </span>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/yutuqlar"
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-base font-bold text-brand shadow-lg transition-transform hover:scale-[1.03]"
          >
            Barcha yutuqlarni ko’rish
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <a
            href={CONTACTS.telegram.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-white/25 px-7 py-3 text-base font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21.9 4.4L2.9 11.7c-1 .4-1 1.8.1 2.1l4.6 1.4 1.8 5.6c.3 1 1.6 1.2 2.2.4l2.6-3.1 4.8 3.5c.8.6 2 .2 2.2-.8l3-14.6c.2-1.1-.8-2-1.9-1.6z" />
            </svg>
            Telegram kanalimizda kuzatish
          </a>
        </div>
      </div>
    </section>
  );
}

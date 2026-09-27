"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  type Certificate,
  certificateAlt,
  SUBJECT_ORDER,
  yearLabel,
} from "@/lib/certificates";

/**
 * Certificate explorer: subject filter chips + per-year sections + a
 * full-screen lightbox with prev/next over the currently filtered set.
 * Data comes from Firestore (public_certificates), passed in as a prop.
 */
export default function CertificateGallery({
  certificates,
}: {
  certificates: Certificate[];
}) {
  const [subject, setSubject] = useState<string>("all");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Subjects actually present, in canonical order.
  const subjects = useMemo(
    () => SUBJECT_ORDER.filter((s) => certificates.some((c) => c.subject === s)),
    [certificates]
  );

  const filtered = useMemo(
    () =>
      subject === "all"
        ? certificates
        : certificates.filter((c) => c.subject === subject),
    [certificates, subject]
  );

  // Group the filtered set by year, newest year first.
  const years = useMemo(() => {
    const map = new Map<string, Certificate[]>();
    for (const c of filtered) {
      if (!map.has(c.year)) map.set(c.year, []);
      map.get(c.year)!.push(c);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  const close = useCallback(() => setActiveIndex(null), []);
  const step = useCallback(
    (delta: number) => {
      setActiveIndex((current) => {
        if (current === null) return current;
        const next = current + delta;
        if (next < 0 || next >= filtered.length) return current;
        return next;
      });
    },
    [filtered.length]
  );

  useEffect(() => {
    if (activeIndex === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowLeft") step(-1);
      else if (event.key === "ArrowRight") step(1);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, close, step]);

  // A flat index into `filtered` for each card so the lightbox lines up.
  let running = -1;
  const indexOf = new Map<string, number>();
  for (const c of filtered) {
    running += 1;
    indexOf.set(c.id, running);
  }

  const active = activeIndex === null ? null : filtered[activeIndex];

  return (
    <>
      {/* Subject filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSubject("all")}
          className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
            subject === "all"
              ? "border-brand bg-brand text-white"
              : "border-mist bg-white text-ink/70 hover:border-brand hover:text-brand"
          }`}
        >
          Barchasi
        </button>
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSubject(s)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              subject === s
                ? "border-brand bg-brand text-white"
                : "border-mist bg-white text-ink/70 hover:border-brand hover:text-brand"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-brand/30 bg-mist p-10 text-center text-ink/70">
          Bu fandan natijalar tez orada shu yerda ko’rinadi.
        </div>
      ) : (
        <div className="space-y-12">
          {years.map(([year, list]) => (
            <div key={year}>
              <h2 className="mb-5 text-lg font-bold text-ink sm:text-xl">
                {yearLabel(year)}{" "}
                <span className="text-sm font-medium text-ink/50">
                  ({list.length})
                </span>
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {list.map((cert) => (
                  <button
                    key={cert.id}
                    type="button"
                    onClick={() => setActiveIndex(indexOf.get(cert.id) ?? 0)}
                    className="group overflow-hidden rounded-xl border border-mist bg-white text-left shadow-sm transition-shadow hover:shadow-md"
                    aria-label={`${certificateAlt(cert)} — kattalashtirish`}
                  >
                    <div className="relative">
                      <Image
                        src={cert.imageUrl}
                        alt={certificateAlt(cert)}
                        width={400}
                        height={Math.round((400 * cert.height) / cert.width)}
                        loading="lazy"
                        className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                      <span className="absolute right-2 top-2 rounded-full bg-brand px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        {cert.grade}
                      </span>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="truncate text-sm font-bold text-ink">
                        {cert.name}
                      </p>
                      <p className="text-xs text-ink/60">{cert.subject}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {active !== null && activeIndex !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={certificateAlt(active)}
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Yopish"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="5" y1="5" x2="19" y2="19" />
              <line x1="19" y1="5" x2="5" y2="19" />
            </svg>
          </button>

          {activeIndex > 0 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                step(-1);
              }}
              aria-label="Oldingi sertifikat"
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          ) : null}
          {activeIndex < filtered.length - 1 ? (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                step(1);
              }}
              aria-label="Keyingi sertifikat"
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          ) : null}

          <figure
            className="max-h-full max-w-4xl overflow-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              key={active.id}
              src={active.imageUrl}
              alt={certificateAlt(active)}
              width={active.width}
              height={active.height}
              className="ach-lightbox-img h-auto max-h-[82vh] w-auto rounded-lg shadow-2xl"
              sizes="100vw"
            />
            <figcaption className="mt-3 text-center text-white">
              <span className="block text-base font-bold">{active.name}</span>
              <span className="text-sm text-white/70">
                {active.subject} · {active.grade} daraja
                {active.date !== null ? ` · ${active.date}` : ""} (
                {activeIndex + 1}/{filtered.length})
              </span>
            </figcaption>
          </figure>
        </div>
      ) : null}
    </>
  );
}

"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const POSTER = "/assets/video/hero-poster.webp";
const VIDEO_SRC = "/assets/video/hero.mp4";

/**
 * Full-bleed 16:9 hero video (max quality, full length). Autoplays muted;
 * a click on the video toggles sound (like mirzolink.com), with a visible
 * speaker button as a reliable control. The poster carries the LCP and the
 * <video> is mounted after the page is idle so decode never competes with
 * hydration. Reduced-motion / mobile keeps the poster only.
 */
export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      return;
    }
    const ric = (
      window as typeof window & {
        requestIdleCallback?: (cb: () => void) => number;
      }
    ).requestIdleCallback;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (typeof ric === "function") {
      ric(() => setReady(true));
    } else {
      timer = setTimeout(() => setReady(true), 400);
    }
    return () => {
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, []);

  function toggleSound() {
    const v = videoRef.current;
    if (v === null) {
      return;
    }
    const next = !v.muted;
    v.muted = next;
    if (!next) {
      // Unmuting requires the element to be playing with volume.
      v.volume = 1;
      void v.play().catch(() => undefined);
    }
    setMuted(next);
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Poster — always present, carries the LCP. */}
      <Image
        src={POSTER}
        alt="«Mirzo Ulug’bek» xususiy maktabi — tanishuv videosidan lavha"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />

      {ready ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full cursor-pointer object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={POSTER}
          onClick={toggleSound}
          aria-label="Videoni ovozli tinglash uchun bosing"
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>
      ) : null}

      {/* Sound toggle — prominent labelled pill so users always know the
          video has sound and can turn it on/off. Bottom-left of the hero. */}
      {ready ? (
        <button
          type="button"
          onClick={toggleSound}
          aria-label={muted ? "Ovozni yoqish" : "Ovozni o’chirish"}
          className="absolute bottom-24 left-4 z-30 flex items-center gap-2 rounded-full border border-white/30 bg-black/55 px-4 py-2.5 text-sm font-semibold text-white shadow-lg backdrop-blur transition-all hover:scale-[1.03] hover:bg-black/70 md:bottom-6"
        >
          {muted ? (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
              Ovozni yoqish
            </>
          ) : (
            <>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
              Ovozni o’chirish
            </>
          )}
        </button>
      ) : null}
    </div>
  );
}

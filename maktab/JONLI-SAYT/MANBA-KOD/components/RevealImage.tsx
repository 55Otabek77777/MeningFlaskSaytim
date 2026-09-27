"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal image (21st.dev pattern): clip-path + translate reveal
 * when the image enters the viewport. Respects prefers-reduced-motion
 * via the .reveal-img CSS in globals.css.
 */
export default function RevealImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  sizes?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (node === null) {
      return;
    }
    if (typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            observer.disconnect();
            break;
          }
        }
      },
      // Trigger a bit before the image scrolls fully into view.
      { threshold: 0.1, rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(node);
    // Safety net: never leave an image permanently hidden if the observer
    // misfires (some mobile browsers / fast scrolls).
    const fallback = setTimeout(() => setRevealed(true), 1800);
    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div ref={ref} className={`reveal-img ${revealed ? "revealed" : ""}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        className={className}
        sizes={sizes}
      />
    </div>
  );
}

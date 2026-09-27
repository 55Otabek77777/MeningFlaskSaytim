"use client";

import dynamic from "next/dynamic";

// Swiper is heavy; keep it out of the initial bundle and hydrate the
// carousel only on the client after first paint (mobile TBT win).
const TestimonialsCarousel = dynamic(
  () => import("@/components/TestimonialsCarousel"),
  {
    ssr: false,
    loading: () => (
      <section className="bg-mist">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">
            Ota-onalar fikri
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="shadow-card h-56 rounded-2xl bg-white"
              />
            ))}
          </div>
        </div>
      </section>
    ),
  }
);

export default function LazyTestimonials() {
  return <TestimonialsCarousel />;
}

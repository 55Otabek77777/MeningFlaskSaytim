"use client";

import dynamic from "next/dynamic";

// Defer the Swiper-based gallery to the client to shrink the initial JS.
const GallerySection = dynamic(() => import("@/components/GallerySection"), {
  ssr: false,
  loading: () => (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">
        Maktab hayotidan lavhalar
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="aspect-[4/3] rounded-2xl bg-mist" />
        ))}
      </div>
    </section>
  ),
});

export default function LazyGallery() {
  return <GallerySection />;
}

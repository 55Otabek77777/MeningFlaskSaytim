import GalleryCarousel, { type GalleryPhoto } from "@/components/GalleryCarousel";

/** Real school photos (see scripts/optimize-photos.mjs naming contract). */
const PHOTOS: GalleryPhoto[] = [
  { src: "/photos/grads-2324-a.jpg", caption: "2023–2024 o’quv yili bitiruvchilari — o’g’il bolalar" },
  { src: "/photos/grads-2324-b.jpg", caption: "2023–2024 o’quv yili bitiruvchilari — qizlar" },
  { src: "/photos/students-2425-a.jpg", caption: "2024–2025 o’quv yili o’quvchilari" },
  { src: "/photos/students-2425-b.jpg", caption: "2024–2025 o’quv yili — jamoamiz" },
  { src: "/photos/trip-orda.jpg", caption: "Qo’qon O’rdasiga bilim sayohati" },
  { src: "/photos/students-2425-c.jpg", caption: "Maktab hayotidan lavhalar" },
  { src: "/photos/trip-a.jpg", caption: "Bitiruvchilar sayohatidan lavha" },
  { src: "/photos/trip-b.jpg", caption: "Unutilmas sayohat kunlari" },
];

// The optimizer outputs .webp; map extensions here in one place.
const GALLERY: GalleryPhoto[] = PHOTOS.map((p) => ({
  ...p,
  src: p.src.replace(/\.jpg$/, ".webp"),
}));

export default function GallerySection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20" data-aos="fade-up">
      <p className="text-center text-sm font-bold uppercase tracking-[0.2em] text-brand">
        Maktab hayoti
      </p>
      <h2 className="mt-2 text-center text-3xl font-extrabold text-ink sm:text-4xl">
        Bir maktab — minglab yorqin taqdir
      </h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-base text-muted">
        «Mirzo Ulug’bek» xususiy maktabining turli yillardagi bitiruvchilari,
        o’quvchilari va unutilmas bilim sayohatlaridan lavhalar — maktabimiz
        bilan yaqindan tanishing.
      </p>
      <div className="mt-10">
        <GalleryCarousel photos={GALLERY} />
      </div>
    </section>
  );
}

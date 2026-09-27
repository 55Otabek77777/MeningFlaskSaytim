"use client";

import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/pagination";

const TESTIMONIALS = [
  {
    text: "Farzandim kimyo-biologiya yo’nalishida o’qiydi. O’qituvchilarning e’tibori va tizimli darslar natijasida milliy sertifikatni yuqori ball bilan topshirdi.",
    name: "Dilnoza X.",
    role: "ona",
    badge: "Milliy sertifikat A",
  },
  {
    text: "Maktabda intizom va nazorat juda kuchli. Yotoqxona sharoitlari yaxshi, farzandim xavfsizligidan doim xotirjamman.",
    name: "Bahodir A.",
    role: "ota",
    badge: "5 yillik ishonch",
  },
  {
    text: "Ikkinchi farzandimni ham shu maktabga berdim. Ustozlarning fidoyiligi va natijaga yo’naltirilgan ta’lim — bizni shu yerda ushlab turgan narsa.",
    name: "Mavluda R.",
    role: "ona",
    badge: "2 farzand",
  },
] as const;

const GOOGLE_REVIEWS_URL = "https://maps.google.com/?cid=18054142510786065278";

function Stars() {
  return (
    <div className="flex gap-0.5 text-accent" role="img" aria-label="5 yulduz">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2l-6.1 3.4 1.4-6.8L2.2 9.1l6.9-.8L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsCarousel() {
  return (
    <section className="bg-mist">
      <div className="mx-auto max-w-6xl px-4 py-16" data-aos="fade-up">
        <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">
          Ota-onalar fikri
        </h2>
        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 6000, disableOnInteraction: true }}
          pagination={{ clickable: true }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="mt-10 !pb-10"
        >
          {TESTIMONIALS.map((t) => (
            <SwiperSlide key={t.name} className="!h-auto">
              <figure className="shadow-card flex h-full flex-col rounded-2xl bg-white p-6">
                <div className="flex items-center justify-between gap-2">
                  <Stars />
                  <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                    {t.badge}
                  </span>
                </div>
                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-ink/85">
                  «{t.text}»
                </blockquote>
                <figcaption className="mt-4">
                  <span className="font-bold text-ink">{t.name}</span>
                  <span className="block text-xs text-muted">{t.role}</span>
                </figcaption>
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
        <p className="text-center text-sm text-muted">
          Google’da{" "}
          <a
            href={GOOGLE_REVIEWS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-brand hover:underline"
          >
            4.9 ★ (41+ sharh)
          </a>
        </p>
      </div>
    </section>
  );
}

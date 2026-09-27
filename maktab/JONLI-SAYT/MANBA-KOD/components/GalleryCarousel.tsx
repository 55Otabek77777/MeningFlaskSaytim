"use client";

import Image from "next/image";
import { Autoplay, EffectCoverflow, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";

export interface GalleryPhoto {
  src: string;
  caption: string;
}

/**
 * Real-photo gallery as a 3D coverflow (mirrors the certificate block): one
 * large centred photo with the neighbours receding, auto-advancing every 5s
 * with a smooth animation. Pauses on hover; captions on the .photo-card.
 */
export default function GalleryCarousel({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <Swiper
      modules={[Autoplay, EffectCoverflow, Pagination]}
      effect="coverflow"
      grabCursor
      centeredSlides
      loop
      loopAdditionalSlides={2}
      autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
      pagination={{ clickable: true }}
      slidesPerView={1.25}
      spaceBetween={16}
      coverflowEffect={{
        rotate: 0,
        stretch: 0,
        depth: 170,
        modifier: 2.2,
        scale: 0.9,
        slideShadows: false,
      }}
      breakpoints={{
        640: { slidesPerView: 1.8 },
        1024: { slidesPerView: 2.4 },
      }}
      className="!pb-12"
    >
      {photos.map((photo) => (
        <SwiperSlide key={photo.src}>
          <figure className="photo-card overflow-hidden rounded-3xl border border-mist bg-mist shadow-xl">
            <Image
              src={photo.src}
              alt={photo.caption}
              width={1000}
              height={750}
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
              sizes="(max-width: 640px) 85vw, (max-width: 1024px) 60vw, 44vw"
            />
            <figcaption>{photo.caption}</figcaption>
          </figure>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

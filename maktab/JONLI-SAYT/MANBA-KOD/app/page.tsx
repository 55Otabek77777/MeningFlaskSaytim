import type { Metadata } from "next";
import Link from "next/link";

import AchievementsCarousel from "@/components/AchievementsCarousel";
import AnimatedCounters from "@/components/AnimatedCounters";
import HeroVideo from "@/components/HeroVideo";
import LazyGallery from "@/components/LazyGallery";
import LazyTestimonials from "@/components/LazyTestimonials";
import LegacyBlock from "@/components/LegacyBlock";
import NewsCard from "@/components/NewsCard";
import QabulCountdown from "@/components/QabulCountdown";
import QabulSteps from "@/components/QabulSteps";
import SocialLinks from "@/components/SocialLinks";
import TelegramNewsCard, { TelegramNewsRow } from "@/components/TelegramNewsCard";
import YonalishlarGrid from "@/components/YonalishlarGrid";
import { getCertificates } from "@/lib/certificates-data";
import { fetchLatestNews } from "@/lib/news";
import { CONTACTS, experienceYears, getStats } from "@/lib/site";
import { fetchTelegramPosts, TELEGRAM_CHANNEL_URL } from "@/lib/telegram-news";

export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    absolute: "«Mirzo Ulug’bek» xususiy maktabi — Uchko’prik, Farg’ona",
  },
  description: `${experienceYears()} yildan buyon Uchko’prik tumani, Farg’ona viloyatida faoliyat yuritayotgan xususiy maktab. 2025–2026 o’quv yilida 1560+ sertifikat, IELTS 8.0. Qabul 1-avgustdan.`,
};

export default async function HomePage() {
  const [telegramPosts, firestoreNews, certificates] = await Promise.all([
    fetchTelegramPosts(5),
    fetchLatestNews(3),
    getCertificates(),
  ]);
  const years = experienceYears();
  const stats = getStats(years);

  return (
    <>
      {/* ===== Hero v7: responsive video (16:9 desktop / 9:16 mobile),
           bottom gradient on mobile + left gradient on desktop ===== */}
      <section className="relative flex min-h-[100svh] items-end overflow-hidden md:min-h-[88vh]">
        <HeroVideo />
        {/* Mobile: bottom gradient. Desktop: left gradient. pointer-events
            off so a click on the video toggles sound. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/92 via-white/35 to-transparent md:hidden dark:from-[#0b1220]/92 dark:via-[#0b1220]/35" />
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-white/85 via-white/40 to-transparent md:block dark:from-[#0b1220]/85 dark:via-[#0b1220]/40" />
        <div className="relative mx-auto flex w-full max-w-6xl justify-start px-4 pb-16 pt-28">
          <div className="hero-fadein max-w-xl text-left">
            <h1 className="text-4xl font-extrabold leading-tight text-ink md:text-6xl">
              Biz nafaqat dars beramiz —{" "}
              <span className="text-brand">farzandingiz kelajagini yaratamiz.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink/85 sm:text-lg">
              Yillar davomida sinovdan o’tgan tajriba va zamonaviy ta’lim
              muhiti. Farzandingiz uchun to’g’ri tanlov — aynan shu yerda.
            </p>
            <div className="mt-7">
              <Link
                href="/qabul"
                className="cta-gradient inline-block rounded-2xl px-9 py-5 text-lg font-bold text-white shadow-xl shadow-accent/30 transition-all hover:scale-[1.03] hover:shadow-2xl hover:shadow-accent/40"
              >
                Birinchi qadamni tashlang — hujjat topshiring
              </Link>
              <p className="mt-3 text-sm text-ink/75">
                yoki qo’ng’iroq qiling:{" "}
                <a
                  href={CONTACTS.phones[0].href}
                  className="font-bold text-brand hover:underline"
                >
                  {CONTACTS.phones[0].label}
                </a>
              </p>
            </div>
            <p className="mt-7 text-xs font-medium text-ink/60">
              Litsenziya № 363657 · Uchko’prik, Farg’ona
            </p>
          </div>
        </div>
      </section>

      {/* ===== Live admission countdown (1-avgust 07:00) ===== */}
      <QabulCountdown />

      {/* ===== "Nega aynan biz?" — all proof numbers in ONE block
           (stats + IELTS merged; no repeats elsewhere on the page) ===== */}
      <section className="bg-mist" data-aos="fade-up">
        <h2 className="pt-14 text-center text-2xl font-bold text-ink sm:text-3xl">
          Nega aynan biz?
        </h2>
        <AnimatedCounters stats={stats} />
      </section>

      {/* ===== Legacy story (founder + director) ===== */}
      <LegacyBlock />

      {/* ===== Achievements — the strongest proof, placed right above the
           directions (auto-rotating certificate coverflow, Firebase) ===== */}
      {certificates.length > 0 ? (
        <AchievementsCarousel certs={certificates} />
      ) : null}

      {/* ===== Directions ===== */}
      <div data-aos="fade-up">
        <YonalishlarGrid />
      </div>

      {/* ===== Admission steps ===== */}
      <div data-aos="fade-up">
        <QabulSteps />
      </div>

      {/* ===== Testimonials (Swiper, lazy) ===== */}
      <LazyTestimonials />

      {/* ===== Latest news (Telegram -> Firestore fallback) ===== */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16" data-aos="fade-up">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-ink sm:text-3xl">
              So’nggi yangiliklar
            </h2>
            <Link
              href="/yangiliklar"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Barchasi →
            </Link>
          </div>
          {telegramPosts.length > 0 ? (
            /* Oxford-style: one big story + compact side list (desktop). */
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="min-w-0">
                <TelegramNewsCard post={telegramPosts[0]} />
              </div>
              <div className="flex min-w-0 flex-col gap-4">
                {telegramPosts.slice(1, 5).map((post) => (
                  <TelegramNewsRow key={post.id} post={post} />
                ))}
              </div>
            </div>
          ) : firestoreNews.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {firestoreNews.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-brand/30 bg-mist p-10 text-center">
              <p className="text-lg font-semibold text-ink">
                Yangiliklar Telegram kanalimizda
              </p>
              <a
                href={TELEGRAM_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-xl bg-brand px-6 py-3 font-bold text-white transition-opacity hover:opacity-90"
              >
                @ulugbek_rm
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ===== School life gallery (Swiper, real photos, lazy) ===== */}
      <LazyGallery />

      {/* ===== AI assistant bot CTA ===== */}
      <section className="bg-white" data-aos="fade-up">
        <div className="mx-auto max-w-5xl px-4 pb-4 pt-8">
          <div className="flex flex-col items-center gap-5 rounded-3xl bg-gradient-to-br from-[#1a2856] to-[#3b5bdb] px-6 py-8 text-center text-white sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h2 className="text-xl font-extrabold sm:text-2xl">
                💬 Savolingiz bormi?
              </h2>
              <p className="mt-1 max-w-xl text-sm text-white/80">
                Rasmiy botimizdagi sun’iy intellekt yordamchisi qabul,
                yo’nalishlar va natijalar bo’yicha savollaringizga darhol javob
                beradi.
              </p>
            </div>
            <a
              href="https://t.me/mirzorasmiybot?start=web"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-brand shadow-lg transition-transform hover:scale-[1.03]"
            >
              🤖 Botda savol berish
            </a>
          </div>
        </div>
      </section>

      {/* ===== Official channels (mirzo-link ecosystem) ===== */}
      <SocialLinks />

      {/* ===== Contact CTA ===== */}
      <section className="bg-brand">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center text-white">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Farzandingizni ishonchli maktabga bering
          </h2>
          <p className="max-w-xl text-white/80">
            Savollaringiz bo’lsa, qo’ng’iroq qiling yoki ariza qoldiring —
            tez orada bog’lanamiz.
          </p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/qabul"
              className="on-brand-white rounded-xl bg-white px-8 py-3.5 text-base font-bold text-brand transition-opacity hover:opacity-90"
            >
              Ariza qoldirish
            </Link>
            <a
              href={CONTACTS.phones[0].href}
              className="rounded-xl border-2 border-white/70 px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-white/10"
            >
              {CONTACTS.phones[0].label}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

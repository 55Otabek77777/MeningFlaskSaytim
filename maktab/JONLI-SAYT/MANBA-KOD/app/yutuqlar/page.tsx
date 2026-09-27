import type { Metadata } from "next";
import Link from "next/link";

import Breadcrumb from "@/components/Breadcrumb";
import CertificateBoard from "@/components/CertificateBoard";
import { getCertificates } from "@/lib/certificates-data";
import { CONTACTS } from "@/lib/site";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Yutuqlar va sertifikatlar",
  description:
    "«Mirzo Ulug’bek» xususiy maktabi o’quvchilarining yutuqlari: milliy va xalqaro imtihonlardan A va A+ darajali natijalar, ingliz tilidan CEFR B2–C1. Fan bo’yicha filtrlab ko’ring.",
};

export default async function AchievementsPage() {
  const certificates = await getCertificates();

  return (
    <>
      <section className="bg-brand-soft">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <Breadcrumb items={[{ label: "Yutuqlar" }]} />
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
                Yutuqlar va sertifikatlar
              </h1>
              <p className="mt-3 max-w-2xl text-ink/75">
                O’quvchilarimizning milliy va xalqaro imtihonlardan qo’lga
                kiritgan eng yuqori — A va A+ darajali natijalaridan namunalar
                (ingliz tilidan CEFR B2–C1). Fan bo’yicha filtrlab ko’ring.
              </p>
            </div>
            <Link
              href="/ekran"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl border-2 border-brand px-5 py-2.5 text-sm font-bold text-brand transition-colors hover:bg-brand hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
              </svg>
              To’liq ekran rejimi
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        {certificates.length > 0 ? (
          <CertificateBoard certificates={certificates} />
        ) : (
          <div className="rounded-2xl border border-dashed border-brand/30 bg-mist p-10 text-center text-ink/70">
            Natijalar tez orada shu yerda ko’rinadi.
          </div>
        )}

        {/* Understated note: results grow automatically over the year. */}
        <div className="mt-12 rounded-3xl bg-brand p-8 text-center text-white sm:p-10">
          <h2 className="text-xl font-bold sm:text-2xl">
            Natijalar avtomatik ko’payib boradi
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-white/80">
            Yangi o’quv yili natijalari maktabimizning rasmiy Telegram bot
            orqali avtomatik saytga uzatiladi va o’quv yili davomida yanada
            ko’payadi. Barcha natijalarni Telegram kanalimizda kuzatishingiz
            mumkin.
          </p>
          <a
            href={CONTACTS.telegram.href}
            target="_blank"
            rel="noopener noreferrer"
            className="on-brand-white mt-5 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 font-bold text-brand transition-transform hover:scale-[1.03]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M21.9 4.4L2.9 11.7c-1 .4-1 1.8.1 2.1l4.6 1.4 1.8 5.6c.3 1 1.6 1.2 2.2.4l2.6-3.1 4.8 3.5c.8.6 2 .2 2.2-.8l3-14.6c.2-1.1-.8-2-1.9-1.6z" />
            </svg>
            Telegram kanalimizda kuzatish
          </a>
        </div>

        <p className="mt-5 text-center text-xs text-ink/40">
          Xotirani tejash maqsadida eng eski natijalar vaqti-vaqti bilan
          yangilanib boriladi.
        </p>
      </section>
    </>
  );
}

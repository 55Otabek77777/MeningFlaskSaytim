import Link from "next/link";

import YonalishIcon from "@/components/YonalishIcon";
import { YONALISHLAR } from "@/lib/yonalishlar";

export default function YonalishlarGrid() {
  return (
    <section id="yonalishlar" className="mx-auto max-w-6xl px-4 py-16">
      <h2 className="text-center text-2xl font-bold text-ink sm:text-3xl">
        Yo’nalishlarimiz
      </h2>
      <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted">
        Oliy o’quv yurtiga kirish uchun kerak bo’ladigan barcha yo’nalishlar
        maktabimizda mavjud. Har bir o’quvchi o’z maqsadiga mos fanlar
        juftligini tanlaydi.
      </p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {YONALISHLAR.map((y) => (
          <Link
            key={y.slug}
            href={`/yonalishlar/${y.slug}`}
            className="shadow-card card-glow group rounded-2xl border border-mist bg-white p-6 transition-all duration-300 hover:-translate-y-1"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110">
              <YonalishIcon icon={y.icon} className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-lg font-bold text-ink group-hover:text-brand">
              {y.title}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{y.short}</p>
            <span className="mt-3 inline-block text-sm font-semibold text-accent">
              Batafsil →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

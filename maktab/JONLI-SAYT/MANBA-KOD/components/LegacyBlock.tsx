import Image from "next/image";
import Link from "next/link";

import { experienceYears } from "@/lib/site";

/** Home-page legacy teaser: founder + director, Eton-style story. */
export default function LegacyBlock() {
  const years = experienceYears();
  return (
    <section className="bg-white">
      <div
        className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 lg:grid-cols-2"
        data-aos="fade-up"
      >
        <div className="grid grid-cols-2 gap-4">
          <figure className="photo-card rounded-2xl">
            <Image
              src="/photos/founder.webp"
              alt="Jabborov A’zamjon Mashrabovich — maktab asoschisi"
              width={600}
              height={400}
              loading="lazy"
              className="aspect-[3/4] w-full rounded-2xl object-cover"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
            <figcaption>Jabborov A’zamjon Mashrabovich — asoschi</figcaption>
          </figure>
          <figure className="photo-card mt-8 rounded-2xl">
            <Image
              src="/photos/director.webp"
              alt="Mashrabjonov Ulug’bek A’zamjon o’g’li — direktor"
              width={600}
              height={400}
              loading="lazy"
              className="aspect-[3/4] w-full rounded-2xl object-cover"
              sizes="(max-width: 1024px) 50vw, 25vw"
            />
            <figcaption>
              Mashrabjonov Ulug’bek A’zamjon o’g’li — direktor
            </figcaption>
          </figure>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold leading-tight text-ink sm:text-4xl">
            Bir oilaning orzusi —{" "}
            <span className="text-brand">bir avlodning kelajagi</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink/80">
            {years} yil avval Jabborov A’zamjon Mashrabovich Uchko’prikda
            kichik bir orzu bilan ish boshladi: qishloq bolalari ham dunyo
            darajasidagi ta’lim olsin. Bugun bu orzuni o’g’li — Mashrabjonov
            Ulug’bek A’zamjon o’g’li davom ettirmoqda. Ikki avlod, bitta
            maqsad — farzandingizning kelajagi.
          </p>
          <Link
            href="/tarix"
            className="mt-7 inline-block rounded-xl border-2 border-brand px-7 py-3.5 font-bold text-brand transition-colors hover:bg-brand hover:text-white"
          >
            Tariximiz bilan tanishing →
          </Link>
        </div>
      </div>
    </section>
  );
}

import Link from "next/link";

const STEPS = [
  {
    title: "Ariza qoldiring",
    text: "Saytda 1 daqiqalik forma yoki telefon orqali.",
  },
  {
    title: "Suhbat va tanishuv",
    text: "Maktabga tashrif buyurasiz, savollarga javob olasiz.",
  },
  {
    title: "Shartnoma va o’qish boshlanishi",
    text: "Hujjatlar rasmiylashtiriladi — farzandingiz o’qishni boshlaydi.",
  },
] as const;

export default function QabulSteps() {
  return (
    <section className="bg-brand">
      <div className="mx-auto max-w-6xl px-4 py-16 text-white">
        <h2 className="text-center text-2xl font-bold sm:text-3xl">
          Qabul jarayoni — 3 qadam
        </h2>
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="text-center">
              <span className="on-brand-white mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-2xl font-extrabold text-brand">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
        <div className="mt-10 text-center">
          <Link
            href="/qabul"
            className="inline-block rounded-xl bg-accent px-8 py-4 text-base font-bold text-white shadow-lg shadow-black/20 transition-transform hover:scale-[1.02]"
          >
            Hozir ariza qoldirish
          </Link>
        </div>
      </div>
    </section>
  );
}

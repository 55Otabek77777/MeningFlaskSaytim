"use client";

import { useState } from "react";

import {
  ACTIVE_GRADES,
  LOCKED_GRADE_NOTE,
  LOCKED_GRADES,
  REGIONS,
} from "@/lib/site";

type FormStatus =
  | "idle"
  | "submitting"
  | "success"
  | "duplicate"
  | "error"
  | "throttled";

const THROTTLE_KEY = "ariza_last_submit";
const THROTTLE_MS = 60_000;

/**
 * Formats a raw phone entry as "+998 90 123 45 67" (operator 2 + 3-2-2),
 * capping at 9 national digits. Returns the display string.
 */
function formatUzPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("998")) {
    digits = digits.slice(3);
  }
  digits = digits.slice(0, 9);
  const p = ["+998"];
  if (digits.length > 0) p.push(digits.slice(0, 2));
  if (digits.length > 2) p.push(digits.slice(2, 5));
  if (digits.length > 5) p.push(digits.slice(5, 7));
  if (digits.length > 7) p.push(digits.slice(7, 9));
  return p.join(" ");
}

function phoneToE164(display: string): string | null {
  const digits = display.replace(/\D/g, "");
  const national = digits.startsWith("998") ? digits.slice(3) : digits;
  return national.length === 9 ? `+998${national}` : null;
}

export default function AdmissionForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorText, setErrorText] = useState("");
  const [duplicateAt, setDuplicateAt] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [lockedHint, setLockedHint] = useState<string | null>(null);
  const [gradeNote, setGradeNote] = useState<{
    type: "warn" | "info";
    text: string;
  } | null>(null);

  function onGradeChange(value: string) {
    setLockedHint(null);
    const g = value.toLowerCase();
    if (g.includes("11") || g.includes("bitiruv")) {
      setGradeNote({
        type: "warn",
        text: "⚠️ Diqqat: 11-sinf o’quvchilari va bitiruvchilar uchun qabul o’z yo’nalishi bo’yicha sertifikat mavjudligiga bog’liq — barcha nomzodlar ham qabul qilinavermaydi. Aniq ma’lumot uchun mas’ul menejerlar bilan bog’laning: +998 97 417 37 77 / @MirzoUlugbekMaktabi_Admin.",
      });
    } else if (g.includes("10")) {
      setGradeNote({
        type: "info",
        text: "10-sinf uchun qabul qisman sinov va suhbat asosida amalga oshiriladi.",
      });
    } else {
      setGradeNote(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Honeypot.
    if (String(data.get("website") ?? "").length > 0) {
      setStatus("success");
      return;
    }

    const last = Number(window.localStorage.getItem(THROTTLE_KEY) ?? "0");
    if (Date.now() - last < THROTTLE_MS) {
      setStatus("throttled");
      return;
    }

    const fullName = String(data.get("fullName") ?? "").trim();
    const region = String(data.get("region") ?? "").trim();
    const grade = String(data.get("grade") ?? "").trim();
    const phoneE164 = phoneToE164(phone);

    if (fullName.length < 3) {
      setStatus("error");
      setErrorText("Ism-familiyani to’liq kiriting.");
      return;
    }
    if (region.length === 0) {
      setStatus("error");
      setErrorText("Viloyatni tanlang.");
      return;
    }
    if (grade.length === 0) {
      setStatus("error");
      setErrorText("Sinfni tanlang.");
      return;
    }
    if (phoneE164 === null) {
      setStatus("error");
      setErrorText("Telefon raqamni to’liq kiriting: +998 90 123 45 67");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/ariza", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, region, grade, phone: phoneE164 }),
      });
      if (!res.ok) {
        throw new Error(`API ${res.status}`);
      }
      const result = (await res.json()) as { duplicate?: boolean; createdAt?: string };
      window.localStorage.setItem(THROTTLE_KEY, String(Date.now()));
      if (result.duplicate === true) {
        setDuplicateAt(result.createdAt ?? "");
        setStatus("duplicate");
      } else {
        setStatus("success");
      }
      form.reset();
      setPhone("+998 ");
    } catch (error) {
      console.error("Ariza submit failed:", error);
      setStatus("error");
      setErrorText(
        "Xatolik yuz berdi. Iltimos, qayta urinib ko’ring yoki telefon orqali bog’laning."
      );
    }
  }

  if (status === "duplicate") {
    const when =
      duplicateAt.length > 0
        ? new Date(duplicateAt).toLocaleString("uz-UZ", {
            timeZone: "Asia/Tashkent",
            dateStyle: "long",
            timeStyle: "short",
          })
        : "";
    return (
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8 text-center dark:border-blue-900 dark:bg-blue-950">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M12 8v4l3 3M12 21a9 9 0 100-18 9 9 0 000 18z" />
          </svg>
        </div>
        <p className="mt-4 text-lg font-bold text-blue-900 dark:text-blue-100">
          Siz allaqachon ro’yxatdan o’tgansiz
        </p>
        <p className="mt-1 text-sm text-blue-800/80 dark:text-blue-200/80">
          {when.length > 0
            ? `Arizangiz avval, ${when}da qabul qilingan. Qayta yuborish shart emas — menejerlarimiz bilan bog’lanasiz.`
            : "Arizangiz avval qabul qilingan. Qayta yuborish shart emas — menejerlarimiz bilan bog’lanasiz."}
        </p>
        <p className="mx-auto mt-4 max-w-sm text-sm text-blue-800/80 dark:text-blue-200/80">
          Ma’lumotlaringizni to’g’rilash kerak bo’lsa yoki xabarnomalarni
          kuzatib borish uchun rasmiy botimizga o’ting 👇
        </p>
        <a
          href="https://t.me/mirzorasmiybot?start=web"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
        >
          🤖 Rasmiy botga o’tish
        </a>
        <p className="mt-4 text-xs text-blue-800/60 dark:text-blue-200/60">
          Savol bo’lsa: +998 97 417 37 77
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center dark:border-green-900 dark:bg-green-950">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="mt-4 text-lg font-bold text-green-900 dark:text-green-100">Arizangiz qabul qilindi ✅</p>
        <p className="mt-1 text-sm text-green-800/80 dark:text-green-200/80">
          Tez orada menejerlarimiz siz bilan bog’lanadi.
        </p>
        <p className="mx-auto mt-4 max-w-sm text-sm text-green-800/80 dark:text-green-200/80">
          So’nggi yangiliklar, natijalar va savollaringizga javob olish uchun
          rasmiy botimizga o’ting 👇
        </p>
        <a
          href="https://t.me/mirzorasmiybot?start=web"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand px-7 py-3.5 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
        >
          🤖 Rasmiy botga o’tish
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Honeypot */}
      <div className="hidden" aria-hidden="true">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-semibold text-ink">
          Ism-familiya <span className="text-accent">*</span>
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          minLength={3}
          maxLength={120}
          placeholder="Masalan: Mashrabov Otabek"
          className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-3 text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      <div>
        <label htmlFor="region" className="block text-sm font-semibold text-ink">
          Viloyat <span className="text-accent">*</span>
        </label>
        <select
          id="region"
          name="region"
          required
          defaultValue=""
          className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          <option value="" disabled>
            Viloyatni tanlang
          </option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="grade" className="block text-sm font-semibold text-ink">
          Sinf <span className="text-accent">*</span>
        </label>
        <select
          id="grade"
          name="grade"
          required
          defaultValue=""
          onChange={(e) => onGradeChange(e.target.value)}
          className="mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          <option value="" disabled>
            Sinfni tanlang
          </option>
          {ACTIVE_GRADES.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
          {LOCKED_GRADES.map((g) => (
            <option key={g} value={g} disabled>
              {g} (tez orada)
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setLockedHint(lockedHint === null ? LOCKED_GRADE_NOTE : null)}
          className="mt-1.5 text-xs font-medium text-brand hover:underline"
        >
          5–7-sinflar haqida?
        </button>
        {lockedHint !== null ? (
          <p className="mt-2 rounded-xl bg-brand-soft px-4 py-3 text-xs leading-relaxed text-ink/80">
            {lockedHint}
          </p>
        ) : null}
        {gradeNote !== null ? (
          <p
            className={`mt-2 rounded-xl px-4 py-3 text-xs leading-relaxed ${
              gradeNote.type === "warn"
                ? "border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                : "bg-brand-soft text-ink/80"
            }`}
          >
            {gradeNote.text}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-semibold text-ink">
          Telefon <span className="text-accent">*</span>
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          inputMode="numeric"
          value={phone}
          onChange={(e) => setPhone(formatUzPhone(e.target.value))}
          placeholder="+998 90 123 45 67"
          className="mt-1.5 w-full rounded-xl border border-ink/15 px-4 py-3 text-ink outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
      </div>

      {status === "error" ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-accent dark:bg-red-950/50 dark:text-red-300">
          {errorText}
        </p>
      ) : null}
      {status === "throttled" ? (
        <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
          Iltimos, bir daqiqadan so’ng qayta urinib ko’ring.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-xl bg-accent px-6 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {status === "submitting" ? "Yuborilmoqda…" : "Ariza yuborish"}
      </button>
    </form>
  );
}

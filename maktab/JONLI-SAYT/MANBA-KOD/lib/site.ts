/**
 * Single source of truth for school facts and contact data.
 * All user-facing strings are Uzbek (Latin) with U+2019 apostrophes.
 */

export const SITE_NAME = "«Mirzo Ulug’bek» xususiy maktabi";
export const SITE_SHORT_NAME = "Mirzo Ulug’bek maktabi";

/** Production URL — overridden via NEXT_PUBLIC_SITE_URL if set. */
const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
export const SITE_URL =
  envSiteUrl !== undefined && envSiteUrl.length > 0
    ? envSiteUrl
    : "https://mirzoulugbek.app";

/** Founding year (repetition centre). Kept only as a historical fact. */
export const FOUNDED_YEAR = 1998;

/**
 * Years of experience, computed so the copy never hardcodes "27".
 * 1999 base yields "27" in 2026 and auto-increments each new year.
 */
export function experienceYears(): number {
  return new Date().getFullYear() - 1999;
}

/** Official all-links page (QR ecosystem). */
export const MIRZOLINK_URL = "https://mirzolink.com";

export const FOUNDER = "Jabborov A’zamjon Mashrabovich";
export const DIRECTOR = "Mashrabjonov Ulug’bek A’zamjon o’g’li";

export const CONTACTS = {
  phones: [
    { label: "+998 97 417 37 77", href: "tel:+998974173777" },
    { label: "+998 94 595 37 77", href: "tel:+998945953777" },
  ],
  telegram: { label: "@ulugbek_rm", href: "https://t.me/ulugbek_rm" },
  instagram: {
    label: "@mirzoulugbekmaktabi",
    href: "https://www.instagram.com/mirzoulugbekmaktabi",
  },
  youtube: { label: "@ulugbek_xm", href: "https://www.youtube.com/@ulugbek_xm" },
  /** Operational address (directions), confirmed by the owner. */
  address:
    "Farg’ona viloyati, Uchko’prik tumani, Nihol MFY, Qayrog’och qishlog’i, 45-uy",
  mapUrl: "https://maps.app.goo.gl/n7HcCtnK3KU1ZUWh9",
} as const;

export interface StatItem {
  /** Numeric string for the count-up animation, or "" for text-only. */
  value: string;
  /** Big text shown when there is no number (student count is never shown). */
  display?: string;
  label: string;
  icon: string;
}

/** Home/about statistics. Student count is NEVER exposed as a number. */
export function getStats(years: number): StatItem[] {
  return [
    {
      value: `${years}+`,
      label: "o’quv markazi va ta’lim sohasidagi yillik tajriba",
      icon: "award",
    },
    {
      value: "",
      display: "Ilk minglik",
      label:
        "2025–2026 o’quv yilida o’quvchilarimiz soni ilk minglik davriga qadam qo’ydi",
      icon: "users",
    },
    {
      value: "1560+",
      label:
        "2025–2026 o’quv yili davomida o’quvchilarimiz qo’lga kiritgan milliy va xalqaro sertifikatlar soni",
      icon: "scroll",
    },
    {
      value: "",
      display: "IELTS 8.0",
      label: "o’qituvchimizning shaxsiy natijasi — ta’lim sifati kafolati",
      icon: "globe",
    },
    {
      value: "45+",
      label: "tajribali va pedagogik mahoratli o’qituvchilar",
      icon: "briefcase",
    },
    {
      value: "64",
      label:
        "hudud bo’ylab videokuzatuv kameralari; yotoqxonalarda maxsus nazoratchilar",
      icon: "camera",
    },
  ];
}

export const WORK_HOURS = [
  { days: "Dushanba — Yakshanba", hours: "07:00 — 21:30" },
] as const;

/** Home-leave note shown next to the schedule. */
export const HOME_LEAVE_NOTE =
  "«Mirzo Ulug’bek» xususiy maktabida 2 haftada bir marta (shanba–yakshanba) uyga ruxsat beriladi.";

/** O'zbekiston viloyatlari (admission form dropdown). */
export const REGIONS = [
  "Andijon viloyati",
  "Buxoro viloyati",
  "Farg’ona viloyati",
  "Jizzax viloyati",
  "Xorazm viloyati",
  "Namangan viloyati",
  "Navoiy viloyati",
  "Qashqadaryo viloyati",
  "Qoraqalpog’iston Respublikasi",
  "Samarqand viloyati",
  "Sirdaryo viloyati",
  "Surxondaryo viloyati",
  "Toshkent viloyati",
  "Toshkent shahri",
] as const;

/** Admission form grades: active (selectable) vs locked (info tooltip). */
export const ACTIVE_GRADES = [
  "8-sinf",
  "9-sinf",
  "10-sinf",
  "11-sinf",
  "Bitiruvchi (11-sinfni tugatgan)",
] as const;

export const LOCKED_GRADES = ["5-sinf", "6-sinf", "7-sinf"] as const;

export const LOCKED_GRADE_NOTE =
  "Ushbu sinflarimiz uchun tez orada yangi bino qurib bitkaziladi. Admin va menejerlarimiz sizga xabar beradi. Telegram kanallarimizda batafsil kuzatib boring.";

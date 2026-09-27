/**
 * Certificate types + helpers. Data now lives in Firestore
 * (public_certificates) and is fetched server-side via lib/certificates-data.
 * Images are public URLs on the dedicated Storage bucket.
 */

export interface Certificate {
  id: string;
  /** Student full name, e.g. "Kenjaboyev Diyorbek". */
  name: string;
  subject: string;
  grade: string;
  /** "2025-2026" | "2026-2027" … */
  year: string;
  /** Absolute public image URL. */
  imageUrl: string;
  /** Result date (ISO) when known, else null → "o'quv yili" label. */
  date: string | null;
  sort: number;
  width: number;
  height: number;
}

/** Canonical subject display order (Kimyo first) — used everywhere. */
export const SUBJECT_ORDER = [
  "Kimyo",
  "Biologiya",
  "Matematika",
  "Fizika",
  "Ingliz tili",
  "Ona tili va adabiyot",
  "Tarix",
] as const;

/** Human year label from the "YYYY-YYYY" key. */
export function yearLabel(year: string): string {
  return `${year.replace("-", "–")} o’quv yili`;
}

export function certificateAlt(cert: Certificate): string {
  return `${cert.name} — ${cert.subject} fanidan ${cert.grade} darajali sertifikat`;
}

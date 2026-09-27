/**
 * Flexible parser for the certificate captions posted to the results
 * archive group. The format is emoji-decorated and varies (subject exams,
 * IELTS, CEFR levels), so extraction is best-effort and never throws —
 * missing fields come back as empty strings and the record is still saved.
 */

const CANON: Record<string, string> = {
  "ONA TILI VA ADABIYOT": "Ona tili va adabiyot",
  "ONA TILI": "Ona tili va adabiyot",
  "INGLIZ TILI": "Ingliz tili",
  KIMYO: "Kimyo",
  BIOLOGIYA: "Biologiya",
  MATEMATIKA: "Matematika",
  FIZIKA: "Fizika",
  TARIX: "Tarix",
  GEOGRAFIYA: "Geografiya",
};

export interface ParsedCaption {
  name: string;
  subject: string;
  grade: string;
}

function titleCase(name: string): string {
  return name
    .toLocaleLowerCase("uz")
    .split(/\s+/)
    .map((w) => (w.length > 0 ? w[0].toLocaleUpperCase("uz") + w.slice(1) : w))
    .join(" ")
    .trim();
}

export function parseCaption(caption: string): ParsedCaption {
  const text = (caption ?? "").replace(/\r/g, "");

  // Name: the line introduced by a marker glyph. Different post templates use
  // different markers (▶ subject exams, ✎/✍️ language-proficiency "SUPER
  // NATIJA" posts) — match any of the observed ones. Alternation (not a
  // character class) + the "u" flag: several of these are astral emoji
  // (multi-code-unit in UTF-16), and a character class silently decomposes
  // them into individual surrogate halves — which then also matches
  // unrelated emoji sharing the same leading surrogate (e.g. 🔥), corrupting
  // the match. Alternation matches each marker as a whole grapheme instead.
  let name = "";
  const nameMatch = text.match(/(?:▶|✎|✍️|👤|🖊️)\s*([^\n]+)/u);
  if (nameMatch !== null) {
    name = titleCase(nameMatch[1].replace(/["'•|].*$/, "").trim());
  }

  // Subject: IELTS ⇒ English; otherwise the first canonical subject found
  // (longest keys first so "ona tili va adabiyot" wins over "ona tili").
  let subject = "";
  if (/\bIELTS\b/i.test(text)) {
    subject = "Ingliz tili";
  } else {
    for (const key of Object.keys(CANON).sort((a, b) => b.length - a.length)) {
      if (new RegExp(key.replace(/ /g, "\\s+"), "i").test(text)) {
        subject = CANON[key];
        break;
      }
    }
  }

  // Grade / level: CEFR, Level or Daraja value (A+, B2, C1, 100% …).
  let grade = "";
  const gradeMatch = text.match(
    /(?:CEFR|Level|Daraja)\s*[:：]\s*([A-Za-z]\+?\d?|\d{1,3}\s*%)/i
  );
  if (gradeMatch !== null) {
    grade = gradeMatch[1].replace(/\s+/g, "").toUpperCase();
  }

  return { name, subject, grade };
}

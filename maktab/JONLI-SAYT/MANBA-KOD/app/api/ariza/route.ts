/**
 * Admission application endpoint → Telegram («Ota onalar ro'yxati» bot).
 *
 * Security:
 *  - The bot token lives ONLY in the server env (TELEGRAM_ARIZA_BOT_TOKEN),
 *    never in the client bundle or git.
 *  - Per-IP rate limit (3 / 10 min), honeypot, and strict field validation
 *    (name, region from the allow-list, grade from the allow-list, Uzbek
 *    phone regex) guard against spam and abuse.
 *  - The form posts here; the client never talks to Telegram directly.
 *
 * Without a configured chat id (TELEGRAM_ARIZA_CHAT_ID) the request is still
 * accepted (logged) so the form never appears broken — the message is simply
 * not delivered until the id is set.
 */
import { NextResponse } from "next/server";

import { fsAdd, fsQueryByString, hasCredentials } from "@/lib/gcp-rest";
import {
  ACTIVE_GRADES,
  REGIONS,
} from "@/lib/site";

export const runtime = "nodejs";

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60_000;
const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd !== null && fwd.length > 0) {
    return fwd.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

interface ArizaBody {
  fullName?: unknown;
  region?: unknown;
  grade?: unknown;
  phone?: unknown;
  website?: unknown; // honeypot
}

interface ParsedAriza {
  fullName: string;
  region: string;
  grade: string;
  phone: string;
}

// Uzbek text mixes several visually-similar apostrophe glyphs interchangeably
// (straight ', U+2018/U+2019 curly quotes, U+02BB/U+02BC modifier letters) —
// e.g. "O'ktamov" vs "Oʻktamov" is the same name typed on two keyboards.
// Fold them all to nothing before comparing, or that routine variation slips
// past the duplicate check.
const APOSTROPHE_VARIANTS = /['‘’ʻʼ]/g;

function normalizeName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ").replace(APOSTROPHE_VARIANTS, "");
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

/**
 * Same person re-submitting (identical phone + name) already has a record —
 * return that record's timestamp so the client can tell them, instead of
 * silently creating another lead and re-notifying Telegram. Scoped to
 * phone+name (not phone alone) so siblings sharing a parent's phone can each
 * still register. Best-effort: a lookup failure never blocks a real
 * submission (fail-open on the check itself).
 */
async function findDuplicate(a: ParsedAriza): Promise<string | null> {
  const matches = await fsQueryByString("bot_arizalar", "phone", a.phone, 10);
  const targetName = normalizeName(a.fullName);
  const existing = matches
    .filter((d) => normalizeName(str(d.data.name)) === targetName)
    .sort((x, y) => (str(x.data.created_at) < str(y.data.created_at) ? 1 : -1))[0];
  return existing !== undefined ? str(existing.data.created_at) : null;
}

function parse(body: ArizaBody): ParsedAriza | null {
  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const region = typeof body.region === "string" ? body.region.trim() : "";
  const grade = typeof body.grade === "string" ? body.grade.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";

  if (fullName.length < 3 || fullName.length > 120) {
    return null;
  }
  if (!(REGIONS as readonly string[]).includes(region)) {
    return null;
  }
  if (!(ACTIVE_GRADES as readonly string[]).includes(grade)) {
    return null;
  }
  // Uzbekistan: +998 followed by exactly 9 digits.
  if (!/^\+998\d{9}$/.test(phone)) {
    return null;
  }
  return { fullName, region, grade, phone };
}

async function sendToTelegram(a: ParsedAriza): Promise<void> {
  const token = process.env.TELEGRAM_ARIZA_BOT_TOKEN ?? "";
  const chatId = process.env.TELEGRAM_ARIZA_CHAT_ID ?? "";
  if (token.length === 0 || chatId.length === 0) {
    console.log("[ariza] token/chat_id not set — message skipped, form still OK");
    return;
  }
  const now = new Date().toLocaleString("uz-UZ", {
    timeZone: "Asia/Tashkent",
  });
  const text =
    `🎓 <b>Yangi ariza — Mirzo Ulug'bek xususiy maktabi</b>\n\n` +
    `👤 Ism-familiya: ${a.fullName}\n` +
    `📍 Viloyat: ${a.region}\n` +
    `🎯 Sinf: ${a.grade}\n` +
    `📞 Telefon: ${a.phone}\n` +
    `🕒 Vaqt: ${now}`;

  const res = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Telegram ${res.status}: ${await res.text()}`);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429 }
    );
  }

  let body: ArizaBody;
  try {
    body = (await request.json()) as ArizaBody;
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field.
  if (typeof body.website === "string" && body.website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const parsed = parse(body);
  if (parsed === null) {
    return NextResponse.json(
      { ok: false, error: "invalid" },
      { status: 400 }
    );
  }

  if (hasCredentials()) {
    try {
      const duplicateAt = await findDuplicate(parsed);
      if (duplicateAt !== null) {
        // Same person already applied — don't re-notify Telegram or create a
        // second lead; tell the client when the original was received.
        return NextResponse.json({ ok: true, duplicate: true, createdAt: duplicateAt });
      }
    } catch (error) {
      console.error("[ariza] duplicate check failed:", error);
    }
  }

  try {
    await sendToTelegram(parsed);
  } catch (error) {
    console.error("[ariza] telegram send failed:", error);
    // Still report success to the user; the lead is logged server-side.
  }

  // Additive: persist to a PRIVATE Firestore collection (server-side only, not
  // public_*) so the bot admin panel can list applications. Best-effort — this
  // never changes the response or the existing Telegram notification.
  if (hasCredentials()) {
    try {
      await fsAdd(
        "bot_arizalar",
        {
          name: parsed.fullName,
          phone: parsed.phone,
          grade: parsed.grade,
          region: parsed.region,
          created_at: new Date().toISOString(),
        },
        ["created_at"]
      );
    } catch (error) {
      console.error("[ariza] firestore store failed:", error);
    }
  }

  return NextResponse.json({ ok: true });
}

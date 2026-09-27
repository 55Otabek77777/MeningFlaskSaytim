/**
 * AI chat endpoint for the site assistant.
 *
 * Guards, in order:
 *  1. Per-IP rate limit (10 req/min) — spam / cost protection.
 *  2. Monthly budget gate (lib/ai-usage). Over budget OR no API key ->
 *     warm "contact the manager" reply, no API call. The user NEVER sees a
 *     raw limit/error message.
 *  3. Claude (claude-haiku-4-5) with the school system prompt + recent
 *     conversation context. Spend is recorded after each call.
 *
 * When the assistant defers to a human, the question is saved to
 * public_unanswered_questions for later admin review.
 */
import { NextResponse } from "next/server";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore/lite";

import {
  callClaude,
  CHAT_MODEL,
  hasApiKey,
  type ClaudeMessage,
} from "@/lib/anthropic";
import { isOverBudget, recordUsage } from "@/lib/ai-usage";
import { assertPublicCollection, getDb } from "@/lib/firebase";
import { fsAdd, hasCredentials } from "@/lib/gcp-rest";
import { experienceYears } from "@/lib/site";

export const runtime = "nodejs";

const MAX_TOKENS = 600;
const MAX_MESSAGE_LEN = 1000;
const MAX_HISTORY = 8;

const MANAGER_REPLY =
  "Hozircha ko’p savollarga javob berdim 😊 Aniq ma’lumot uchun " +
  "menejerimiz bilan bog’laning: Telegram @Otabek_Mashrabov yoki " +
  "qo’ng’iroq: +998 97 417 37 77. Ular sizga to’liq yordam beradi!";

const SYSTEM_PROMPT = `Sen "Mirzo Ulug'bek" xususiy maktabining rasmiy onlayn yordamchisisan (Uchko'prik, Farg'ona). Ota-onalar va o'quvchilarga qabul, yo'nalishlar va maktab haqida samimiy, ishonchli yordam berasan.

YOZISH USLUBI (JUDA MUHIM):
- FAQAT o'zbek tilida (lotin), iliq va tabiiy suhbat ohangida yoz — jonli inson kabi.
- ODDIY MATN yoz. Markdown ISHLATMA: yulduzcha (**), diez (#), bullet belgilari (-, •) YO'Q. Qalin/kursiv yozuv yo'q.
- Ro'yxat kerak bo'lsa, oddiy jumla yoki qatorlarga bo'lib yoz (belgisiz). Emoji'ni juda kam va o'rinli ishlat (0-2 ta).
- Qisqa, aniq va foydali bo'l — 2-4 qisqa xatboshi yetarli. Savolga to'g'ridan-to'g'ri javob ber, ortiqcha ma'lumot bilan to'ldirma.
- "Professional" so'zini ishlatma.

MAKTAB MA'LUMOTLARI:
- Nomi: "Mirzo Ulug'bek" xususiy maktabi (ULUGBEK PERFECT EDU NTM), litsenziya № 363657 (2024-yil)
- Asoschi: Jabborov A'zamjon Mashrabovich. Direktor: Mashrabjonov Ulug'bek A'zamjon o'g'li
- Joylashuv: Farg'ona viloyati, Uchko'prik tumani, Nihol MFY, Qayrog'och qishlog'i
- ${experienceYears()}+ yillik tajriba (ikki avlod), 45+ tajribali o'qituvchi, 1560+ sertifikat (2025-2026 o'quv yili)
- O'QUVCHI SONI: aniq son AYTMA. Faqat "mingdan ziyod" / "minglik davriga qadam qo'ydi" kabi ayt.
- Qabul: 2026-yil 1-avgust, soat 07:00 dan (allaqachon boshlangan). Sinflar: 8, 9, 10, 11. 8-9 ariza asosida, 10-11 suhbat/sinov asosida
- Yo'nalishlar: Kimyo-Biologiya (tibbiyot va farmatsevtika), Ingliz tili (IELTS 8.0), Matematika-Fizika, Matematika-Ingliz tili, Ona tili-Adabiyot. 5-7-sinflar hozircha yo'q — 5-sinfdan 7-sinfgacha bo'lgan O'QUVCHILAR (yosh emas, SINF!) uchun yangi bino qurilmoqda, ochilishi 2026-yil sentabrda. Boshlang'ich sinflar mavjud emas
- Yotoqxona: HAMMA o'quvchi uchun majburiy (kuchaytirilgan nazorat)
- Ovqat: maktab oshxonasida issiq ovqatlar
- Transport: poyezd vokzaliga 300 metr; boshqa viloyat o'quvchilari poyezdda qatnaydi
- Ish vaqti: Dushanba-Yakshanba 07:00-21:30 (har kuni); 2 haftada bir marta uyga ruxsat
- Sertifikat: Milliy sertifikat, IELTS (8.0), fan olimpiadalari
- Aloqa: +998 97 417 37 77, Telegram @ulugbek_rm, menejer @Otabek_Mashrabov, sayt mirzoulugbek.app, barcha havolalar mirzolink.com

QOIDALAR:
- TO'LOV/NARX so'ralsa: narx/summa AYTMA. "To'lovlar o'zgarishi mumkin. Batafsil ma'lumot uchun telefon qiling (+998 97 417 37 77) yoki Telegram orqali menejer/adminga yozing (@Otabek_Mashrabov)" deb javob ber.
- Maktabga aloqador bo'lmagan savolga: iltimos bilan maktab mavzusiga qaytishni so'ra
- HECH QACHON ma'lumot to'qib chiqarma. Bilmasang — menejerga yo'naltir.`;

// Per-instance IP rate limiter (best-effort; resets on cold start).
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd !== null && fwd.length > 0) {
    return fwd.split(",")[0].trim();
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * Full log of EVERY question asked to the site assistant (unlike
 * saveUnanswered below, which only keeps pure hand-offs for review). Private
 * collection (service-account only, no client rules needed). sessionId is a
 * random id the browser generates once and stores in localStorage — there is
 * no login system for site visitors, so this is the closest we get to "who".
 */
async function logFullQuestion(
  question: string,
  answer: string,
  deferred: boolean,
  sessionId: string
): Promise<void> {
  if (!hasCredentials()) return;
  try {
    await fsAdd(
      "site_ai_questions",
      {
        question: question.slice(0, 500),
        answer: answer.slice(0, 500),
        deferred,
        session_id: sessionId.slice(0, 100),
        created_at: new Date().toISOString(),
      },
      ["created_at"]
    );
  } catch (error) {
    console.error("[chat] logFullQuestion failed:", error);
  }
}

async function saveUnanswered(question: string): Promise<void> {
  try {
    const db = getDb();
    const ref = collection(
      db,
      assertPublicCollection("public_unanswered_questions")
    );
    await addDoc(ref, {
      question: question.slice(0, 1000),
      answered: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("[chat] saveUnanswered failed:", error);
  }
}

/**
 * True only for a PURE hand-off: a short reply that redirects to the
 * manager without substantive content. This avoids logging questions the
 * assistant actually answered (it often appends contact info to real
 * answers). Such questions are the ones worth admin review.
 */
function isPureHandoff(reply: string): boolean {
  const lower = reply.toLowerCase();
  const mentionsManager =
    lower.includes("@otabek_mashrabov") || lower.includes("menejer");
  return mentionsManager && reply.length < 160;
}

interface ChatBody {
  message?: unknown;
  history?: unknown;
  sessionId?: unknown;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (rateLimited(clientIp(request))) {
    return NextResponse.json({ reply: MANAGER_REPLY, deferred: true });
  }

  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const message =
    typeof body.message === "string" ? body.message.trim() : "";
  const sessionId =
    typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  if (message.length === 0 || message.length > MAX_MESSAGE_LEN) {
    return NextResponse.json({ error: "invalid_message" }, { status: 400 });
  }

  // Budget / key gate — warm human hand-off, never a raw error.
  if (!hasApiKey() || (await isOverBudget())) {
    await logFullQuestion(message, MANAGER_REPLY, true, sessionId);
    return NextResponse.json({ reply: MANAGER_REPLY, deferred: true });
  }

  const history: ClaudeMessage[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (m): m is ClaudeMessage =>
            typeof m === "object" &&
            m !== null &&
            (m as ClaudeMessage).role !== undefined &&
            typeof (m as ClaudeMessage).content === "string"
        )
        .slice(-MAX_HISTORY)
        .map((m) => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: String(m.content).slice(0, MAX_MESSAGE_LEN),
        }))
    : [];

  const result = await callClaude({
    system: SYSTEM_PROMPT,
    messages: [...history, { role: "user", content: message }],
    maxTokens: MAX_TOKENS,
    model: CHAT_MODEL,
  });

  if (result === null) {
    await logFullQuestion(message, MANAGER_REPLY, true, sessionId);
    return NextResponse.json({ reply: MANAGER_REPLY, deferred: true });
  }

  await recordUsage(result.inputTokens, result.outputTokens, CHAT_MODEL);

  const deferred = isPureHandoff(result.text);
  if (deferred) {
    await saveUnanswered(message);
  }
  await logFullQuestion(message, result.text, deferred, sessionId);

  return NextResponse.json({ reply: result.text, deferred });
}

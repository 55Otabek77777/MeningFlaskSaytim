/**
 * AI post-polish for Telegram news cards: rewrites raw channel text into
 * clean 2-3 sentence Uzbek copy via Claude (claude-haiku-4-5).
 *
 * Cost discipline (v8):
 *  - Each post is rewritten at most ONCE, then cached forever in Firestore
 *    (public_news_rewritten/{postId}) — old posts never hit the API again.
 *  - Before any API call the monthly budget is checked (lib/ai-usage).
 *    Over budget or no API key -> return null and the caller keeps the
 *    plain cleaned text. The site never breaks because of this feature.
 */
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore/lite";

import { callClaude, hasApiKey } from "@/lib/anthropic";
import { isOverBudget, recordUsage } from "@/lib/ai-usage";
import { assertPublicCollection, getDb } from "@/lib/firebase";

const CACHE_COLLECTION = "public_news_rewritten";
const MAX_TOKENS = 250;

const SYSTEM =
  "Sen O’zbekiston maktabi saytining kontent muharririsan. Faqat tayyor, " +
  "sayt yangiliklar kartasiga mos o’zbekcha matnni qaytar.";

const PROMPT_PREFIX =
  "Quyidagi Telegram post matnini maktab sayti yangiliklar kartasi uchun " +
  "chiroyli qayta yoz:\n" +
  "1. Buzilgan belgilar (□, kutilmagan simvollar) va ortiqcha stikerlarni olib tashla\n" +
  "2. 1-2 mos emoji qoldirsang mumkin (haddan oshirma)\n" +
  "3. 2-3 jumlali ravon, savodli o’zbekcha xulosa yoz\n" +
  "4. Agar post ovozli xabar haqida bo’lsa: \"🎙 Kanalimizga muhim ovozli " +
  "xabar joylandi — [mavzu]. Tinglash uchun bosing.\" uslubida\n" +
  "5. Agar video/rasm haqida bo’lsa: mos tarzda tasvirla\n" +
  "6. FAQAT tayyor matnni qaytar, boshqa hech narsa qo’shma\n" +
  "7. \"professional\" so’zini ishlatma\n\n" +
  "Post matni:\n";

function docIdFor(postId: string): string {
  // Firestore doc ids can't contain "/"; Telegram ids look like "chan/123".
  return postId.replace(/[/#?[\]]/g, "_");
}

async function readCache(postId: string): Promise<string | null> {
  try {
    const db = getDb();
    const ref = doc(db, assertPublicCollection(CACHE_COLLECTION), docIdFor(postId));
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const text = snap.data().text;
      return typeof text === "string" && text.length > 0 ? text : null;
    }
  } catch (error) {
    console.error("[ai-rewrite] cache read failed:", error);
  }
  return null;
}

async function writeCache(postId: string, text: string): Promise<void> {
  try {
    const db = getDb();
    const ref = doc(db, assertPublicCollection(CACHE_COLLECTION), docIdFor(postId));
    await setDoc(ref, { text: text.slice(0, 2000), createdAt: serverTimestamp() });
  } catch (error) {
    console.error("[ai-rewrite] cache write failed:", error);
  }
}

/** Rewrite a post's text; cached once in Firestore. null -> use plain text. */
export async function rewritePostText(
  postId: string,
  text: string
): Promise<string | null> {
  if (!hasApiKey() || text.trim().length === 0) {
    return null;
  }
  // 1) Cache first — free, and keeps old posts off the API.
  const cached = await readCache(postId);
  if (cached !== null) {
    return cached;
  }
  // 2) Budget gate.
  if (await isOverBudget()) {
    return null;
  }
  // 3) Rewrite, record spend, cache.
  const result = await callClaude({
    system: SYSTEM,
    messages: [{ role: "user", content: PROMPT_PREFIX + text }],
    maxTokens: MAX_TOKENS,
  });
  if (result === null) {
    return null;
  }
  await recordUsage(result.inputTokens, result.outputTokens);
  await writeCache(postId, result.text);
  return result.text;
}

/**
 * Telegram webhook — certificate auto-sync from the results archive group.
 *
 * @mirzorasmiybot is a read-only admin in the archive supergroup. When a
 * certificate is posted there this route:
 *   1. verifies the secret header + that the update is from the archive group;
 *   2. takes the highest-quality image (document original, else the largest
 *      photo) via getFile and downloads the bytes;
 *   3. uploads the ORIGINAL bytes to the certificates bucket (public) — no
 *      re-encode, so quality is preserved and there is no native dependency;
 *   4. parses the caption (name / subject / grade) best-effort, never dropping;
 *   5. writes a public_certificates doc (year 2026-2027, source "telegram"),
 *      deduped by telegram_message_id;
 *   6. FIFO-trims the collection when it exceeds MAX_CERTS.
 *
 * All storage/firestore access is pure REST + JWT (lib/gcp-rest) so it runs
 * reliably on the serverless runtime. Always returns 200 (except a bad secret)
 * so Telegram does not retry-storm.
 */
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { handleForwardedNews, handlePrivateMessage } from "@/lib/bot-handler";
import { parseCaption } from "@/lib/cert-caption";
import {
  certBucket,
  fsAdd,
  fsDelete,
  fsHasInt,
  fsList,
  hasCredentials,
  storageDelete,
  storageUpload,
} from "@/lib/gcp-rest";
import { alertIfUnhealthy, alertSyncFailure } from "@/lib/system-health";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CERTS = 2000;
const COLLECTION = "public_certificates";
const YEAR = "2026-2027";

interface TgPhoto {
  file_id: string;
  width?: number;
  height?: number;
}
interface TgMessage {
  message_id: number;
  date: number;
  chat?: { id?: number; type?: string };
  from?: { id?: number; first_name?: string; username?: string };
  text?: string;
  caption?: string;
  photo?: TgPhoto[];
  document?: { file_id: string; mime_type?: string; file_name?: string };
  forward_origin?: { type?: string; chat?: { id?: number; username?: string } };
  forward_from_chat?: { id?: number; type?: string; username?: string };
  media_group_id?: string;
}

function token(): string {
  return process.env.TELEGRAM_ARIZA_BOT_TOKEN ?? "";
}

async function tgFilePath(fileId: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token()}/getFile?file_id=${encodeURIComponent(fileId)}`
    );
    const data = (await res.json()) as {
      ok: boolean;
      result?: { file_path?: string };
    };
    return data.ok && data.result?.file_path ? data.result.file_path : null;
  } catch {
    return null;
  }
}

async function downloadTgFile(filePath: string): Promise<Buffer | null> {
  try {
    const res = await fetch(
      `https://api.telegram.org/file/bot${token()}/${filePath}`
    );
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

function contentTypeFor(filePath: string): { type: string; ext: string } {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".png")) return { type: "image/png", ext: "png" };
  if (lower.endsWith(".webp")) return { type: "image/webp", ext: "webp" };
  return { type: "image/jpeg", ext: "jpg" };
}

/** FIFO-trim: delete oldest docs (+ Storage objects) over the cap. */
async function trimOldest(): Promise<void> {
  const docs = await fsList(COLLECTION);
  if (docs.length <= MAX_CERTS) return;
  const withTime = docs
    .map((d) => ({
      id: d.id,
      url: typeof d.data.image_url === "string" ? d.data.image_url : "",
      created:
        typeof d.data.created_at === "string" ? Date.parse(d.data.created_at) : 0,
    }))
    .sort((a, b) => a.created - b.created);
  const over = withTime.slice(0, docs.length - MAX_CERTS);
  const bucket = certBucket();
  for (const item of over) {
    const objectPath = item.url.split(`/${bucket}/`)[1];
    // Authenticated delete so the image object is actually removed (not just
    // the Firestore doc), keeping Storage from growing unbounded.
    if (objectPath) await storageDelete(objectPath);
    await fsDelete(COLLECTION, item.id);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  // Fail CLOSED: with no configured secret, or a mismatch, reject before doing
  // any Firestore/Telegram work.
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";
  if (
    secret.length === 0 ||
    request.headers.get("x-telegram-bot-api-secret-token") !== secret
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  if (!hasCredentials()) {
    return NextResponse.json({ ok: true });
  }

  // Config self-check on real traffic — catches a silently-broken env var
  // (e.g. an empty TELEGRAM_ARXIV_GROUP_ID) within minutes instead of a week.
  // Best-effort, rate-limited internally; never blocks processing.
  await alertIfUnhealthy();

  // Tracked outside the try block so the catch handler below knows whether
  // to alert the owner (a failure while a real archive-group post was being
  // processed is worth interrupting them for; other failures are quieter).
  let fromArchive = false;

  try {
    let update: { message?: TgMessage; channel_post?: TgMessage };
    try {
      update = (await request.json()) as typeof update;
    } catch {
      return NextResponse.json({ ok: true });
    }

    const msg = update.message ?? update.channel_post;
    if (msg === undefined) {
      return NextResponse.json({ ok: true });
    }

    const arxivId = process.env.TELEGRAM_ARXIV_GROUP_ID ?? "";
    fromArchive = arxivId.length > 0 && String(msg.chat?.id ?? "") === arxivId;

    // ── Private chat → interactive bot (additive; separate from cert sync) ──
    if (
      !fromArchive &&
      update.message !== undefined &&
      msg.chat?.type === "private"
    ) {
      await handlePrivateMessage(update.message);
      return NextResponse.json({ ok: true });
    }

    // Everything below is for the archive group only.
    if (!fromArchive) {
      return NextResponse.json({ ok: true });
    }

    // ── Classify by IMAGE PRESENCE first, not forward status. ──
    // Previously any forward-from-channel message was unconditionally
    // treated as news BEFORE this point, on the assumption certificates are
    // always posted directly. In practice the owner sometimes posts a
    // polished result announcement to the public channel first and then
    // forwards THAT into the archive group — which has forward_origin set
    // AND a photo. The old order sent it down the news path and it never
    // reached certificate sync at all (root cause of certs going missing,
    // 2026-07-16). A message WITH an image is a certificate regardless of
    // forward status; only a forward with NO image is unambiguous news.
    let fileId: string | null = null;
    let width = 0;
    let height = 0;
    if (
      msg.document !== undefined &&
      (msg.document.mime_type ?? "").startsWith("image/")
    ) {
      fileId = msg.document.file_id;
    } else if (Array.isArray(msg.photo) && msg.photo.length > 0) {
      const largest = msg.photo[msg.photo.length - 1];
      fileId = largest.file_id;
      width = largest.width ?? 0;
      height = largest.height ?? 0;
    }

    if (fileId === null) {
      const isNews =
        msg.forward_origin?.type === "channel" ||
        msg.forward_from_chat?.type === "channel";
      if (isNews) {
        await handleForwardedNews(msg.message_id, msg.text ?? msg.caption ?? "");
        return NextResponse.json({ ok: true, news: true });
      }
      return NextResponse.json({ ok: true });
    }

    // Album (media group) posts: Telegram delivers each photo as its own
    // message sharing one media_group_id, but attaches the caption to only
    // ONE of them — the rest arrive with no caption at all. Without this
    // check every photo in the album would pass dedup (distinct
    // message_ids) and create a separate cert doc, most with a blank
    // name/subject/grade. Skip the captionless ones; only the message
    // carrying the real caption gets processed.
    if (msg.media_group_id !== undefined && (msg.caption ?? "").trim().length === 0) {
      return NextResponse.json({ ok: true, skipped: "media_group_no_caption" });
    }

    // ===== Certificate sync =====
    // Dedupe.
    if (await fsHasInt(COLLECTION, "telegram_message_id", msg.message_id)) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const filePath = await tgFilePath(fileId);
    if (filePath === null) return NextResponse.json({ ok: true });
    const bytes = await downloadTgFile(filePath);
    if (bytes === null) return NextResponse.json({ ok: true });

    const { type, ext } = contentTypeFor(filePath);
    const imageUrl = await storageUpload(
      `certificates/tg-${msg.message_id}.${ext}`,
      bytes,
      type
    );

    const parsed = parseCaption(msg.caption ?? "");

    await fsAdd(
      COLLECTION,
      {
        name: parsed.name,
        subject: parsed.subject,
        grade: parsed.grade,
        year: YEAR,
        image_url: imageUrl,
        date: new Date(msg.date * 1000).toISOString().slice(0, 10),
        source: "telegram",
        telegram_message_id: msg.message_id,
        sort: -msg.date,
        width,
        height,
        created_at: new Date().toISOString(),
      },
      ["created_at"]
    );

    await trimOldest();

    // Surface the new certificate right away (ISR on-demand revalidation).
    revalidatePath("/");
    revalidatePath("/yutuqlar");
    revalidatePath("/ekran");

    return NextResponse.json({ ok: true, added: true });
  } catch (error) {
    console.error("[telegram-webhook] failed:", error);
    if (fromArchive) {
      await alertSyncFailure("sertifikat sinxronizatsiyasi", error);
    }
    return NextResponse.json({ ok: true });
  }
}

/**
 * Fires when a visitor taps the site's "Qo'ng'iroq" (call) button. There is
 * no login system for site visitors, so this is an aggregate click counter,
 * not per-person attribution — surfaced in the admin panel. Fire-and-forget
 * from the client; never blocks the tel: navigation. Per-IP rate limited the
 * same way /api/visit is, so it can't be scripted into unbounded writes.
 */
import { NextResponse } from "next/server";

import { fsIncrement, hasCredentials } from "@/lib/gcp-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOC = "bot_meta/call_clicks";
const FIELD = "count";

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 4;
const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd !== null && fwd.length > 0) return fwd.split(",")[0].trim();
  return "unknown";
}

function withinLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return false;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!hasCredentials() || !withinLimit(clientIp(request))) {
    return NextResponse.json({ ok: true });
  }
  try {
    await fsIncrement(DOC, FIELD, 1);
  } catch {
    /* best-effort analytics only */
  }
  return NextResponse.json({ ok: true });
}

/**
 * Site visit counter. POST increments the total and returns the new total;
 * GET just reads it. The count lives in Firestore (public_meta/visits) and is
 * incremented atomically server-side via a service-account JWT (no client
 * write / rules exposure). POST is rate-limited per IP so it cannot be scripted
 * into unbounded (billed) Firestore writes — over the limit it silently returns
 * the current total without incrementing.
 */
import { NextResponse } from "next/server";

import { fsIncrement, fsReadInt, hasCredentials } from "@/lib/gcp-rest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DOC = "public_meta/visits";
const FIELD = "count";

/** Per-day counter doc path, e.g. bot_meta_daily/2026-07-16 — private (only
 *  the admin panel reads it), separate from the public cumulative total. */
function dailyDoc(): string {
  return `bot_meta_daily/${new Date().toISOString().slice(0, 10)}`;
}

// Best-effort per-IP throttle (per warm serverless instance): a real visitor
// increments once per session; anything past a few hits a minute is abuse.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 4;
const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd !== null && fwd.length > 0) return fwd.split(",")[0]!.trim();
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
  if (hits.size > 5000) hits.clear(); // guard against unbounded map growth
  return true;
}

export async function GET(): Promise<NextResponse> {
  if (!hasCredentials()) return NextResponse.json({ total: 0 });
  try {
    return NextResponse.json({ total: await fsReadInt(DOC, FIELD) });
  } catch {
    return NextResponse.json({ total: 0 });
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!hasCredentials()) return NextResponse.json({ total: 0 });
  try {
    if (!withinLimit(clientIp(request))) {
      // Over the limit — do not write, just return the current total.
      return NextResponse.json({ total: await fsReadInt(DOC, FIELD) });
    }
    const total = await fsIncrement(DOC, FIELD, 1);
    fsIncrement(dailyDoc(), "count", 1).catch(() => undefined);
    return NextResponse.json({ total });
  } catch {
    return NextResponse.json({ total: 0 });
  }
}

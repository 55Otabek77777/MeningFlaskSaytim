/**
 * JSON feed of the latest posts from the school's public Telegram channel.
 * Cached for an hour (revalidate) — see lib/telegram-news.ts for parsing.
 */
import { NextResponse } from "next/server";

import { fetchTelegramPosts, TELEGRAM_CHANNEL_URL } from "@/lib/telegram-news";

export const revalidate = 3600;

export async function GET(): Promise<NextResponse> {
  const posts = await fetchTelegramPosts(12);
  return NextResponse.json({
    ok: posts.length > 0,
    channel: TELEGRAM_CHANNEL_URL,
    count: posts.length,
    posts,
  });
}

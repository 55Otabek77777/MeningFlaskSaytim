/**
 * Server-side reader for the public Telegram channel preview page
 * (https://t.me/s/ulugbek_rm). No API key needed. Results are cached
 * for an hour via Next's fetch revalidation; any failure returns []
 * so the site never breaks because of Telegram.
 */
import * as cheerio from "cheerio";

import { rewritePostText } from "@/lib/ai-rewrite";

export const TELEGRAM_CHANNEL = "ulugbek_rm";
export const TELEGRAM_CHANNEL_URL = `https://t.me/${TELEGRAM_CHANNEL}`;

export interface TelegramPost {
  id: string;
  text: string;
  photo: string | null;
  /** ISO 8601 date string. */
  date: string | null;
  link: string;
}

export async function fetchTelegramPosts(limit = 12): Promise<TelegramPost[]> {
  try {
    const res = await fetch(`https://t.me/s/${TELEGRAM_CHANNEL}`, {
      next: { revalidate: 3600 },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) {
      console.error(`[telegram-news] t.me status ${res.status}`);
      return [];
    }
    const $ = cheerio.load(await res.text());
    const posts: TelegramPost[] = [];

    $(".tgme_widget_message_wrap").each((_, el) => {
      const $el = $(el);
      const text = $el.find(".tgme_widget_message_text").first().text().trim();
      // Photo posts and video posts keep their preview in different nodes.
      const style =
        $el.find(".tgme_widget_message_photo_wrap").first().attr("style") ??
        $el.find(".tgme_widget_message_video_thumb").first().attr("style") ??
        "";
      const photoMatch = style.match(/background-image:url\('([^']+)'\)/);
      const link =
        $el.find("a.tgme_widget_message_date").first().attr("href") ?? "";
      const date = $el.find("time").first().attr("datetime") ?? null;
      const post = $el.find(".tgme_widget_message").first();
      const id = post.attr("data-post") ?? link;

      if ((text.length > 0 || photoMatch !== null) && id) {
        posts.push({
          id,
          text,
          photo: photoMatch !== null ? photoMatch[1] : null,
          date,
          link: link.length > 0 ? link : TELEGRAM_CHANNEL_URL,
        });
      }
    });

    // t.me/s lists oldest→newest; newest first for the site.
    const latest = posts.reverse().slice(0, limit);

    // AI polish (claude-haiku-4-5): rewrite raw channel text into clean
    // card copy. Cached per post; silently skipped without an API key.
    const polished = await Promise.all(
      latest.map(async (post) => {
        if (post.text.length === 0) {
          return post;
        }
        const aiText = await rewritePostText(post.id, post.text);
        return aiText !== null ? { ...post, text: aiText } : post;
      })
    );
    return polished;
  } catch (error) {
    console.error("[telegram-news] fetch failed:", error);
    return [];
  }
}

/** Short title from the first line of a post (for cards). */
export function telegramPostTitle(post: TelegramPost, maxLen = 80): string {
  const firstLine =
    post.text
      .split("\n")
      .map((line) => line.trim())
      .find((line) => line.length > 0) ?? "Yangilik";
  // Slice by code points so emoji surrogate pairs are never split.
  const chars = Array.from(firstLine);
  if (chars.length <= maxLen) {
    return firstLine;
  }
  return `${chars.slice(0, maxLen - 1).join("").trimEnd()}…`;
}

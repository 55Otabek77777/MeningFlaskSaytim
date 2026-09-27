/**
 * Server-side helpers for reading news from the `public_news` collection.
 * Documents are written exclusively by the TELEGRAM_SYNC service.
 */
import {
  collection,
  getDocs,
  limit as limitTo,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore/lite";

import { assertPublicCollection, getDb } from "@/lib/firebase";

export type NewsMediaType = "none" | "photo" | "video";

export interface NewsItem {
  id: string;
  title: string;
  body: string;
  mediaType: NewsMediaType;
  mediaUrl: string | null;
  thumbUrl: string | null;
  telegramMessageId: number | null;
  /** ISO 8601 string (serializable for RSC). */
  publishedAt: string;
  slug: string;
}

export const NEWS_PER_PAGE = 12;

/** How many docs to pull at most when listing (pagination is in-memory). */
const MAX_FETCH = 240;

interface RawNewsDoc {
  title?: unknown;
  body?: unknown;
  mediaType?: unknown;
  mediaUrl?: unknown;
  thumbUrl?: unknown;
  telegramMessageId?: unknown;
  publishedAt?: unknown;
  slug?: unknown;
  hidden?: unknown;
}

function toNewsItem(id: string, raw: RawNewsDoc): NewsItem | null {
  if (raw.hidden === true) {
    return null;
  }
  const title = typeof raw.title === "string" ? raw.title : "";
  const slug = typeof raw.slug === "string" ? raw.slug : "";
  if (title.length === 0 || slug.length === 0) {
    return null;
  }
  const mediaType: NewsMediaType =
    raw.mediaType === "photo" || raw.mediaType === "video"
      ? raw.mediaType
      : "none";
  let publishedAt = new Date(0).toISOString();
  if (raw.publishedAt instanceof Timestamp) {
    publishedAt = raw.publishedAt.toDate().toISOString();
  } else if (typeof raw.publishedAt === "string") {
    publishedAt = raw.publishedAt;
  }
  return {
    id,
    title,
    body: typeof raw.body === "string" ? raw.body : "",
    mediaType,
    mediaUrl: typeof raw.mediaUrl === "string" ? raw.mediaUrl : null,
    thumbUrl: typeof raw.thumbUrl === "string" ? raw.thumbUrl : null,
    telegramMessageId:
      typeof raw.telegramMessageId === "number" ? raw.telegramMessageId : null,
    publishedAt,
    slug,
  };
}

/** Fetch visible news, newest first. Returns [] on any failure. */
export async function fetchAllNews(): Promise<NewsItem[]> {
  try {
    const db = getDb();
    const ref = collection(db, assertPublicCollection("public_news"));
    const snap = await getDocs(
      query(ref, orderBy("publishedAt", "desc"), limitTo(MAX_FETCH))
    );
    const items: NewsItem[] = [];
    for (const doc of snap.docs) {
      const item = toNewsItem(doc.id, doc.data() as RawNewsDoc);
      if (item !== null) {
        items.push(item);
      }
    }
    return items;
  } catch (error) {
    console.error("fetchAllNews failed:", error);
    return [];
  }
}

export async function fetchLatestNews(count: number): Promise<NewsItem[]> {
  const all = await fetchAllNews();
  return all.slice(0, count);
}

export interface NewsPage {
  items: NewsItem[];
  page: number;
  totalPages: number;
}

export async function fetchNewsPage(page: number): Promise<NewsPage> {
  const all = await fetchAllNews();
  const totalPages = Math.max(1, Math.ceil(all.length / NEWS_PER_PAGE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * NEWS_PER_PAGE;
  return {
    items: all.slice(start, start + NEWS_PER_PAGE),
    page: safePage,
    totalPages,
  };
}

export async function fetchNewsBySlug(slug: string): Promise<NewsItem | null> {
  const all = await fetchAllNews();
  return all.find((item) => item.slug === slug) ?? null;
}

export function formatNewsDate(iso: string): string {
  const months = [
    "yanvar",
    "fevral",
    "mart",
    "aprel",
    "may",
    "iyun",
    "iyul",
    "avgust",
    "sentabr",
    "oktabr",
    "noyabr",
    "dekabr",
  ];
  const d = new Date(iso);
  return `${d.getDate()}-${months[d.getMonth()]}, ${d.getFullYear()}`;
}

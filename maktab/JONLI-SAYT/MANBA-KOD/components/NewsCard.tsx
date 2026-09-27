import Image from "next/image";
import Link from "next/link";

import { formatNewsDate, type NewsItem } from "@/lib/news";

export default function NewsCard({ item }: { item: NewsItem }) {
  const preview =
    item.body.length > 140 ? `${item.body.slice(0, 140).trimEnd()}…` : item.body;
  const imageSrc = item.thumbUrl ?? (item.mediaType === "photo" ? item.mediaUrl : null);

  return (
    <Link
      href={`/yangiliklar/${item.slug}`}
      className="flex flex-col overflow-hidden rounded-2xl border border-mist bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {imageSrc !== null ? (
        <div className="relative aspect-[16/9] w-full bg-mist">
          <Image
            src={imageSrc}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          {item.mediaType === "video" ? (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <time className="text-xs font-medium text-ink/50" dateTime={item.publishedAt}>
          {formatNewsDate(item.publishedAt)}
        </time>
        <h3 className="mt-2 line-clamp-2 text-base font-bold text-ink">{item.title}</h3>
        {preview.length > 0 ? (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/70">{preview}</p>
        ) : null}
        <span className="mt-auto pt-3 text-sm font-semibold text-brand">O’qish →</span>
      </div>
    </Link>
  );
}

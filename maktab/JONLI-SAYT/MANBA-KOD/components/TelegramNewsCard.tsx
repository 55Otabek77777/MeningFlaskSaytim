import Image from "next/image";

import { formatNewsDate } from "@/lib/news";
import { telegramPostTitle, type TelegramPost } from "@/lib/telegram-news";

/** Compact horizontal row (Oxford-style side list next to the big card). */
export function TelegramNewsRow({ post }: { post: TelegramPost }) {
  const title = telegramPostTitle(post, 70);
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-w-0 items-center gap-4 rounded-xl border border-mist bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      {post.photo !== null ? (
        <span className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-mist">
          <Image
            src={post.photo}
            alt={title}
            fill
            className="object-cover"
            sizes="96px"
          />
        </span>
      ) : (
        <span className="flex h-16 w-24 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M21.9 4.4L2.9 11.7c-1 .4-1 1.8.1 2.1l4.6 1.4 1.8 5.6c.3 1 1.6 1.2 2.2.4l2.6-3.1 4.8 3.5c.8.6 2 .2 2.2-.8l3-14.6c.2-1.1-.8-2-1.9-1.6z" />
          </svg>
        </span>
      )}
      <span className="min-w-0">
        <span className="line-clamp-2 break-words text-sm font-bold text-ink group-hover:text-brand">
          {title}
        </span>
        {post.date !== null ? (
          <time className="mt-1 block text-xs text-muted" dateTime={post.date}>
            {formatNewsDate(post.date)}
          </time>
        ) : null}
      </span>
    </a>
  );
}

export default function TelegramNewsCard({ post }: { post: TelegramPost }) {
  const title = telegramPostTitle(post);
  const body = post.text.length > title.length ? post.text : "";

  return (
    <article className="shadow-card flex min-w-0 flex-col overflow-hidden rounded-2xl border border-mist bg-white">
      {post.photo !== null ? (
        <div className="relative aspect-[16/9] w-full bg-mist">
          <Image
            src={post.photo}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        {post.date !== null ? (
          <time className="text-xs font-medium text-muted" dateTime={post.date}>
            {formatNewsDate(post.date)}
          </time>
        ) : null}
        <h3 className="mt-2 line-clamp-2 break-words text-base font-bold text-ink">
          {title}
        </h3>
        {body.length > 0 ? (
          <p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed text-ink/70">
            {body}
          </p>
        ) : null}
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto pt-3 text-sm font-semibold text-brand hover:underline"
        >
          Telegramda o’qish →
        </a>
      </div>
    </article>
  );
}

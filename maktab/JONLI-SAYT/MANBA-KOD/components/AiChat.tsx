"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const GREETING =
  "Assalomu alaykum! 👋 Men Mirzo Ulug’bek maktabining yordamchisiman. " +
  "Qabul, yo’nalishlar, narxlar yoki maktab haqida savolingiz bo’lsa — " +
  "bemalol so’rang!";

const MIN_TEXTAREA = 48;
const MAX_TEXTAREA = 132;
const SESSION_KEY = "site_ai_session";

/**
 * A random id the browser keeps in localStorage so the admin panel can group
 * "what questions came from the same visitor" — there is no login system for
 * site visitors, so this is the closest available signal to "who".
 */
function sessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(SESSION_KEY);
  if (id === null) {
    id = crypto.randomUUID();
    window.localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Removes any stray markdown the model may emit so replies always render
 * as clean, readable plain text (no **bold**, #headers or - bullets).
 */
function cleanReply(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/(^|[^*])\*(?!\*)([^*]+?)\*/g, "$1$2")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function AiChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (open && scrollRef.current !== null) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  useEffect(() => {
    if (open) {
      textareaRef.current?.focus();
    }
  }, [open]);

  // Escape-to-close — on desktop the backdrop click-catcher is hidden
  // (md:hidden), so without this the small X button was the only way out.
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  function adjustHeight() {
    const ta = textareaRef.current;
    if (ta === null) {
      return;
    }
    ta.style.height = `${MIN_TEXTAREA}px`;
    ta.style.height = `${Math.min(Math.max(ta.scrollHeight, MIN_TEXTAREA), MAX_TEXTAREA)}px`;
  }

  async function send() {
    const text = input.trim();
    if (text.length === 0 || sending) {
      return;
    }
    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];
    setMessages(nextMessages);
    setInput("");
    if (textareaRef.current !== null) {
      textareaRef.current.style.height = `${MIN_TEXTAREA}px`;
    }
    setSending(true);
    try {
      const history = nextMessages
        .slice(1) // drop the static greeting
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history, sessionId: sessionId() }),
      });
      const data = (await res.json()) as { reply?: string };
      const reply =
        typeof data.reply === "string" && data.reply.length > 0
          ? cleanReply(data.reply)
          : "Kechirasiz, hozir javob bera olmadim. Iltimos, menejerimizga yozing: @Otabek_Mashrabov";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Aloqa uzildi. Iltimos, menejerimizga yozing: @Otabek_Mashrabov yoki +998 97 417 37 77",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* Floating launcher — school logo, above the mobile sticky bar. */}
      {open ? null : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Yordamchi bilan suhbat"
          className="ai-launcher fixed bottom-20 right-4 z-[70] flex h-14 w-14 items-center justify-center rounded-full border-2 border-accent bg-white shadow-xl md:bottom-6"
        >
          <Image src="/logo.png" alt="" width={34} height={34} aria-hidden />
        </button>
      )}

      {open ? (
        <div
          className="fixed inset-0 z-[80] flex flex-col justify-end bg-black/30 backdrop-blur-sm md:inset-auto md:bottom-6 md:right-6 md:block md:h-[600px] md:w-[400px] md:bg-transparent md:backdrop-blur-none"
          role="dialog"
          aria-modal="true"
          aria-label="Mirzo Ulug’bek yordamchisi"
        >
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="flex-1 md:hidden"
          />
          <div className="ai-window flex h-[88vh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl md:h-full md:rounded-3xl md:border md:border-mist dark:bg-card">
            {/* Header */}
            <div className="flex items-center gap-3 bg-brand px-4 py-3.5 text-white">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white">
                <Image src="/logo.png" alt="" width={24} height={24} aria-hidden />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-brand bg-green-400" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold leading-tight">
                  Mirzo Ulug’bek yordamchisi
                </p>
                <p className="text-[11px] text-white/70">Odatda darhol javob beradi</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Yopish"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/10"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="5" y1="5" x2="19" y2="19" />
                  <line x1="19" y1="5" x2="5" y2="19" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3.5 overflow-y-auto bg-mist px-4 py-4"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`ai-msg flex ${m.role === "user" ? "justify-end" : "gap-2"}`}
                >
                  {m.role === "assistant" ? (
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-[#1c2a4d]">
                      <Image src="/logo.png" alt="" width={18} height={18} aria-hidden />
                    </span>
                  ) : null}
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                      m.role === "user"
                        ? "rounded-br-md bg-accent text-white"
                        : "rounded-bl-md bg-white text-ink dark:bg-[#1c2a4d] dark:text-white"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {sending ? (
                <div className="ai-msg flex gap-2">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-[#1c2a4d]">
                    <Image src="/logo.png" alt="" width={18} height={18} aria-hidden />
                  </span>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm dark:bg-[#1c2a4d]">
                    <span className="ai-dot" />
                    <span className="ai-dot" style={{ animationDelay: "0.15s" }} />
                    <span className="ai-dot" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Input — auto-resizing pill with a corner-up / spinner button. */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2 border-t border-mist bg-white px-3 py-3 dark:bg-card"
            >
              <div className="relative flex-1">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    adjustHeight();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  maxLength={1000}
                  placeholder="Savolingizni yozing…"
                  style={{ height: MIN_TEXTAREA }}
                  className="w-full resize-none rounded-2xl border border-mist bg-mist py-3.5 pl-4 pr-12 text-sm leading-[1.35] text-ink outline-none transition-colors focus:border-brand dark:text-white"
                />
                <button
                  type="submit"
                  disabled={sending || input.trim().length === 0}
                  aria-label="Yuborish"
                  className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-white transition-all hover:scale-105 disabled:scale-100 disabled:opacity-40"
                >
                  {sending ? (
                    <span className="h-3.5 w-3.5 rounded-sm bg-white" style={{ animation: "ai-spin 1.1s linear infinite" }} />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 15l6-6 6 6" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

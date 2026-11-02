"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; text: string };

const suggestions = ["Какие курсы подойдут новичку?", "Сколько стоит обучение?", "Есть ли онлайн-формат?"];

const welcome: Message = {
  role: "assistant",
  text: "Здравствуйте! Я помогу выбрать курс и отвечу на вопросы об обучении.",
};

// Отправляет историю на /api/chat и отдаёт ответ по мере поступления текста
async function askAssistant(history: Message[], onText: (text: string) => void): Promise<void> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: history }),
  });
  if (!response.ok || !response.body) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "Не удалось получить ответ");
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let text = "";
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onText(text);
  }
  if (!text.trim()) throw new Error("Ассистент не дал ответа. Попробуйте переформулировать вопрос");
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([welcome]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  async function send(text: string) {
    const question = text.trim();
    if (!question || loading) return;
    // приветствие не уходит в модель: история для Gemini должна начинаться с вопроса пользователя
    const history = [...messages.slice(1), { role: "user" as const, text: question }];
    setInput("");
    setMessages((m) => [...m, { role: "user", text: question }, { role: "assistant", text: "" }]);
    setLoading(true);
    const setAnswer = (answer: string) =>
      setMessages((m) => [...m.slice(0, -1), { role: "assistant", text: answer }]);
    try {
      await askAssistant(history, setAnswer);
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : "Не удалось получить ответ. Попробуйте ещё раз через минуту");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="AI-ассистент"
          className="fixed inset-x-3 bottom-24 z-50 flex max-h-[min(36rem,calc(100dvh-8rem))] flex-col overflow-hidden rounded-panel border border-line bg-graphite sm:inset-x-auto sm:right-6 sm:w-[24rem]"
        >
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <p className="font-display text-base">Ассистент Kodium</p>
              <p className="text-xs text-mist">Отвечает на вопросы о курсах</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Закрыть чат"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-control text-mist hover:text-ivory"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4" aria-live="polite">
            {messages.map((m, i) => m.text && (
              <p
                key={i}
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user" ? "ml-auto bg-gold text-obsidian" : "bg-slate text-ivory"
                }`}
              >
                {m.text}
              </p>
            ))}
            {loading && !messages.at(-1)?.text && <p className="w-fit rounded-xl bg-slate px-4 py-3 text-sm text-mist">Печатает…</p>}
            {messages.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="cursor-pointer rounded-control border border-line px-3 py-2 text-xs text-mist transition-colors hover:border-gold hover:text-gold"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-line p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Напишите вопрос"
              aria-label="Ваш вопрос"
              className="h-11 min-w-0 flex-1 rounded-control border border-line bg-obsidian px-4 text-sm placeholder:text-mist/70 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="h-11 cursor-pointer rounded-control bg-gold px-5 text-sm font-medium text-obsidian transition-colors hover:bg-ivory disabled:pointer-events-none disabled:opacity-50"
            >
              Отправить
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Закрыть AI-ассистента" : "Открыть AI-ассистента"}
        aria-expanded={open}
        className="fixed bottom-6 right-4 z-50 flex h-14 cursor-pointer items-center gap-2 rounded-control bg-gold px-6 font-medium text-obsidian transition-colors hover:bg-ivory sm:right-6"
      >
        {open ? "Закрыть" : "Спросить AI"}
      </button>
    </>
  );
}

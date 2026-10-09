import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { UtensilsCrossed, Send, X } from "lucide-react";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = ["What's popular today?", "What can I get for R100?", "Do you deliver?", "Recommend a family meal"];

export function AiChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([
    { role: "assistant", content: "Molo! I'm **Taco AI**. Ask me about the menu, prices, hours or what to order." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);
  useEffect(() => { if (open && !busy) inputRef.current?.focus(); }, [open, busy]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: t.slice(0, 1000) }];
    setMsgs([...next, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      if (!res.ok || !res.body) {
        const err = await res.text();
        throw new Error(err || "The assistant is unavailable right now.");
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMsgs([...next, { role: "assistant", content: acc }]);
      }
      if (!acc) setMsgs([...next, { role: "assistant", content: "Sorry, I couldn't answer that. Please try again." }]);
    } catch (e) {
      setMsgs([...next, { role: "assistant", content: `⚠️ ${(e as Error).message}` }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed right-5 bottom-5 z-50 inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background shadow-warm hover:bg-foreground/90">
          <span className="grid size-7 place-items-center rounded-full bg-accent text-accent-foreground"><UtensilsCrossed className="size-4" /></span>
          Ask Taco AI
        </button>
      )}
      {open && (
        <div className="fixed right-4 bottom-4 z-50 flex h-[min(600px,85vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border bg-card shadow-warm">
          <div className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-accent text-accent-foreground"><UtensilsCrossed className="size-4" /></span>
              <div className="leading-tight">
                <p className="font-display font-semibold">Taco AI</p>
                <p className="text-xs opacity-80">Menu help · AI may make mistakes</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat"><X className="size-5" /></button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {msgs.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
                {m.role === "user" ? (
                  <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">{m.content}</div>
                ) : m.content ? (
                  <div className="prose prose-sm max-w-none text-sm text-foreground [&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="flex gap-1 py-2"><Dot /><Dot d="150ms" /><Dot d="300ms" /></div>
                )}
              </div>
            ))}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {STARTERS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full bg-secondary px-3 py-1.5 text-xs text-secondary-foreground hover:bg-secondary/70">{s}</button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex items-end gap-2 border-t p-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
              rows={1}
              maxLength={1000}
              placeholder="Ask about the menu…"
              className="max-h-28 flex-1 resize-none rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <button disabled={busy || !input.trim()} className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground disabled:opacity-50" aria-label="Send">
              <Send className="size-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Dot({ d = "0ms" }: { d?: string }) {
  return <span className="size-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: d }} />;
}

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Send, X } from "lucide-react";

type Msg = { role: "user" | "assistant"; text: string };

const GREETING =
  "Hi! I'm Aivora's jewellery assistant ✨ Ask me about our necklaces, earrings, bangles, prices or availability.";

function newSessionId() {
  return `aivora-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: GREETING }]);
  const sessionId = useRef<string>(newSessionId());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);
    setSending(true);
    try {
      const res = await fetch("/api/public/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: sessionId.current }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply ?? data.error ?? "Something went wrong." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "I couldn't reach the assistant. Please try again." },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[min(92vw,22rem)] h-[28rem] flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl"
          >
            <div
              className="flex items-center justify-between px-4 py-3 text-primary-foreground"
              style={{ background: "var(--gradient-gold)" }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium text-sm">Aivora Assistant</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat" className="opacity-80 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
                    typing…
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-border/60 p-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                placeholder="Ask about our jewellery…"
                aria-label="Message"
                className="flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={() => void send()}
                disabled={sending || !input.trim()}
                aria-label="Send message"
                className="w-9 h-9 rounded-full flex items-center justify-center text-primary-foreground disabled:opacity-40"
                style={{ background: "var(--gradient-gold)" }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat with Aivora Assistant"
        className="fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center text-primary-foreground shadow-2xl hover:scale-110 transition border border-border/40 bg-card"
      >
        <Sparkles className="w-6 h-6 text-accent" />
      </button>
    </>
  );
}
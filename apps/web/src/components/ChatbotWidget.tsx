"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getChatHistory, sendChat, type ChatMessage } from "@/lib/assistant";

export default function ChatbotWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && user) getChatHistory().then(setMsgs).catch(() => setMsgs([]));
  }, [open, user]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  // Only logged-in users get the assistant.
  if (!user) return null;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const m = text.trim();
    if (!m) return;
    setText(""); setBusy(true);
    setMsgs((p) => [...p, { id: Date.now(), role: "user", text: m, created_at: "" }]);
    try {
      const { reply } = await sendChat(m);
      setMsgs((p) => [...p, { id: Date.now() + 1, role: "bot", text: reply, created_at: "" }]);
    } catch {
      setMsgs((p) => [...p, { id: Date.now() + 1, role: "bot", text: "Sorry, something went wrong.", created_at: "" }]);
    } finally { setBusy(false); }
  }

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} aria-label="Open Nalanda Assistant"
          className="fixed bottom-20 right-4 z-40 rounded-full bg-brand-orange px-4 py-3 text-white shadow-lg hover:opacity-90 md:bottom-6">
          💬 Ask Nalanda
        </button>
      )}
      {open && (
        <div className="fixed bottom-20 right-4 z-50 flex h-[28rem] w-80 max-w-[90vw] flex-col rounded-xl border border-gray-200 bg-white shadow-2xl md:bottom-6">
          <div className="flex items-center justify-between rounded-t-xl bg-brand-navy px-4 py-3 text-white">
            <span className="font-semibold">Nalanda Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {msgs.length === 0 && <p className="text-sm text-gray-400">Hi! Ask me about courses, live classes, certificates, events, or guidance.</p>}
            {msgs.map((m) => (
              <div key={m.id} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-brand-blue text-white" : "bg-gray-100 text-gray-700"}`}>
                {m.text}
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-gray-100 p-2">
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" className="flex-1 rounded-md border border-gray-200 px-3 py-2 text-sm outline-none" />
            <button disabled={busy} className="rounded-md bg-brand-orange px-3 py-2 text-sm font-medium text-white disabled:opacity-60">Send</button>
          </form>
        </div>
      )}
    </>
  );
}

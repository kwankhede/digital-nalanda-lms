"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getChatHistory, sendChat, type ChatMessage } from "@/lib/assistant";

export default function ChatbotPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!loading && !user) router.replace("/login"); }, [loading, user, router]);
  useEffect(() => { if (user) getChatHistory().then(setMsgs).catch(() => setMsgs([])); }, [user]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  if (loading || !user) return <div className="mx-auto max-w-2xl px-4 py-16 text-gray-500">Loading…</div>;

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const m = text.trim(); if (!m) return;
    setText("");
    setMsgs((p) => [...p, { id: Date.now(), role: "user", text: m, created_at: "" }]);
    const { reply } = await sendChat(m);
    setMsgs((p) => [...p, { id: Date.now() + 1, role: "bot", text: reply, created_at: "" }]);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-extrabold text-brand-navy">Nalanda Assistant</h1>
      <div className="mt-4 min-h-[24rem] space-y-2 rounded-xl border border-gray-100 p-4">
        {msgs.map((m) => (
          <div key={m.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === "user" ? "ml-auto bg-brand-blue text-white" : "bg-gray-100 text-gray-700"}`}>{m.text}</div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Ask about courses, classes, certificates…" className="flex-1 rounded-md border border-gray-200 px-3 py-2 outline-none" />
        <button className="rounded-md bg-brand-orange px-5 py-2 font-semibold text-white">Send</button>
      </form>
    </div>
  );
}

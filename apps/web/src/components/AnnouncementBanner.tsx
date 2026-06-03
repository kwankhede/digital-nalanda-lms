"use client";

import { useEffect, useState } from "react";
import { getActiveAnnouncements, type Announcement } from "@/lib/notifications";

export default function AnnouncementBanner() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<number[]>([]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("dn_access") || undefined : undefined;
    getActiveAnnouncements(token).then(setItems).catch(() => setItems([]));
    try { setDismissed(JSON.parse(localStorage.getItem("dn_dismissed_ann") || "[]")); } catch {}
  }, []);

  const visible = items.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;
  const a = visible[0];

  function dismiss() {
    const next = [...dismissed, a.id];
    setDismissed(next);
    localStorage.setItem("dn_dismissed_ann", JSON.stringify(next));
  }

  return (
    <div className="bg-brand-navy px-4 py-2 text-center text-sm text-white">
      <span className="font-semibold">{a.title}</span>
      {a.content && <span className="ml-2 text-white/80">{a.content}</span>}
      <button onClick={dismiss} aria-label="Dismiss" className="ml-3 text-white/60 hover:text-white">✕</button>
    </div>
  );
}

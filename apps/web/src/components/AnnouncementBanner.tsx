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
    <div className="relative bg-brand-navy px-4 py-2 text-sm text-white">
      <div className="mx-auto max-w-6xl pr-8 text-left sm:pr-10 sm:text-center">
        <span className="font-semibold">{a.title}</span>
        {a.content && <span className="ml-0 block text-white/80 sm:ml-2 sm:inline">{a.content}</span>}
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="tap-target absolute right-1 top-1/2 flex -translate-y-1/2 items-center justify-center text-white/60 hover:text-white"
      >
        ✕
      </button>
    </div>
  );
}

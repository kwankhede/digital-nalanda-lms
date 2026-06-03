"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getNotifications, markAllRead, markRead, type Notification } from "@/lib/notifications";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const d = await getNotifications();
      setItems(d.results.slice(0, 8));
      setUnread(d.unread_count);
    } catch { /* ignore */ }
  }
  useEffect(() => {
    load();
    const t = setInterval(load, 60000); // light polling
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function openAndRead() {
    setOpen((v) => !v);
    if (!open) await load();
  }
  async function readOne(n: Notification) {
    if (!n.is_read) { await markRead(n.id); setUnread((u) => Math.max(0, u - 1)); }
  }
  async function readAll() { await markAllRead(); setUnread(0); load(); }

  return (
    <div ref={ref} className="relative">
      <button onClick={openAndRead} aria-label="Notifications" className="relative rounded-full p-2 text-brand-navy hover:bg-gray-100">
        🔔
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-orange px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-gray-100 bg-white p-2 shadow-lg">
          <div className="flex items-center justify-between px-2 py-1">
            <span className="text-sm font-semibold text-brand-navy">Notifications</span>
            {unread > 0 && <button onClick={readAll} className="text-xs text-brand-blue">Mark all read</button>}
          </div>
          {items.length === 0 ? (
            <p className="px-2 py-4 text-sm text-gray-400">You&apos;re all caught up.</p>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {items.map((n) => (
                <Link key={n.id} href={n.link || "/notifications"} onClick={() => { readOne(n); setOpen(false); }}
                  className={`block rounded-md px-2 py-2 text-sm hover:bg-gray-50 ${n.is_read ? "text-gray-500" : "text-brand-navy"}`}>
                  <p className="font-medium">{!n.is_read && "• "}{n.title}</p>
                  {n.message && <p className="text-xs text-gray-400">{n.message}</p>}
                </Link>
              ))}
            </div>
          )}
          <Link href="/notifications" onClick={() => setOpen(false)} className="mt-1 block rounded-md px-2 py-2 text-center text-xs font-semibold text-brand-blue hover:bg-gray-50">
            View all
          </Link>
        </div>
      )}
    </div>
  );
}

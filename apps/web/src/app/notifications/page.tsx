"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { getNotifications, markAllRead, markRead, type Notification } from "@/lib/notifications";

const TYPES = ["", "course", "certificate", "counselling", "live_class", "event", "announcement", "system"];

export default function NotificationsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [items, setItems] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("");
  const [unread, setUnread] = useState(0);

  useEffect(() => { if (!loading && !user) router.replace("/login"); }, [loading, user, router]);

  function load() {
    const q = [filter && `type=${filter}`].filter(Boolean).join("&");
    getNotifications(q ? `?${q}` : "").then((d) => { setItems(d.results); setUnread(d.unread_count); }).catch(() => setItems([]));
  }
  useEffect(() => { if (user) load(); }, [user, filter]);

  if (loading || !user) return <div className="mx-auto max-w-3xl px-4 py-16 text-gray-500">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-brand-navy">Notifications</h1>
        {unread > 0 && <button onClick={async () => { await markAllRead(); load(); }} className="text-sm font-medium text-brand-blue">Mark all read</button>}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button key={t || "all"} onClick={() => setFilter(t)}
            className={`rounded-full border px-3 py-1 text-xs capitalize ${filter === t ? "border-brand-blue bg-blue-50 text-brand-blue" : "border-gray-200 text-gray-500"}`}>
            {t || "all"}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        {items.length === 0 && <p className="text-sm text-gray-500">No notifications.</p>}
        {items.map((n) => (
          <Link key={n.id} href={n.link || "#"} onClick={() => { if (!n.is_read) markRead(n.id); }}
            className={`block rounded-lg border p-4 ${n.is_read ? "border-gray-100 bg-white" : "border-blue-100 bg-blue-50/40"}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 break-words font-semibold text-brand-navy">{!n.is_read && "• "}{n.title}</p>
              <span className="shrink-0 rounded bg-gray-100 px-2 py-0.5 text-xs capitalize">{n.type.replace("_", " ")}</span>
            </div>
            {n.message && <p className="mt-1 text-sm text-gray-600">{n.message}</p>}
            <p className="mt-1 text-xs text-gray-400">{new Date(n.created_at).toLocaleString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

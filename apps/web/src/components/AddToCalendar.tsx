"use client";

import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface CalendarEvent {
  slug: string;          // for the ICS endpoint
  title: string;
  description?: string;
  start_time: string;    // ISO (UTC)
  end_time?: string | null;
  joinUrl?: string;
}

// Format an ISO datetime to the compact UTC form calendars expect.
function gcalTime(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function googleUrl(e: CalendarEvent): string {
  const start = gcalTime(e.start_time);
  const end = gcalTime(e.end_time || e.start_time);
  const details = [e.description, e.joinUrl ? `Join: ${e.joinUrl}` : ""].filter(Boolean).join("\n");
  const p = new URLSearchParams({
    action: "TEMPLATE", text: e.title, dates: `${start}/${end}`, details,
  });
  if (e.joinUrl) p.set("location", e.joinUrl);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}

function outlookUrl(e: CalendarEvent): string {
  const p = new URLSearchParams({
    path: "/calendar/action/compose", rru: "addevent",
    subject: e.title,
    startdt: new Date(e.start_time).toISOString(),
    enddt: new Date(e.end_time || e.start_time).toISOString(),
    body: [e.description, e.joinUrl ? `Join: ${e.joinUrl}` : ""].filter(Boolean).join("\n"),
    location: e.joinUrl || "",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${p.toString()}`;
}

export default function AddToCalendar({ event }: { event: CalendarEvent }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(ev: MouseEvent) {
      if (ref.current && !ref.current.contains(ev.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-gray-200 px-3 py-1.5 text-sm font-medium text-brand-navy hover:bg-gray-50">
        📅 Add to Calendar
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-48 rounded-lg border border-gray-100 bg-white p-1 shadow-lg">
          <a href={googleUrl(event)} target="_blank" rel="noopener noreferrer" className="block rounded px-3 py-2 text-sm hover:bg-gray-50">Google Calendar</a>
          <a href={outlookUrl(event)} target="_blank" rel="noopener noreferrer" className="block rounded px-3 py-2 text-sm hover:bg-gray-50">Outlook Calendar</a>
          <a href={`${API_URL}/api/live-sessions/${event.slug}/calendar.ics`} className="block rounded px-3 py-2 text-sm hover:bg-gray-50">Download .ics</a>
        </div>
      )}
    </div>
  );
}

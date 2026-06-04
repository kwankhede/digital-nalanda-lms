"use client";

import { useEffect, useState } from "react";
import { getTicker, type TickerDTO } from "@/lib/api";

// Shown only until real notices are added in the admin, so the bar is never empty.
const FALLBACK: TickerDTO[] = [
  { id: -1, text: "CUET UG 2026 registration is now open — apply before the last date.", link: "https://nalanda-academy.org/" },
  { id: -2, text: "JEE Main 2026 Session 1 exam scheduled for January 2026.", link: "" },
  { id: -3, text: "NEET UG 2026 application window expected to open in February.", link: "" },
  { id: -4, text: "Nalanda Scholarship 2026 applications close on March 31, 2026.", link: "https://nalanda-academy.org/" },
  { id: -5, text: "UPSC Civil Services 2026 notification released — start preparing now.", link: "" },
];

function Notice({ item }: { item: TickerDTO }) {
  const inner = (
    <span className="inline-flex items-center gap-2">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-nal-terracotta" />
      <span>{item.text}</span>
    </span>
  );
  return (
    <span className="mx-5 inline-flex items-center text-[12px] font-medium leading-none text-nal-navy">
      {item.link ? (
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="hover:text-nal-terracotta hover:underline">
          {inner}
        </a>
      ) : (
        inner
      )}
    </span>
  );
}

export default function NoticeTicker() {
  const [items, setItems] = useState<TickerDTO[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getTicker()
      .then((d) => setItems(d.length > 0 ? d : FALLBACK))
      .catch(() => setItems(FALLBACK))
      .finally(() => setReady(true));
  }, []);

  if (!ready || items.length === 0) return null;

  // Duplicate the list so the marquee can loop seamlessly (-50%).
  const loop = [...items, ...items];

  return (
    <section
      aria-label="Latest exam and application notices"
      className="relative z-20 -mt-6 px-4 md:-mt-9"
    >
      <div className="mx-auto flex max-w-7xl items-stretch overflow-hidden rounded-none border border-nal-border bg-white shadow-soft">
        <div className="flex shrink-0 items-center gap-1.5 bg-nal-terracotta px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
          <span aria-hidden>📢</span>
          <span className="hidden sm:inline">Notices</span>
        </div>
        <div className="marquee-wrap relative flex-1 overflow-hidden py-0.5">
          <div className="marquee-track">
            {loop.map((it, i) => (
              <Notice key={`${it.id}-${i}`} item={it} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

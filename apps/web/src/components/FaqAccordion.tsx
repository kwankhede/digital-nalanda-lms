"use client";

import { useState } from "react";

export interface FaqItem {
  q: string;
  a: string;
}
export interface FaqGroup {
  category: string;
  items: FaqItem[];
}

function Item({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-nal-border bg-white shadow-soft">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-nal-parchment/50 sm:px-5"
      >
        <span className="font-semibold text-nal-navy">{item.q}</span>
        <span
          aria-hidden
          className={`shrink-0 text-xl leading-none text-nal-saffron transition-transform duration-200 ${open ? "rotate-45" : ""}`}
        >
          +
        </span>
      </button>
      {open && (
        <div className="border-t border-nal-border px-4 py-3.5 text-sm leading-relaxed text-nal-slate sm:px-5">
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function FaqAccordion({ groups }: { groups: FaqGroup[] }) {
  return (
    <div className="mt-10 space-y-10">
      {groups.map((g) => (
        <section key={g.category}>
          <h2 className="font-display text-xl font-bold text-nal-navy md:text-2xl">{g.category}</h2>
          <div className="mt-4 space-y-3">
            {g.items.map((it) => (
              <Item key={it.q} item={it} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

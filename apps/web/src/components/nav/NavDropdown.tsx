"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { NavGroup } from "@/lib/nav";

export default function NavDropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  // Close on outside click / Escape.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 py-2 text-sm font-medium text-nal-navy hover:text-nal-saffron"
      >
        {group.label}
        <span aria-hidden className="text-xs">▾</span>
      </button>
      {open && (
        <div
          id={id}
          className="absolute left-0 top-full z-50 w-56 rounded-lg border border-nal-parchment bg-white p-2 shadow-lg"
        >
          {group.items.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-nal-parchment hover:text-nal-saffron"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

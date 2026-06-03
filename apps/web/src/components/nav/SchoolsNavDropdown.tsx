"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useNavSchools } from "@/lib/useNavSchools";

// Desktop "Schools" dropdown, auto-populated from the DB (admin-managed).
export default function SchoolsNavDropdown() {
  const schools = useNavSchools(8);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

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

  // No schools yet → behave like a plain link to /schools.
  if (schools.length === 0) {
    return (
      <Link href="/schools" className="nav-underline text-sm font-medium text-nal-navy hover:text-nal-saffron">
        Schools
      </Link>
    );
  }

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
        className="nav-underline flex items-center gap-1 py-2 text-sm font-medium text-nal-navy hover:text-nal-saffron"
      >
        Schools
        <span aria-hidden className="text-xs">▾</span>
      </button>
      {open && (
        <div
          id={id}
          className="absolute left-0 top-full z-50 w-64 rounded-xl border border-nal-border bg-white p-2 shadow-lift"
        >
          {schools.map((s) => (
            <Link
              key={s.slug}
              href={`/schools/${s.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-nal-navy hover:bg-nal-parchment hover:text-nal-saffron"
            >
              {s.icon && <span aria-hidden>{s.icon}</span>}
              <span className="truncate">{s.name}</span>
            </Link>
          ))}
          <Link
            href="/schools"
            onClick={() => setOpen(false)}
            className="mt-1 block rounded-md border-t border-nal-border px-3 py-2 text-sm font-semibold text-nal-saffron hover:bg-nal-parchment"
          >
            View all schools →
          </Link>
        </div>
      )}
    </div>
  );
}

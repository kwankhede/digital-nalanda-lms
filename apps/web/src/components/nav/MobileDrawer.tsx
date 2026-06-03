"use client";

import Link from "next/link";
import { useState } from "react";
import type { NavGroup } from "@/lib/nav";
import { DONATE_LINK } from "@/lib/nav";
import { useAuth } from "@/lib/auth";
import { useNavSchools } from "@/lib/useNavSchools";

export default function MobileDrawer({
  groups,
  open,
  onClose,
}: {
  groups: NavGroup[];
  open: boolean;
  onClose: () => void;
}) {
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);
  const schools = useNavSchools(8);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-80 max-w-[85%] overflow-y-auto bg-white p-4 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="font-extrabold text-brand-navy">Menu</span>
          <button onClick={onClose} aria-label="Close menu" className="p-2 text-gray-500">
            ✕
          </button>
        </div>

        <nav className="mt-4 space-y-1">
          <Link href="/" onClick={onClose} className="block rounded-md px-3 py-2 font-medium text-brand-navy hover:bg-gray-50">
            Home
          </Link>

          {schools.length > 0 && (
            <div>
              <button
                onClick={() => setExpanded((e) => (e === "Schools" ? null : "Schools"))}
                aria-expanded={expanded === "Schools"}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 font-medium text-brand-navy hover:bg-gray-50"
              >
                Schools
                <span aria-hidden>{expanded === "Schools" ? "−" : "+"}</span>
              </button>
              {expanded === "Schools" && (
                <div className="ml-3 border-l border-gray-100 pl-3">
                  {schools.map((sc) => (
                    <Link
                      key={sc.slug}
                      href={`/schools/${sc.slug}`}
                      onClick={onClose}
                      className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                    >
                      {sc.icon ? `${sc.icon} ` : ""}{sc.name}
                    </Link>
                  ))}
                  <Link href="/schools" onClick={onClose} className="block rounded-md px-3 py-2 text-sm font-semibold text-brand-orange hover:bg-gray-50">
                    View all schools →
                  </Link>
                </div>
              )}
            </div>
          )}

          {groups.map((g) => (
            <div key={g.label}>
              <button
                onClick={() => setExpanded((e) => (e === g.label ? null : g.label))}
                aria-expanded={expanded === g.label}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 font-medium text-brand-navy hover:bg-gray-50"
              >
                {g.label}
                <span aria-hidden>{expanded === g.label ? "−" : "+"}</span>
              </button>
              {expanded === g.label && (
                <div className="ml-3 border-l border-gray-100 pl-3">
                  {g.items.map((item) =>
                    item.external ? (
                      <a
                        key={item.label}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onClose}
                        className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={onClose}
                        className="block rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                      >
                        {item.label}
                      </Link>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}

          {user && (
            <Link href="/dashboard" onClick={onClose} className="block rounded-md px-3 py-2 font-medium text-brand-navy hover:bg-gray-50">
              Dashboard
            </Link>
          )}

          <Link href={DONATE_LINK.href} onClick={onClose} className="mt-2 block rounded-md bg-brand-orange px-3 py-2 text-center font-semibold text-white">
            Donate
          </Link>

          {user ? (
            <button
              onClick={() => { onClose(); logout(); }}
              className="block w-full rounded-md px-3 py-2 text-left font-medium text-red-600 hover:bg-red-50"
            >
              Logout
            </button>
          ) : (
            <div className="mt-2 space-y-2">
              <Link href="/login" onClick={onClose} className="block rounded-md border border-gray-200 px-3 py-2 text-center font-medium">
                Login
              </Link>
              <Link href="/register" onClick={onClose} className="block rounded-md bg-brand-navy px-3 py-2 text-center font-semibold text-white">
                Register for Free
              </Link>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
}

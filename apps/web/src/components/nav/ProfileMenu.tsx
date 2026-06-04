"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { PROFILE_MENU } from "@/lib/nav";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!user) return null;
  const initial = (user.full_name || user.email || "?").charAt(0).toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Profile menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-navy font-bold text-white"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-lg border border-gray-100 bg-white p-2 shadow-lg">
          <div className="border-b border-gray-100 px-3 py-2">
            <p className="truncate text-sm font-semibold text-brand-navy">
              {user.full_name || "Student"}
            </p>
            <p className="truncate text-xs text-gray-400">{user.email}</p>
          </div>
          {["course_creator", "admin", "content_manager", "super_admin"].includes(user.role) && (
            <Link
              href="/creator/dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-semibold text-brand-orange hover:bg-gray-50"
            >
              Creator Dashboard
            </Link>
          )}
          {(user.is_staff || ["admin", "super_admin"].includes(user.role)) && (
            <Link
              href="/admin/dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-semibold text-brand-blue hover:bg-gray-50"
            >
              Admin Dashboard
            </Link>
          )}
          {user.role === "content_manager" && (
            <Link
              href="/content/dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-semibold text-brand-blue hover:bg-gray-50"
            >
              Content Dashboard
            </Link>
          )}
          {user.role === "event_manager" && (
            <Link
              href="/events/dashboard"
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm font-semibold text-brand-blue hover:bg-gray-50"
            >
              Events Dashboard
            </Link>
          )}
          {PROFILE_MENU.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="mt-1 block w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

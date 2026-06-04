"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_NAV } from "@/lib/nav";

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-gray-100 bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      {BOTTOM_NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-1 py-2 text-[11px] ${
              active ? "text-brand-blue" : "text-gray-500"
            }`}
          >
            <span aria-hidden className="text-lg leading-none">{item.icon}</span>
            <span className="max-w-full truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

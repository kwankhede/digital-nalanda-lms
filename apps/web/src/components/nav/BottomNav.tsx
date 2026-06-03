"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BOTTOM_NAV } from "@/lib/nav";

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-gray-100 bg-white md:hidden"
      aria-label="Primary"
    >
      {BOTTOM_NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
              active ? "text-brand-blue" : "text-gray-500"
            }`}
          >
            <span aria-hidden className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

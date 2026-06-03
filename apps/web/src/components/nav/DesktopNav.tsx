"use client";

import Link from "next/link";
import type { NavGroup } from "@/lib/nav";
import { PUBLIC_PRIMARY, PUBLIC_RESOURCES } from "@/lib/nav";
import { useAuth } from "@/lib/auth";
import NavDropdown from "./NavDropdown";
import SchoolsNavDropdown from "./SchoolsNavDropdown";
import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";

function SearchButton() {
  return (
    <Link
      href="/courses"
      aria-label="Search courses"
      className="flex h-9 w-9 items-center justify-center rounded-md text-nal-navy transition hover:bg-nal-parchment"
    >
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.2-3.2" />
      </svg>
    </Link>
  );
}

export default function DesktopNav({ groups }: { groups: NavGroup[] }) {
  const { user } = useAuth();

  // Logged-in students keep the grouped menu + profile tools.
  if (user) {
    return (
      <div className="hidden items-center gap-6 md:flex">
        <Link href="/" className="nav-underline text-sm font-medium text-nal-navy hover:text-nal-saffron">
          Home
        </Link>
        {groups.map((g) => (
          <NavDropdown key={g.label} group={g} />
        ))}
        <Link href="/dashboard" className="nav-underline text-sm font-medium text-nal-navy hover:text-nal-saffron">
          Dashboard
        </Link>
        <SearchButton />
        <NotificationBell />
        <ProfileMenu />
      </div>
    );
  }

  // Public visitors: flat top-level links + a single Resources dropdown,
  // matching the reference header exactly.
  return (
    <div className="hidden items-center gap-6 md:flex">
      {PUBLIC_PRIMARY.map((l) =>
        l.label === "Schools" ? (
          <SchoolsNavDropdown key="schools" />
        ) : (
          <Link
            key={l.label}
            href={l.href}
            className="nav-underline text-sm font-medium text-nal-navy hover:text-nal-saffron"
          >
            {l.label}
          </Link>
        ),
      )}
      <NavDropdown group={PUBLIC_RESOURCES} />

      <SearchButton />
      <Link
        href="/login"
        className="rounded-md border border-nal-navy/25 px-4 py-2 text-sm font-semibold text-nal-navy transition hover:bg-nal-parchment"
      >
        Log In
      </Link>
      <Link
        href="/register"
        className="rounded-md bg-nal-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
      >
        Sign Up
      </Link>
    </div>
  );
}

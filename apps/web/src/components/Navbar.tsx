"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { PUBLIC_NAV, STUDENT_NAV } from "@/lib/nav";
import DesktopNav from "./nav/DesktopNav";
import MobileDrawer from "./nav/MobileDrawer";
import BottomNav from "./nav/BottomNav";

export default function Navbar() {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const groups = user ? STUDENT_NAV : PUBLIC_NAV;

  // Subtle shadow once the page is scrolled (sticky header).
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 border-b transition-shadow duration-300 ${
          scrolled
            ? "border-nal-parchment bg-nal-cream/95 shadow-soft backdrop-blur"
            : "border-transparent bg-nal-cream/80 backdrop-blur"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center" aria-label="Digital Nalanda home">
            <Image
              src="/images/brand/digital-nalanda-logo.png"
              alt="Digital Nalanda"
              width={200}
              height={50}
              priority
              className="h-9 w-auto md:h-10"
            />
          </Link>

          <DesktopNav groups={groups} />

          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            className="rounded-md p-2 text-nal-navy hover:bg-nal-parchment md:hidden"
          >
            ☰
          </button>
        </nav>
      </header>

      <MobileDrawer
        groups={groups}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
      <BottomNav />
    </>
  );
}

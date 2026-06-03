import Link from "next/link";
import Image from "next/image";
import { SUPPORT_URL } from "@/lib/homeData";

interface FLink { label: string; href: string; external?: boolean }

const COLUMNS: { heading: string; links: FLink[] }[] = [
  {
    heading: "Explore",
    links: [
      { label: "Courses", href: "/courses" },
      { label: "Live Classes", href: "/#events" },
      { label: "Events", href: "/#events" },
      { label: "Schools", href: "/schools" },
      { label: "Libraries", href: "/#community-libraries" },
      { label: "Educators", href: "/#educators" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Study Materials", href: "#" },
      { label: "Stories", href: "/stories" },
      { label: "Impact", href: "/#impact" },
      { label: "FAQ", href: "#" },
      { label: "Help Center", href: "#" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "About Us", href: "/#about" },
      { label: "Our Team", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact Us", href: "#" },
      { label: "Donate", href: SUPPORT_URL, external: true },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Use", href: "#" },
      { label: "Code of Conduct", href: "#" },
    ],
  },
];

const SOCIALS = [
  { label: "Facebook", char: "f", href: "https://www.facebook.com/DigitalNalanda/" },
  { label: "X", char: "𝕏", href: "https://twitter.com/digital_nalanda" },
  { label: "YouTube", char: "▶", href: "https://www.youtube.com/channel/UClOyAI2ohJ2NeGihMMBde5w" },
  { label: "Instagram", char: "◎", href: "https://www.instagram.com/digitalnalanda" },
  { label: "LinkedIn", char: "in", href: "https://www.linkedin.com/company/nalanda-academy-wardha" },
];

function FooterLink({ link }: { link: FLink }) {
  const cls = "text-white/70 transition hover:text-white";
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {link.label}
      </a>
    );
  }
  return <Link href={link.href} className={cls}>{link.label}</Link>;
}

export default function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-nal-navy text-white">
      {/* subtle static line-art decoration */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-44 w-56 opacity-[0.08]"
        viewBox="0 0 160 120"
        fill="none"
        stroke="#f2a52c"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* growing plant */}
        <path d="M96 96V58" />
        <path d="M96 70c-12 0-20-9-20-20 11 0 20 9 20 20z" />
        <path d="M96 60c12 0 20-9 20-20-11 0-20 9-20 20z" />
        {/* stacked bricks */}
        <rect x="40" y="96" width="22" height="14" />
        <rect x="64" y="96" width="22" height="14" />
        <rect x="88" y="96" width="22" height="14" />
        <rect x="52" y="80" width="22" height="14" />
        <rect x="76" y="80" width="22" height="14" />
      </svg>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-[1.6fr_repeat(4,1fr)]">
        <div>
          <span className="inline-flex rounded-lg bg-white/95 px-3 py-2 shadow-soft">
            <Image
              src="/images/brand/digital-nalanda-logo.png"
              alt="Digital Nalanda"
              width={200}
              height={50}
              className="h-9 w-auto"
            />
          </span>
          <p className="mt-4 max-w-xs text-sm text-white/70">
            A global learning ecosystem inspired by wisdom, rooted in justice,
            and driven by technology.
          </p>
          <div className="mt-5 flex gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm text-white/80 transition hover:bg-nal-saffron hover:text-white"
              >
                {s.char}
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.heading}>
            <p className="text-sm font-bold uppercase tracking-wide text-white/90">
              {col.heading}
            </p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <FooterLink link={l} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-xs text-white/50">
          © {new Date().getFullYear()} Digital Nalanda. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-brand-navy">
            Digital Nalanda
          </span>
          <span className="rounded bg-brand-orange px-2 py-0.5 text-xs font-bold text-white">
            LMS
          </span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-brand-blue">
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="rounded-md bg-brand-orange px-4 py-2 text-white hover:opacity-90"
          >
            Login
          </Link>
        </div>
      </nav>
    </header>
  );
}

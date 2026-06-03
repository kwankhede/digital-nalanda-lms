import { SUPPORT_URL } from "@/lib/homeData";

export default function JoinMission() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-nal-navy p-7 text-white shadow-soft">
      {/* growth / bricks line-art (symbolic, no portraits) */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-36 w-36 opacity-15"
        viewBox="0 0 120 120" fill="none" stroke="#f2a52c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
      >
        <path d="M60 110V70" />
        <path d="M60 78c-10 0-18-8-18-18 10 0 18 8 18 18z" />
        <path d="M60 70c10 0 18-8 18-18-10 0-18 8-18 18z" />
        <rect x="30" y="96" width="18" height="12" />
        <rect x="50" y="96" width="18" height="12" />
        <rect x="70" y="96" width="18" height="12" />
      </svg>

      <div className="relative">
        <h3 className="font-display text-2xl font-bold">Join Our Mission</h3>
        <p className="mt-3 max-w-xs text-sm text-white/80">
          Be a part of a movement that is reviving wisdom and building a more
          equal India.
        </p>
      </div>
      <a
        href={SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="relative mt-6 inline-flex w-fit items-center gap-2 rounded-md bg-nal-saffron px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
      >
        Support Nalanda
        <span>→</span>
      </a>
    </div>
  );
}

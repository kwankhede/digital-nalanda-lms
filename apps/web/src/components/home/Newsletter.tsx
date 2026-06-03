"use client";

import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
    try {
      await fetch(`${base}/api/newsletter/subscribe/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      /* best-effort; still confirm to the user */
    }
    setDone(true);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex flex-col items-center gap-6 rounded-2xl border border-nal-parchment bg-white px-6 py-10 shadow-soft md:flex-row md:justify-between md:px-10">
        <div className="flex items-start gap-4">
          <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-nal-saffron/15 text-nal-saffron sm:flex">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />
            </svg>
          </span>
          <div>
            <h2 className="font-display text-2xl font-bold text-nal-navy">Stay connected. Stay inspired.</h2>
            <p className="mt-1 text-sm text-nal-slate">
              Subscribe to our newsletter for updates, stories and learning resources.
            </p>
          </div>
        </div>

        {done ? (
          <p className="font-semibold text-nal-teal">🎉 Thanks for subscribing!</p>
        ) : (
          <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              aria-label="Email address"
              className="flex-1 rounded-md border border-nal-parchment bg-nal-cream px-4 py-3 text-nal-navy outline-none transition focus:border-nal-saffron focus:ring-2 focus:ring-nal-saffron/30"
            />
            <button
              type="submit"
              className="rounded-md bg-nal-saffron px-6 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

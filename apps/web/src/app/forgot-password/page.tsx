"use client";

import Link from "next/link";
import { useState } from "react";
import { requestPasswordReset } from "@/lib/passwordReset";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls =
    "mt-1 w-full rounded-md border border-nal-border px-3 py-2 text-base outline-none focus:border-nal-saffron";

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-2xl border border-nal-border bg-white p-6 shadow-soft sm:p-8">
        <h1 className="font-display text-2xl font-bold text-nal-navy">
          Forgot your password?
        </h1>

        {sent ? (
          <>
            <p className="mt-3 text-nal-slate">
              If that email exists, we&apos;ve sent a reset link. Check your
              inbox.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex min-h-[44px] items-center rounded-md bg-nal-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-nal-ink"
            >
              Back to login
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-nal-slate">
              Enter your email and we&apos;ll send you a link to reset your
              password.
            </p>

            {error && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-sm">
                <span className="font-medium text-nal-navy">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </label>
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[44px] w-full rounded-md bg-nal-navy py-2.5 text-sm font-semibold text-white transition hover:bg-nal-ink disabled:opacity-60"
              >
                {submitting ? "Sending…" : "Send reset link"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-nal-slate">
              Remembered it?{" "}
              <Link href="/login" className="font-semibold text-nal-saffron">
                Back to login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { confirmPasswordReset } from "@/lib/passwordReset";

const inputCls =
  "mt-1 w-full rounded-md border border-nal-border px-3 py-2 text-base outline-none focus:border-nal-saffron";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="rounded-2xl border border-nal-border bg-white p-6 shadow-soft sm:p-8">
        {children}
      </div>
    </div>
  );
}

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Missing link parameters → invalid link state.
  if (!uid || !token) {
    return (
      <Card>
        <h1 className="font-display text-2xl font-bold text-nal-navy">
          Invalid reset link
        </h1>
        <p className="mt-3 text-nal-slate">
          This password reset link is missing information or is malformed.
          Please request a new one.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex min-h-[44px] items-center rounded-md bg-nal-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-nal-ink"
        >
          Request a new link
        </Link>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <h1 className="font-display text-2xl font-bold text-nal-navy">
          Password updated
        </h1>
        <p className="mt-3 text-nal-slate">
          Your password has been changed. You can now log in with your new
          password.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex min-h-[44px] items-center rounded-md bg-nal-navy px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-nal-ink"
        >
          Go to login
        </Link>
      </Card>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await confirmPasswordReset(uid, token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not reset your password.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <h1 className="font-display text-2xl font-bold text-nal-navy">
        Set a new password
      </h1>
      <p className="mt-2 text-sm text-nal-slate">
        Choose a strong password with at least 8 characters.
      </p>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          <p>{error}</p>
          <Link
            href="/forgot-password"
            className="mt-1 inline-block font-semibold text-red-700 underline"
          >
            Request a new reset link
          </Link>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="font-medium text-nal-navy">New password</span>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={inputCls}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-nal-navy">Confirm password</span>
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            className={inputCls}
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="min-h-[44px] w-full rounded-md bg-nal-navy py-2.5 text-sm font-semibold text-white transition hover:bg-nal-ink disabled:opacity-60"
        >
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <Card>
          <p className="text-sm text-nal-slate">Loading…</p>
        </Card>
      }
    >
      <ResetForm />
    </Suspense>
  );
}

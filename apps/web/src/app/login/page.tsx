"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { getDefaultDashboardForRole } from "@/lib/roles";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in? Go to the right dashboard for the role.
  useEffect(() => {
    if (user) router.replace(getDefaultDashboardForRole(user));
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const me = await login(email, password);
      router.replace(getDefaultDashboardForRole(me));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-extrabold text-brand-navy">Welcome back</h1>
      <p className="mt-1 text-sm text-gray-500">Login to continue learning.</p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 outline-none focus:border-brand-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 outline-none focus:border-brand-blue"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-brand-orange py-2 font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Logging in…" : "Login"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        New here?{" "}
        <Link href="/register" className="font-semibold text-brand-blue">
          Create an account
        </Link>
      </p>
    </div>
  );
}

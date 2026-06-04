"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register(form);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-2xl font-extrabold text-brand-navy">
        Create your account
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        Register free and start learning.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-base outline-none focus:border-brand-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-base outline-none focus:border-brand-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-base outline-none focus:border-brand-blue"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="At least 8 characters"
            className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-base outline-none focus:border-brand-blue"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="tap-target w-full rounded-md bg-brand-orange py-2.5 font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Register"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-blue">
          Login
        </Link>
      </p>
    </div>
  );
}

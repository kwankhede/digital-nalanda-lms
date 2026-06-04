"use client";

import { API_URL } from "@/lib/api";
import { authFetch } from "@/lib/auth";

async function j<T>(r: Response): Promise<T> {
  let body: { detail?: string } = {};
  try { body = await r.json(); } catch {}
  if (!r.ok) throw new Error(body.detail ?? "Request failed");
  return body as T;
}

/** Confirm an email address from the signed token in the verification link. */
export const verifyEmail = (token: string) =>
  fetch(`${API_URL}/api/auth/verify-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  }).then((r) => j<{ detail: string }>(r));

/** Resend the verification email to the logged-in user. */
export const resendVerification = () =>
  authFetch("/api/auth/verify-email/resend/", { method: "POST" }).then((r) =>
    j<{ detail: string }>(r),
  );

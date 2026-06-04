"use client";

import { API_URL } from "@/lib/api";

async function j<T>(r: Response): Promise<T> {
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    throw new Error((data as { detail?: string }).detail ?? "Request failed");
  }
  return data as T;
}

export interface PasswordResetResponse {
  detail: string;
}

export const requestPasswordReset = (email: string) =>
  fetch(`${API_URL}/api/auth/password-reset/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  }).then((r) => j<PasswordResetResponse>(r));

export const confirmPasswordReset = (
  uid: string,
  token: string,
  newPassword: string,
) =>
  fetch(`${API_URL}/api/auth/password-reset/confirm/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, token, new_password: newPassword }),
  }).then((r) => j<PasswordResetResponse>(r));

"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { resendVerification } from "@/lib/emailVerify";

export default function EmailVerifyBanner() {
  const { user } = useAuth();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hidden, setHidden] = useState(false);

  // Only show for logged-in users whose email is explicitly not verified.
  if (!user || user.email_verified !== false || hidden) return null;

  async function resend() {
    setBusy(true);
    try { await resendVerification(); setSent(true); }
    catch { setSent(true); } // generic — don't leak details
    finally { setBusy(false); }
  }

  return (
    <div className="bg-nal-gold/20 px-4 py-2 text-sm text-nal-navy">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
        <span>📧 Please verify your email to secure your account.</span>
        {sent ? (
          <span className="font-semibold text-nal-teal">Verification email sent — check your inbox.</span>
        ) : (
          <button
            onClick={resend}
            disabled={busy}
            className="font-semibold text-nal-saffron underline underline-offset-2 hover:text-nal-terracotta disabled:opacity-60"
          >
            {busy ? "Sending…" : "Resend verification email"}
          </button>
        )}
        <button onClick={() => setHidden(true)} aria-label="Dismiss" className="text-nal-slate hover:text-nal-navy">✕</button>
      </div>
    </div>
  );
}

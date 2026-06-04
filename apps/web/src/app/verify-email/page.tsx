"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/lib/emailVerify";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMsg("This verification link is missing its token.");
      return;
    }
    verifyEmail(token)
      .then((r) => { setState("ok"); setMsg(r.detail); })
      .catch((e) => { setState("error"); setMsg(e instanceof Error ? e.message : "Verification failed."); });
  }, [token]);

  return (
    <div className="parchment flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-nal-border bg-white p-8 text-center shadow-soft">
        {state === "loading" && (
          <>
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-nal-border border-t-nal-saffron" />
            <p className="mt-4 text-nal-slate">Verifying your email…</p>
          </>
        )}
        {state === "ok" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-nal-saffron/15 text-2xl text-nal-saffron">✓</div>
            <h1 className="mt-4 font-display text-2xl font-bold text-nal-navy">Email verified</h1>
            <p className="mt-2 text-sm text-nal-slate">{msg}</p>
            <Link href="/dashboard" className="mt-6 inline-flex rounded-lg bg-nal-saffron px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95">
              Go to dashboard
            </Link>
          </>
        )}
        {state === "error" && (
          <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-nal-terracotta/15 text-2xl text-nal-terracotta">!</div>
            <h1 className="mt-4 font-display text-2xl font-bold text-nal-navy">Verification failed</h1>
            <p className="mt-2 text-sm text-nal-slate">{msg}</p>
            <p className="mt-4 text-sm text-nal-slate">
              Log in and use the &quot;Resend verification&quot; button to get a fresh link.
            </p>
            <Link href="/login" className="mt-6 inline-flex rounded-lg border border-nal-border px-5 py-2.5 text-sm font-semibold text-nal-navy transition hover:bg-nal-parchment">
              Go to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-center text-nal-slate">Loading…</div>}>
      <VerifyInner />
    </Suspense>
  );
}

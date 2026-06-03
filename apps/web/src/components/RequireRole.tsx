"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

// Client-side route guard. Backend permissions are the real enforcement;
// this just improves UX by redirecting unauthorized users.
export default function RequireRole({
  allow,
  children,
}: {
  allow: (user: NonNullable<ReturnType<typeof useAuth>["user"]>) => boolean;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login");
    else if (!allow(user)) router.replace("/unauthorized");
  }, [loading, user, router, allow]);

  if (loading || !user || !allow(user)) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-gray-500">Loading…</div>;
  }
  return <>{children}</>;
}

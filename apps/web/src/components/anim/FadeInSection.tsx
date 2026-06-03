"use client";

import { useInViewReveal } from "@/lib/useInViewReveal";

/**
 * Wraps content and fades + lifts it in the first time it scrolls into view.
 * Uses CSS classes (.reveal / .is-visible) so reduced-motion is handled in CSS.
 */
export default function FadeInSection({
  children,
  className = "",
  delayMs = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const { ref, inView } = useInViewReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      className={`reveal ${inView ? "is-visible" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

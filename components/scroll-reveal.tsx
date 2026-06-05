import type { CSSProperties, ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

/** CSS scroll-driven reveal — no client JS (better INP). */
export function ScrollReveal({
  children,
  className = "",
  delayMs = 0,
}: ScrollRevealProps) {
  return (
    <div
      className={`reveal ${className}`}
      style={{ "--reveal-delay": `${delayMs}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}

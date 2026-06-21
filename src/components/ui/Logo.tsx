import Link from "next/link";
import { cn } from "@/lib/utils";

type Tone = "navy" | "light" | "platinum";

/**
 * The Astrada Club monogram — a platinum comet: a four-point star, a falling
 * spark, and two sweeping tails. Pure vector paths from the brand package.
 */
export function AstradaMark({
  className,
  tone = "navy",
}: {
  className?: string;
  tone?: Tone;
}) {
  const fill =
    tone === "light"
      ? "#ECEFF3"
      : tone === "platinum"
        ? "url(#astrada-plat)"
        : "#0E1B30";

  return (
    <svg
      viewBox="0 0 112 118"
      className={cn("h-6 w-6", className)}
      aria-hidden="true"
    >
      {tone === "platinum" && (
        <defs>
          <linearGradient id="astrada-plat" x1="0" y1="0" x2="0.25" y2="1">
            <stop offset="0%" stopColor="#F3F5F8" />
            <stop offset="42%" stopColor="#AEB5C0" />
            <stop offset="72%" stopColor="#E4E8ED" />
            <stop offset="100%" stopColor="#9AA1AD" />
          </linearGradient>
        </defs>
      )}
      <g fill={fill}>
        <path d="M56 3 Q57.6 15.5 63.2 20 Q57.6 24.5 56 35 Q54.4 24.5 48.8 20 Q54.4 15.5 56 3 Z" />
        <path d="M56 38 L58.7 62 L53.3 62 Z" />
        <path d="M56 57 C51 75 47 90 43 103 C41.8 106.4 38.6 106.6 38.2 103.2 C40 91.5 46 74 56 57 Z" />
        <path d="M56 57 C61 75 65 90 69 103 C70.2 106.4 73.4 106.6 73.8 103.2 C72 91.5 66 74 56 57 Z" />
      </g>
    </svg>
  );
}

export function Logo({
  className,
  href = "/",
  wordmark = true,
  tone = "navy",
}: {
  className?: string;
  href?: string | null;
  wordmark?: boolean;
  tone?: "navy" | "light";
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <AstradaMark tone={tone} className="h-7 w-6" />
      {wordmark && (
        <span
          className={cn(
            "font-display text-[1.4rem] font-semibold tracking-tight",
            tone === "light" ? "text-white" : "text-navy",
          )}
        >
          Astrada
        </span>
      )}
    </span>
  );

  if (href === null) return content;

  return (
    <Link href={href} className="focus-ring rounded-md" aria-label="Astrada Club home">
      {content}
    </Link>
  );
}

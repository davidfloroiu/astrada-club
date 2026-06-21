import { cn, hueFromString, initials } from "@/lib/utils";

const sizes = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

/**
 * Generated initials avatar — no external image requests, deterministic
 * per name. Hues are constrained to a muted navy/slate range so avatars
 * stay cohesive with the navy + platinum brand palette.
 */
export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  className?: string;
}) {
  const base = 210 + (hueFromString(name) % 28); // 210–238: navy → slate-blue
  const style = {
    backgroundImage: `linear-gradient(135deg, hsl(${base} 30% 34%), hsl(${base + 16} 34% 19%))`,
  } as React.CSSProperties;

  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white ring-1 ring-inset ring-white/15",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

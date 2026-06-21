import { cn } from "@/lib/utils";

type Tone = "neutral" | "azure" | "navy" | "positive" | "outline" | "light";

const tones: Record<Tone, string> = {
  neutral: "bg-mist text-slate border border-line",
  azure: "bg-azure/10 text-azure-deep border border-azure/20",
  navy: "bg-navy/[0.06] text-navy border border-navy/15",
  positive: "bg-positive/10 text-positive border border-positive/25",
  outline: "text-slate border border-line-strong",
  light: "bg-white/10 text-white border border-white/20",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-tight",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

import { cn } from "@/lib/utils";

/** Small azure eyebrow label that sits above section headings. */
export function SectionLabel({
  children,
  className,
  tone = "azure",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "azure" | "light";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.22em]",
        tone === "light" ? "text-platinum-bright" : "text-azure",
        className,
      )}
    >
      <span
        className={cn(
          "h-px w-6",
          tone === "light" ? "bg-white/40" : "bg-azure/45",
        )}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}

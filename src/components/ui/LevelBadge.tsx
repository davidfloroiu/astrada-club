import { cn } from "@/lib/utils";
import { levels } from "@/lib/data";
import type { MemberLevel } from "@/lib/types";

/** Compact member-level chip: azure pips + tier name. */
export function LevelBadge({
  level,
  showName = true,
  className,
}: {
  level: MemberLevel;
  showName?: boolean;
  className?: string;
}) {
  const def = levels.find((l) => l.level === level);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-azure/20 bg-azure/[0.07] px-2.5 py-1 text-xs font-medium text-azure-deep",
        className,
      )}
      title={def ? `Level ${level} · ${def.name}` : `Level ${level}`}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1 w-1 rounded-full",
              i < level ? "bg-azure" : "bg-navy/15",
            )}
          />
        ))}
      </span>
      {showName && def && <span>{def.name}</span>}
    </span>
  );
}

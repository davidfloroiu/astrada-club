"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type ThemePref } from "@/lib/theme";
import { cn } from "@/lib/utils";

const options: { value: ThemePref; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "system", label: "Auto", icon: Monitor },
  { value: "dark", label: "Dark", icon: Moon },
];

/** Light / Auto / Dark segmented control. Auto follows the device. */
export function ThemeToggle({
  className,
  showLabels = true,
}: {
  className?: string;
  showLabels?: boolean;
}) {
  const { pref, setPref } = useTheme();
  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "inline-flex items-center rounded-full border border-line bg-canvas p-0.5",
        className,
      )}
    >
      {options.map((o) => {
        const Icon = o.icon;
        const active = pref === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={o.label}
            onClick={() => setPref(o.value)}
            className={cn(
              "focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-navy text-white"
                : "text-muted hover:text-ink",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {showLabels && <span className="hidden sm:inline">{o.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

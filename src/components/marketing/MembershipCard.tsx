import { AstradaMark } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

/**
 * The Astrada membership card — a design concept used as a hero visual.
 * Navy with platinum/silver foil detailing. Not a claim, just the card.
 */
export function MembershipCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative aspect-[1.586/1] w-[22rem] max-w-full rotate-[-4deg] rounded-2xl p-6 sm:w-[26rem] sm:p-7",
        "shadow-[var(--shadow-navy)]",
        className,
      )}
      style={{
        background:
          "radial-gradient(120% 120% at 80% 0%, #21385a 0%, #14253d 45%, #0a1322 100%)",
      }}
    >
      {/* platinum frame */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/15" />
      <div className="pointer-events-none absolute inset-[3px] rounded-[14px] ring-1 ring-inset ring-white/5" />

      {/* engraved guilloché lines */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-[0.18]"
        style={{
          backgroundImage:
            "repeating-radial-gradient(circle at 120% -10%, rgba(255,255,255,0.5) 0 1px, transparent 1px 14px)",
        }}
      />

      <div className="relative flex h-full flex-col justify-between">
        {/* top row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <AstradaMark tone="light" className="h-6 w-6" />
            <span className="font-display text-xl font-semibold tracking-tight text-white">
              Astrada
            </span>
          </div>
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-platinum">
            Est. 2026
          </span>
        </div>

        {/* silver chip */}
        <div
          className="h-9 w-12 rounded-md"
          style={{
            background: "linear-gradient(135deg, #e6eaf0, #aab4c2 55%, #7f8b9c)",
            boxShadow: "inset 0 1px 1px rgba(255,255,255,0.6)",
          }}
          aria-hidden="true"
        />

        {/* bottom row */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-platinum-deep">
              Member
            </p>
            <p className="mt-1 font-display text-lg tracking-wide text-white">
              Founding Circle
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-platinum-deep">
              No.
            </p>
            <p className="mt-1 font-display text-lg tracking-[0.15em] text-platinum-bright">
              001
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

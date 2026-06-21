import Link from "next/link";
import { MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";
import type { Member } from "@/lib/types";

export function MemberCard({
  member,
  href,
  className,
}: {
  member: Member;
  href?: string;
  className?: string;
}) {
  const inner = (
    <article
      className={cn(
        "card-surface flex h-full flex-col p-6 transition-all duration-200",
        href && "hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <Avatar name={member.name} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-xl font-semibold leading-tight tracking-tight text-ink">
            {member.name}
          </h3>
          <p className="truncate text-sm text-slate">{member.title}</p>
          <p className="truncate text-sm font-medium text-azure">{member.company}</p>
        </div>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-slate">
        {member.building}
      </p>

      <div className="mt-auto flex items-center gap-3 pt-5">
        <span className="inline-flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5" />
          {member.city}
        </span>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="focus-ring block rounded-[var(--radius-card)]">
        {inner}
      </Link>
    );
  }
  return inner;
}

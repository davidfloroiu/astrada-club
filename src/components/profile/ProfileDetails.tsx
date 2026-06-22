import { MapPin, Briefcase, Target, Link2, Globe } from "lucide-react";
import { type MemberProfile, profileHasAny } from "@/lib/profile/fields";

function normalizeUrl(u: string): string {
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

/** Read-only profile block — shown on a member's detail page (and your own). */
export function ProfileDetails({ profile }: { profile: MemberProfile }) {
  if (!profileHasAny(profile)) return null;

  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const roleLine = [profile.role, profile.company].filter(Boolean).join(" · ");

  return (
    <div className="card-surface mt-6 p-6">
      {(profile.industry || profile.stage) && (
        <div className="flex flex-wrap gap-2">
          {profile.industry && (
            <span className="rounded-full border border-azure/20 bg-azure/10 px-3 py-1 text-xs font-medium text-azure-deep">
              {profile.industry}
            </span>
          )}
          {profile.stage && (
            <span className="rounded-full border border-line bg-mist px-3 py-1 text-xs font-medium text-slate">
              {profile.stage}
            </span>
          )}
        </div>
      )}

      {(roleLine || location) && (
        <div className="mt-4 grid gap-2 text-sm">
          {roleLine && (
            <p className="flex items-center gap-2 text-ink">
              <Briefcase className="h-4 w-4 shrink-0 text-muted" />
              {roleLine}
            </p>
          )}
          {location && (
            <p className="flex items-center gap-2 text-slate">
              <MapPin className="h-4 w-4 shrink-0 text-muted" />
              {location}
            </p>
          )}
        </div>
      )}

      {profile.building && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Building
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate">
            {profile.building}
          </p>
        </div>
      )}

      {profile.lookingFor.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Open to
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {profile.lookingFor.map((t) => (
              <span
                key={t}
                className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-medium text-ink"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile.seeking && (
        <div className="mt-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
            <Target className="h-3.5 w-3.5" />
            Wants to meet
          </p>
          <p className="mt-1 text-sm leading-relaxed text-slate">
            {profile.seeking}
          </p>
        </div>
      )}

      {(profile.linkedin || profile.website) && (
        <div className="mt-5 flex flex-wrap gap-2">
          {profile.linkedin && (
            <a
              href={normalizeUrl(profile.linkedin)}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-mist"
            >
              <Link2 className="h-3.5 w-3.5" />
              LinkedIn
            </a>
          )}
          {profile.website && (
            <a
              href={normalizeUrl(profile.website)}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-mist"
            >
              <Globe className="h-3.5 w-3.5" />
              Website
            </a>
          )}
        </div>
      )}
    </div>
  );
}

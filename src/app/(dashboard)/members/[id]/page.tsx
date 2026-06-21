import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Hammer, Sparkles } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { members } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const m = members.find((x) => x.id === id);
  return { title: m ? m.name : "Member" };
}

export function generateStaticParams() {
  return members.map((m) => ({ id: m.id }));
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = members.find((m) => m.id === id);
  if (!member) notFound();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/members"
          className="inline-flex items-center gap-1.5 text-sm text-slate transition-colors hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to members
        </Link>
        <Badge tone="neutral">Sample profile</Badge>
      </div>

      {/* Header */}
      <div className="card-surface mt-5 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row">
          <Avatar name={member.name} size="xl" />

          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {member.name}
            </h1>
            <p className="mt-1 text-slate">{member.title}</p>
            <p className="text-sm font-medium text-azure">{member.company}</p>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3">
              <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                <MapPin className="h-[18px] w-[18px]" />
                {member.city}, {member.country}
              </span>
            </div>
          </div>

          <div className="flex w-full flex-wrap gap-3 sm:ml-auto sm:w-auto sm:flex-col">
            <Button href="#" size="md" className="flex-1 sm:flex-none">
              Request intro
            </Button>
            <Button
              href="#"
              variant="secondary"
              size="md"
              className="flex-1 sm:flex-none"
            >
              Message
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        {/* Left */}
        <div className="card-surface p-6">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
            About
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate">
            {member.bio}
          </p>

          <div className="mt-7">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
              <Hammer className="h-[18px] w-[18px]" />
              Currently building
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              {member.building}
            </p>
          </div>

          <div className="mt-7 rounded-xl border border-azure/20 bg-azure/[0.08] p-5">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-azure-deep">
              <Sparkles className="h-[18px] w-[18px]" />
              Notable
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink">
              {member.highlight}
            </p>
          </div>
        </div>

        {/* Right */}
        <div className="card-surface p-6">
          <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
            Details
          </h2>

          <dl className="mt-4 divide-y divide-line">
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-muted">Industry</dt>
              <dd className="text-sm text-ink">{member.industry}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-muted">Location</dt>
              <dd className="text-sm text-ink">
                {member.city}, {member.country}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm text-muted">Member since</dt>
              <dd className="text-sm text-ink">{member.joinedYear}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <div className="text-xs font-medium uppercase tracking-wide text-muted">
              Focus areas
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {member.tags.map((tag) => (
                <Badge key={tag} tone="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

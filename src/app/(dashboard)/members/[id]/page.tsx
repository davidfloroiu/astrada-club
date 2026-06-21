import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ConnectButton } from "@/components/network/ConnectButton";
import { MessageButton } from "@/components/chat/MessageButton";
import { IntroDialog } from "@/components/network/IntroDialog";
import { getSession } from "@/lib/whop/session";
import { memberMap } from "@/lib/members/directory";
import { getStatus, mutualIds } from "@/lib/network/store";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = (await memberMap()).get(id);
  return { title: member ? member.name : "Member" };
}

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session.userId) notFound();

  const map = await memberMap();
  const member = map.get(id);
  if (!member) notFound();

  const isSelf = member.userId === session.userId;
  const [status, mutualIdList] = await Promise.all([
    isSelf ? Promise.resolve("none" as const) : getStatus(session.userId, id),
    isSelf ? Promise.resolve([] as string[]) : mutualIds(session.userId, id),
  ]);
  const mutuals = mutualIdList
    .map((mid) => map.get(mid))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/members"
        className="inline-flex items-center gap-1.5 text-sm text-slate transition-colors hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to members
      </Link>

      <div className="card-surface mt-5 p-6 sm:p-8">
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <Avatar name={member.name} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {member.name}
            </h1>
            {member.username && <p className="mt-1 text-slate">@{member.username}</p>}
            {member.isAdmin && (
              <span className="mt-2 inline-block rounded-full bg-azure/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-azure-deep">
                Team
              </span>
            )}
          </div>

          {!isSelf && (
            <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:flex-col">
              <ConnectButton userId={member.userId} initialStatus={status} />
              <MessageButton userId={member.userId} name={member.name} />
            </div>
          )}
        </div>
      </div>

      {!isSelf && (
        <div className="card-surface mt-6 p-6">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <Users className="h-[18px] w-[18px]" />
            Mutual connections
          </div>

          {mutuals.length === 0 ? (
            <p className="mt-3 text-sm leading-relaxed text-slate">
              You don&rsquo;t share any connections with {member.name} yet. As your
              network grows, shared connections show up here — and you can ask one
              of them for a warm introduction.
            </p>
          ) : (
            <>
              <ul className="mt-4 flex flex-wrap gap-3">
                {mutuals.map((m) => (
                  <li key={m.userId}>
                    <Link
                      href={`/members/${m.userId}`}
                      className="focus-ring inline-flex items-center gap-2 rounded-full border border-line bg-paper py-1.5 pl-1.5 pr-3 text-sm text-ink transition-colors hover:bg-mist"
                    >
                      <Avatar name={m.name} size="sm" className="h-7 w-7 text-[10px]" />
                      {m.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                <IntroDialog
                  targetUserId={member.userId}
                  targetName={member.name}
                  mutuals={mutuals.map((m) => ({ userId: m.userId, name: m.name }))}
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

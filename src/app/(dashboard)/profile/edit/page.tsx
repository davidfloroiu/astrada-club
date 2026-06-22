import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { getSession } from "@/lib/whop/session";
import { getProfile } from "@/lib/profile/store";
import { EMPTY_PROFILE } from "@/lib/profile/fields";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit profile" };

export default async function EditProfilePage() {
  const session = await getSession();
  const profile = session.userId
    ? await getProfile(session.userId)
    : { ...EMPTY_PROFILE };

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 text-sm text-slate transition-colors hover:text-navy"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to profile
      </Link>
      <div className="mt-5">
        <PageHeader
          title="Your profile"
          subtitle="Tell the community who you are and what you're looking for — it powers better connections and warm intros."
        />
        <ProfileForm initial={profile} />
      </div>
    </div>
  );
}

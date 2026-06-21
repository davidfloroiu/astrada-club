import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EventsBoard } from "@/components/events/EventsBoard";
import { listEvents } from "@/lib/events/store";
import { getSession } from "@/lib/whop/session";

export const metadata: Metadata = {
  title: "Events",
};

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const [events, session] = await Promise.all([listEvents(), getSession()]);
  const canCreate = session.accessLevel === "admin";

  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Founding-circle gatherings — dinners, runs, and rooms. Admins and moderators host them; new events appear here as they're posted."
      />
      <EventsBoard initialEvents={events} canCreate={canCreate} />
    </>
  );
}

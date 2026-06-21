import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EventsBoard } from "@/components/events/EventsBoard";

export const metadata: Metadata = {
  title: "Events",
};

export default function EventsPage() {
  return (
    <>
      <PageHeader
        title="Events"
        subtitle="Founding-circle gatherings — dinners, runs, and rooms. Founding members and the team host them; new events appear here as they're posted."
      />
      <EventsBoard />
    </>
  );
}

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
        subtitle="Early founding-circle gatherings. These are sample events that illustrate what membership looks like — real dates fill in as the circle forms."
      />
      <EventsBoard />
    </>
  );
}

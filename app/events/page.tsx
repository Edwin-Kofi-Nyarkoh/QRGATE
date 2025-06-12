import { Suspense } from "react";
import { EventsPage } from "@/components/events/events-page";
import { EventsPageSkeleton } from "@/components/events/events-page-skeleton";

export default function Events() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<EventsPageSkeleton />}>
        <EventsPage />
      </Suspense>
    </div>
  );
}

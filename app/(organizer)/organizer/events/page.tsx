import { Suspense } from "react";
import { EventListPage } from "@/components/organizer/event-list-page";
import { PageLoader } from "@/components/ui/loader";

export default function OrganizerEvents() {
  return (
    <Suspense fallback={<PageLoader />}>
      <EventListPage />
    </Suspense>
  );
}

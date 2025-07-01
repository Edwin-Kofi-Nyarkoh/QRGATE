import { Suspense } from "react";
import { EditEventPage } from "@/components/organizer/edit-event-page";
import { PageLoader } from "@/components/ui/loader";

interface EditEventPageProps {
  params: {
    id: string;
  };
}

export default async function EditEvent({ params }: EditEventPageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageLoader />}>
      <EditEventPage eventId={id} />
    </Suspense>
  );
}

import { Suspense } from "react";
import { CreateEventForm } from "@/components/organizer/create-event-form";

export default function CreateEventPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold ">Create New Event</h1>
        <p className="text-muted-foreground">
          Fill in the details to create your event
        </p>
      </div>

      <Suspense fallback={<div>Loading form...</div>}>
        <CreateEventForm />
      </Suspense>
    </div>
  );
}

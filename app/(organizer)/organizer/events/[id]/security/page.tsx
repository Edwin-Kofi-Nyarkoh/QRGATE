import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { SecurityOfficersManagement } from "@/components/organizer/security-officers-management";

interface SecurityPageProps {
  params: Promise<{ id: string }>;
}

export default async function SecurityPage({ params }: SecurityPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Await params for dynamic route
  const { id } = await params;

  // Verify the user owns this event
  const event = await prisma.event.findFirst({
    where: {
      id: id,
      organizerId: session.user.id,
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!event) {
    redirect("/organizer/events");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Security Management
        </h1>
        <p className="text-muted-foreground">
          Manage security officers and ticket verification for your event.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <SecurityOfficersManagement
          eventId={event.id}
          eventTitle={event.title}
        />
      </Suspense>
    </div>
  );
}

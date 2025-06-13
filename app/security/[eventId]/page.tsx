import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanTicket } from "@/components/security/scanticket";
import { SecurityOfficerPage } from "@/components/security/security-officer-page";
import { Loader2 } from "lucide-react";

interface SecurityPageProps {
  params: {
    eventId: string;
  };
}

async function getEvent(eventId: string) {
  return prisma.event.findUnique({
    where: { id: eventId },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
}

async function checkSecurityAccess(userId: string, eventId: string) {
  // Check if the user is assigned as a security officer for this event
  const securityOfficer = await prisma.securityOfficer.findFirst({
    where: {
      userId,
      eventId,
      active: true,
    },
  });

  // Check if the user is the organizer of the event
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organizerId: true },
  });

  // Check if the user is an admin
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  return {
    isSecurityOfficer: !!securityOfficer,
    isOrganizer: event?.organizerId === userId,
    isAdmin: user?.role === "ADMIN",
  };
}

export default async function SecurityPage({ params }: SecurityPageProps) {
  const { eventId } = params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p>You must be logged in to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const event = await getEvent(eventId);
  if (!event) {
    notFound();
  }

  const { isSecurityOfficer, isOrganizer, isAdmin } = await checkSecurityAccess(
    session.user.id,
    eventId
  );

  if (!isSecurityOfficer && !isOrganizer && !isAdmin) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-10 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p>
              You are not authorized to access the security page for this event.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{event.title} - Security</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Event Date: {new Date(event.startDate).toLocaleDateString()} to{" "}
            {new Date(event.endDate).toLocaleDateString()}
          </p>
          <p className="text-gray-500">Location: {event.location}</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="scan">
        <TabsList className="mb-6">
          <TabsTrigger value="scan">Scan Tickets</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="scan">
          <Suspense fallback={<LoadingState />}>
            <ScanTicket eventId={eventId} />
          </Suspense>
        </TabsContent>
        <TabsContent value="stats">
          <Suspense fallback={<LoadingState />}>
            <SecurityOfficerPage eventId={eventId} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex justify-center py-10">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

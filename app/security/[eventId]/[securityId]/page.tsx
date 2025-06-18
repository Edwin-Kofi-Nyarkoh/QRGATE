import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { SecurityOfficerVerificationPage } from "@/components/security/security-officer-verification-page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";

interface SecurityVerificationPageProps {
  params: {
    eventId: string;
    securityId: string;
  };
}

async function validateSecurityAccess(eventId: string, securityId: string) {
  try {
    // Verify that the security officer exists and is assigned to this event
    const securityOfficer = await prisma.securityOfficer.findFirst({
      where: {
        id: securityId,
        eventId: eventId,
        active: true, // Only active officers can access
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profileImage: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            location: true,
            startDate: true,
            endDate: true,
            mainImage: true,
            status: true,
            totalTickets: true,
            soldTickets: true,
            organizer: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return securityOfficer;
  } catch (error) {
    console.error("Error validating security access:", error);
    return null;
  }
}

function UnauthorizedAccess() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-800">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            You don't have permission to access this security verification
            portal.
          </p>
          <div className="text-sm text-gray-500 space-y-2">
            <p>This could be because:</p>
            <ul className="list-disc list-inside text-left space-y-1">
              <li>You're not assigned as a security officer for this event</li>
              <li>Your security officer account has been deactivated</li>
              <li>The event or security link is invalid</li>
              <li>The event has ended or been cancelled</li>
            </ul>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Please contact the event organizer if you believe this is an error.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function SecurityVerificationPage({
  params,
}: SecurityVerificationPageProps) {
  const { eventId, securityId } = params;

  // Validate that both parameters exist
  if (!eventId || !securityId) {
    return <UnauthorizedAccess />;
  }

  // Validate security officer access
  const securityData = await validateSecurityAccess(eventId, securityId);

  if (!securityData) {
    return <UnauthorizedAccess />;
  }

  // Check if event is still active (not cancelled or completed)
  if (securityData.event.status === "CANCELLED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <CardTitle className="text-xl text-yellow-800">
              Event Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-4">
              The event "{securityData.event.title}" has been cancelled.
            </p>
            <p className="text-sm text-gray-500">
              Ticket verification is no longer available for this event.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with event and officer info */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Security Verification
                </h1>
                <p className="text-sm text-gray-600">
                  {securityData.event.title}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {securityData.name}
              </p>
              <p className="text-xs text-gray-500">Security Officer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <SecurityOfficerVerificationPage
            eventId={eventId}
            securityId={securityId}
            eventData={securityData.event}
            officerData={{
              ...securityData,
              phone: securityData.phone ?? "",
              user: {
                ...securityData.user,
                profileImage: securityData.user?.profileImage ?? "",
              },
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata(props: {
  params: { eventId: string; securityId: string };
}) {
  const params = await props.params;
  const { eventId, securityId } = params;

  const securityData = await validateSecurityAccess(eventId, securityId);

  if (!securityData) {
    return {
      title: "Access Denied - Security Verification",
      description: "Unauthorized access to security verification portal",
    };
  }

  return {
    title: `Security Verification - ${securityData.event.title}`,
    description: `Ticket verification portal for ${securityData.event.title}`,
  };
}

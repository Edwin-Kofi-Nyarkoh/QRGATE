import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanTicket } from "@/components/security/scan-ticket";
import { SecurityOfficerPage } from "@/components/security/security-officer-page";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface SecurityPageProps {
  params: Promise<{ eventId: string }>;
}

function LoadingState() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function SecurityPage({ params }: SecurityPageProps) {
  const { eventId } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Security Officer Portal
          </h1>
          <p className="text-gray-600">
            Scan and verify tickets for event entry.
          </p>
        </div>

        <Tabs defaultValue="scan" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="scan" className="flex items-center gap-2">
              <span>🎯</span>
              Scan Tickets
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <span>📊</span>
              Statistics
            </TabsTrigger>
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
    </div>
  );
}

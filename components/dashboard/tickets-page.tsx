"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Download,
  QrCode,
  Search,
  Filter,
} from "lucide-react";
import { useUserTickets } from "@/lib/services";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { formatDateTime } from "@/lib/date-utils";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Loader } from "@/components/ui/loader";

export function TicketsPage() {
  const { data: session } = useSession();
  const params = useSearchParams();
  const orderId = params.get("order");
  const { data: tickets = [], isLoading } = useUserTickets(
    session?.user?.id || "",
    orderId || ""
  );
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.event?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.event?.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingTickets = filteredTickets.filter(
    (ticket) =>
      ticket.event &&
      new Date(ticket.event.startDate) > new Date() &&
      !ticket.isUsed
  );

  const pastTickets = filteredTickets.filter(
    (ticket) =>
      ticket.event &&
      (new Date(ticket.event.endDate) < new Date() || ticket.isUsed)
  );

  const handleDownloadTicket = async (ticketId: string) => {
    try {
      // In a real app, this would download the ticket PDF
      console.log("Downloading ticket:", ticketId);
    } catch (error) {
      console.error("Error downloading ticket:", error);
    }
  };

  const handleShowQRCode = (ticket: any) => {
    // Create a modal or new window to display the QR code
    if (ticket.qrCode) {
      const newWindow = window.open("", "_blank", "width=400,height=400");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Ticket QR Code</title></head>
            <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: Arial, sans-serif;">
              <h2>Ticket QR Code</h2>
              <img src="${
                ticket.qrCode
              }" alt="QR Code" style="max-width: 300px; max-height: 300px;" />
              <p>Ticket #${ticket.id.slice(-6)}</p>
              <p>${ticket.event?.title}</p>
            </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loader variant="spinner" size="lg" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <p className="text-muted-foreground">
          View and manage your event tickets
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingTickets.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({pastTickets.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingTickets.length > 0 ? (
            <div className="grid gap-4">
              {upcomingTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onDownload={handleDownloadTicket}
                  onShowQRCode={handleShowQRCode}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No upcoming tickets
                </h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any tickets for upcoming events.
                </p>
                <Button asChild>
                  <a href="/events">Browse Events</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past">
          {pastTickets.length > 0 ? (
            <div className="grid gap-4">
              {pastTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  onDownload={handleDownloadTicket}
                  onShowQRCode={handleShowQRCode}
                  isPast
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No past tickets</h3>
                <p className="text-muted-foreground">
                  Your attended events will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface TicketCardProps {
  ticket: any;
  onDownload: (ticketId: string) => void;
  onShowQRCode: (ticket: any) => void;
  isPast?: boolean;
}

function TicketCard({
  ticket,
  onDownload,
  onShowQRCode,
  isPast = false,
}: TicketCardProps) {
  return (
    <Card className={isPast ? "opacity-75" : ""}>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <Image
              src={
                ticket.event?.mainImage || "/placeholder.svg?height=96&width=96"
              }
              alt={ticket.event?.title || "Event"}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {ticket.event?.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {ticket.event?.startDate &&
                      formatDateTime(ticket.event.startDate)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {ticket.event?.location}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={ticket.isUsed ? "secondary" : "default"}>
                    {ticket.type}
                  </Badge>
                  {ticket.isUsed && <Badge variant="outline">Used</Badge>}
                  {isPast && !ticket.isUsed && (
                    <Badge variant="destructive">Expired</Badge>
                  )}
                  {ticket.order?.status === "COMPLETED" && (
                    <Badge variant="outline" className="text-green-600">
                      Paid
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-lg">
                  ${ticket.price?.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ticket #{ticket.id?.slice(-6)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(ticket.id)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowQRCode(ticket)}
              disabled={!ticket.qrCode}
            >
              <QrCode className="h-4 w-4 mr-2" />
              QR Code
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

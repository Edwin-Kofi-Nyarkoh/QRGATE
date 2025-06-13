"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  MapPin,
  Download,
  QrCode,
  Search,
  Filter,
} from "lucide-react";
import { useCurrentUser, useUserTickets } from "@/lib/services";
import { useState } from "react";
import { formatDateTime } from "@/lib/date-utils";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Loader } from "@/components/ui/loader";

// Define a type for ticket if not already defined
interface Ticket {
  id: string;
  qrCode: string;
  type: string;
  price: number;
  isUsed: boolean;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
  eventId: string;
  userId: string;
  orderId: string;
  ticketTypeId: string;
  event?: {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
    mainImage: string;
  };
  user?: {
    id: string;
    name: string;
    email: string;
  };
  order?: {
    id: string;
    status: string;
    total: number;
  };
}

export function TicketsPage() {
  const { data: user } = useCurrentUser();
  const params = useSearchParams();
  const orderId = params.get("order");
  const { data: tickets = [], isLoading } = useUserTickets(
    user?.id ? user.id : undefined,
    orderId ? orderId : undefined
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Filter state
  const [search, setSearch] = useState<string>("");
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Unique event titles and types for dropdowns
  const eventOptions: string[] = Array.from(
    new Set(tickets?.map((t: Ticket) => t.event?.title).filter(Boolean))
  ) as string[];
  const typeOptions: string[] = Array.from(
    new Set(tickets?.map((t: Ticket) => t.type).filter(Boolean))
  ) as string[];
  const statusOptions: string[] = Array.from(
    new Set(tickets?.map((t: Ticket) => t.order?.status).filter(Boolean))
  ) as string[];

  // Filtering logic (applied only if filter is set)
  const filteredTickets = tickets?.filter((ticket: Ticket) => {
    if (
      search &&
      !(
        ticket?.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        ticket?.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        ticket?.qrCode?.toLowerCase().includes(search.toLowerCase())
      )
    )
      return false;
    if (eventFilter !== "all" && ticket?.event?.title !== eventFilter)
      return false;
    if (statusFilter !== "all" && ticket?.order?.status !== statusFilter)
      return false;
    if (typeFilter !== "all" && ticket?.type !== typeFilter) return false;
    return true;
  });

  const now = new Date();
  const upcomingTickets = filteredTickets?.filter(
    (ticket: Ticket) =>
      ticket?.event && new Date(ticket.event.endDate) >= now && !ticket.isUsed
  );

  const pastTickets = filteredTickets?.filter(
    (ticket: Ticket) =>
      ticket?.event && new Date(ticket.event.endDate) < now && !ticket.isUsed
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
    if (ticket?.qrCode) {
      const newWindow = window.open("", "_blank", "width=400,height=400");
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head><title>Ticket QR Code</title></head>
            <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: Arial, sans-serif;">
              <h2>Ticket QR Code</h2>
              <img src="${
                ticket?.qrCode
              }" alt="QR Code" style="max-width: 300px; max-height: 300px;" />
              <p>Ticket #${ticket?.id.slice(-6)}</p>
              <p>${ticket?.event?.title}</p>
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

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <Input
          placeholder="Search by name, email, or QR code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <Select value={eventFilter} onValueChange={setEventFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {eventOptions.map((ev) => (
              <SelectItem key={ev} value={ev}>
                {ev}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOptions.map((st) => (
              <SelectItem key={st} value={st}>
                {st}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {typeOptions.map((tp) => (
              <SelectItem key={tp} value={tp}>
                {tp}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingTickets?.length})
          </TabsTrigger>
          <TabsTrigger value="past">Past ({pastTickets?.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {upcomingTickets?.length > 0 ? (
            <div className="grid gap-4">
              {upcomingTickets?.map((ticket: Ticket) => (
                <TicketCard
                  key={ticket?.id}
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
          {pastTickets?.length > 0 ? (
            <div className="grid gap-4">
              {pastTickets?.map((ticket: Ticket) => (
                <TicketCard
                  key={ticket?.id}
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
                ticket?.event?.mainImage ||
                "/placeholder.svg?height=96&width=96"
              }
              alt={ticket?.event?.title || "Event"}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {ticket?.event?.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {ticket?.event?.startDate &&
                      formatDateTime(ticket?.event.startDate)}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {ticket?.event?.location}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={ticket?.isUsed ? "secondary" : "default"}>
                    {ticket?.type}
                  </Badge>
                  {ticket?.isUsed && <Badge variant="outline">Used</Badge>}
                  {isPast && !ticket?.isUsed && (
                    <Badge variant="destructive">Expired</Badge>
                  )}
                  {ticket?.order?.status === "COMPLETED" && (
                    <Badge variant="outline" className="text-green-600">
                      Paid
                    </Badge>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-lg">
                  Ghc{ticket?.price?.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Ticket #{ticket?.id?.slice(-6)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(ticket?.id)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onShowQRCode(ticket)}
              disabled={!ticket?.qrCode}
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

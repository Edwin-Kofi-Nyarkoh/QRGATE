"use client";

import { useState } from "react";
import { useEvent } from "@/lib/api/events";
import { useEventTickets } from "@/lib/api/tickets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PageLoader, Loader } from "@/components/ui/loader";
import {
  Search,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { formatDate } from "@/lib/date-utils";
import { Ticket } from "@/lib/services";

interface AttendeeManagementPageProps {
  eventId: string;
}

export function AttendeeManagementPage({
  eventId,
}: AttendeeManagementPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: ticketsData, isLoading: ticketsLoading } = useEventTickets(
    eventId,
    currentPage,
    20
  );

  const filteredTickets =
    ticketsData?.data?.filter(
      (ticket: Ticket) =>
        ticket.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket?.qrCode?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleExportAttendees = () => {
    if (!ticketsData?.data) return;

    const csvContent = [
      [
        "Name",
        "Email",
        "Phone",
        "Ticket ID",
        "Purchase Date",
        "Status",
        "Scanned",
      ],
      ...ticketsData?.data?.map((ticket: Ticket) => [
        ticket.user?.name || "N/A",
        ticket.user?.email || "N/A",
        ticket.user?.phone || "N/A",
        ticket.qrCode,
        formatDate(ticket.createdAt),
        ticket.status,
        ticket.scanned ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event?.title}-attendees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (eventLoading) return <PageLoader />;

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-destructive mb-2">
          Event Not Found
        </h2>
        <p className="text-muted-foreground mb-4">
          The event you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link href="/organizer/events">Back to Events</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="sm">
          <Link href="/organizer/events">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Event Attendees</h1>
          <p className="text-muted-foreground">{event.title}</p>
        </div>
      </div>

      {/* Event Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Event Date</p>
                <p className="font-semibold">{formatDate(event.startDate)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold">{event.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="font-semibold">
                  {event.soldTickets}/{event.totalTickets}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Checked In</p>
                <p className="font-semibold">
                  {ticketsData?.data?.filter(
                    (t: { scanned: boolean }) => t.scanned
                  ).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search attendees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleExportAttendees} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendees ({filteredTickets?.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {ticketsLoading ? (
            <div className="flex justify-center py-8">
              <Loader size="lg" />
            </div>
          ) : filteredTickets?.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No attendees found</h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Try adjusting your search"
                  : "No tickets have been purchased yet"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attendee</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check-in</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets?.map((ticket: Ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={ticket.user?.image || ""} />
                          <AvatarFallback>
                            {ticket.user?.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {ticket.user?.name || "Unknown"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {ticket.user?.email || "No email"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="w-3 h-3 mr-1" />
                          {ticket.user?.email || "N/A"}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="w-3 h-3 mr-1" />
                          {ticket.user?.phone || "N/A"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {ticket.qrCode}
                      </code>
                    </TableCell>
                    <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ticket.status === "VALID" ? "default" : "destructive"
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {ticket?.scanned ? (
                          <div className="flex items-center text-primary">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">Checked In</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-muted-foreground">
                            <XCircle className="w-4 h-4 mr-1" />
                            <span className="text-sm">Not Checked In</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {ticketsData && ticketsData?.pagination?.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {Array.from(
            { length: ticketsData?.pagination?.pages },
            (_, i) => i + 1
          ).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, ticketsData?.pagination?.pages)
              )
            }
            disabled={currentPage === ticketsData?.pagination?.pages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

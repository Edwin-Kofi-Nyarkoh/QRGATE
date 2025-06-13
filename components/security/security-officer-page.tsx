"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useEventTickets } from "@/lib/api/tickets";
import { Loader2, CheckCircle } from "lucide-react";
import { formatDate, formatTime } from "@/lib/date-utils";

interface SecurityOfficerPageProps {
  eventId: string;
}

export function SecurityOfficerPage({ eventId }: SecurityOfficerPageProps) {
  const [stats, setStats] = useState({
    totalTickets: 0,
    scannedTickets: 0,
    validTickets: 0,
    invalidTickets: 0,
  });

  const { data: ticketsData, isLoading } = useEventTickets(eventId);

  useEffect(() => {
    if (ticketsData?.tickets) {
      const tickets = ticketsData.tickets;
      const scanned = tickets.filter((ticket: any) => ticket.isUsed);

      setStats({
        totalTickets: tickets.length,
        scannedTickets: scanned.length,
        validTickets: scanned.filter((ticket: any) => !ticket.isUsed).length,
        invalidTickets: scanned.filter((ticket: any) => ticket.isUsed).length,
      });
    }
  }, [ticketsData]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const tickets = ticketsData?.tickets || [];
  const scannedPercentage =
    stats.totalTickets > 0
      ? Math.round((stats.scannedTickets / stats.totalTickets) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Scanned Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.scannedTickets}</div>
            <Progress value={scannedPercentage} className="h-2 mt-2" />
            <p className="text-xs text-gray-500 mt-1">
              {scannedPercentage}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Valid Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.validTickets}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Invalid Attempts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.invalidTickets}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ticket Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Tickets</TabsTrigger>
              <TabsTrigger value="scanned">Scanned</TabsTrigger>
              <TabsTrigger value="unscanned">Not Scanned</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <TicketTable tickets={tickets} />
            </TabsContent>

            <TabsContent value="scanned">
              <TicketTable
                tickets={tickets.filter((ticket: any) => ticket.isUsed)}
              />
            </TabsContent>

            <TabsContent value="unscanned">
              <TicketTable
                tickets={tickets.filter((ticket: any) => !ticket.isUsed)}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function TicketTable({ tickets }: { tickets: any[] }) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">No tickets found.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Attendee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Scanned At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket: any) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-mono text-xs">
                {ticket.id.substring(0, 8)}...
              </TableCell>
              <TableCell>{ticket.ticketType?.name || ticket.type}</TableCell>
              <TableCell>{ticket.user?.name || "N/A"}</TableCell>
              <TableCell>
                {ticket.isUsed ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Scanned
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-gray-50 text-gray-700 border-gray-200"
                  >
                    Not Scanned
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {ticket.usedAt ? (
                  <span className="text-xs">
                    {formatDate(ticket.usedAt)} at {formatTime(ticket.usedAt)}
                  </span>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

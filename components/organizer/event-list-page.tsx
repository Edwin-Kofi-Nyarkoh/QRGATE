"use client";

import type React from "react";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useEvents } from "@/lib/api/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoader } from "@/components/ui/loader";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  MapPin,
  Users,
  Edit,
  Eye,
  Trash2,
  MoreHorizontal,
  BadgeCent,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/date-utils";
import { useDeleteEvent } from "@/lib/api/events";
import { toast } from "@/hooks/use-toast";

const statusOptions = [
  "All Status",
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
];
const categoryOptions = [
  "All Categories",
  "conference",
  "workshop",
  "seminar",
  "networking",
  "concert",
  "festival",
  "exhibition",
  "sports",
  "charity",
  "other",
];

export function EventListPage() {
  const { data: session } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const deleteEventMutation = useDeleteEvent();

  const filters = {
    page: currentPage,
    limit: 10,
    organizerId: session?.user?.id,
    search: searchTerm || undefined,
    status: selectedStatus !== "All Status" ? selectedStatus : undefined,
    category:
      selectedCategory !== "All Categories" ? selectedCategory : undefined,
  };

  const { data: eventsData, isLoading, error } = useEvents(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this event? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteEventMutation.mutateAsync(eventId);
      toast({
        title: "Event deleted",
        description: "The event has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "UPCOMING":
        return "default";
      case "ONGOING":
        return "secondary";
      case "COMPLETED":
        return "outline";
      case "CANCELLED":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6 md:p-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground">Manage and track your events</p>
        </div>
        <Button asChild>
          <Link href="/organizer/events/create">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit">
                <Filter className="w-4 h-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <PageLoader />
        </div>
      ) : // Error State
      error ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-destructive mb-2">
            Error Loading Events
          </h2>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      ) : eventsData?.events?.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No events found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ||
              selectedStatus !== "All Status" ||
              selectedCategory !== "All Categories"
                ? "Try adjusting your filters"
                : "Create your first event to get started"}
            </p>
            <Button asChild>
              <Link href="/organizer/events/create">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {eventsData?.events?.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Event Image */}
                  <div className="relative w-full lg:w-48 h-32 lg:h-24 rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={
                        event.mainImage ||
                        "/placeholder.svg?height=100&width=200"
                      }
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h3 className="text-xl font-semibold line-clamp-1">
                          {event.title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(event.status)}>
                          {event.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/events/${event.id}`}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Event
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/organizer/events/${event.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Event
                              </Link>
                            </DropdownMenuItem>
                            {/* Security Officers */}
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/organizer/events/${event.id}/security`}
                              >
                                <Users className="w-4 h-4 mr-2" />
                                View Ticket Security Officers
                              </Link>
                            </DropdownMenuItem>
                            {/* Attendees */}
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/organizer/events/${event.id}/attendees`}
                              >
                                <Users className="w-4 h-4 mr-2" />
                                View Attendees
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteEvent(event.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Event
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(event.startDate)}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        {event.soldTickets}/{event.totalTickets} sold
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <BadgeCent className="w-4 h-4 mr-2" />
                        Ghc
                        {(event.soldTickets * event.price).toFixed(2)} revenue
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {eventsData && eventsData?.pagination?.pages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          {Array.from(
            { length: eventsData?.pagination?.pages },
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
                Math.min(prev + 1, eventsData?.pagination?.pages)
              )
            }
            disabled={currentPage === eventsData?.pagination?.pages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Results Info */}
      {eventsData && (
        <div className="text-center text-muted-foreground">
          Showing {eventsData?.data?.length} of {eventsData?.pagination?.total}{" "}
          events
        </div>
      )}
    </div>
  );
}

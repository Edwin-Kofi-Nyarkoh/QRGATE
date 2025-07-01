"use client";

import type React from "react";

import { useState } from "react";
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Search, Filter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/lib/date-utils";
import { CartItem, useCartStore } from "@/lib/store/cart-store";
import { toast } from "sonner";
import { Event } from "@/lib/services";
import { TicketTypeSelector } from "@/components/ui/ticket-type-selector";
import { Skeleton } from "../ui/skeleton";

const categories = [
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

const statusOptions = ["All Status", "UPCOMING", "ONGOING", "COMPLETED"];

export function EventsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [sortBy, setSortBy] = useState("startDate");
  const [selectedTicketTypeIds, setSelectedTicketTypeIds] = useState<
    Record<string, string>
  >({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { addItem } = useCartStore();

  const filters = {
    page: currentPage,
    limit: 12,
    search: searchTerm || undefined,
    category:
      selectedCategory !== "All Categories" ? selectedCategory : undefined,
    status: selectedStatus !== "All Status" ? selectedStatus : undefined,
  };

  const { data: eventsData, isLoading, error } = useEvents(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };
  const availableTickets =
    (eventsData?.totalTickets ?? 0) - (eventsData?.soldTickets ?? 0);

  const handleTicketSelect = (eventId: string, typeId: string, qty: number) => {
    setSelectedTicketTypeIds((prev) => ({ ...prev, [eventId]: typeId }));
    setQuantities((prev) => ({ ...prev, [eventId]: qty }));
  };

  const handleAddToCart = (event: Event) => {
    const ticketTypeId =
      selectedTicketTypeIds[event.id] || event.ticketTypes?.[0]?.id;
    const ticketType = event.ticketTypes?.find((t) => t.id === ticketTypeId);
    const quantity = quantities[event.id] || 1;
    if (!ticketType) return;
    addItem({
      id: `${event.id}-${ticketType.id}-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventImage: event.mainImage || undefined,
      eventDate: event.startDate.toString(),
      eventLocation: event.location,
      ticketType: ticketType.name,
      ticketTypeId: ticketType.id,
      price: ticketType.price,
      quantity: quantity,
      maxQuantity: Math.min(10, ticketType.quantity - ticketType.soldCount),
      title: event.title,
      image: event.mainImage || "",
      startDate: event.startDate.toString(),
    });
    toast("Added to cart", {
      description: `${quantity} ${ticketType.name} ticket${
        quantity > 1 ? "s" : ""
      } for ${event.title}`,
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Events
          </h1>
          <p className="">Please try again later.</p>
        </div>
      </div>
    );
  }

  console.log("Ticket Types:", eventsData?.events);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Events</h1>
        <p className="">Discover amazing events happening around you</p>
      </div>

      {/* Filters */}
      <div className="bg-background rounded-lg shadow-sm p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2  w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <Button type="submit" className=" hover:bg-primary">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </form>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <Skeleton className="h-48  rounded-t-lg" />
              <CardHeader>
                <Skeleton className="h-4  rounded w-3/4" />
                <Skeleton className="h-3  rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-3  rounded" />
                  <Skeleton className="h-3  rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {eventsData?.events?.map((event) => {
              const ticketTypes = event.ticketTypes || [
                {
                  id: "standard",
                  name: "Standard",
                  price: event.price,
                  quantity: event.totalTickets,
                  soldCount: event.soldTickets,
                  description: "Standard admission ticket",
                },
              ];
              const selectedTypeId =
                selectedTicketTypeIds[event.id] || ticketTypes[0].id;
              const selectedType =
                ticketTypes.find((t) => t.id === selectedTypeId) ||
                ticketTypes[0];
              const availableTickets =
                selectedType.quantity - selectedType.soldCount;
              const quantity = quantities[event.id] || 1;
              return (
                <Card
                  key={event.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative h-48">
                    <Image
                      src={
                        event.mainImage ||
                        "/placeholder.svg?height=200&width=300"
                      }
                      alt={event.title}
                      fill
                      className="object-cover"
                    />
                    <Badge
                      className={`absolute top-2 right-2 ${
                        event.status === "UPCOMING"
                          ? "bg-green-500"
                          : event.status === "ONGOING"
                          ? "bg-blue-500"
                          : event.status === "COMPLETED"
                          ? "bg-gray-500"
                          : "bg-red-500"
                      }`}
                    >
                      {event.status}
                    </Badge>
                  </div>

                  <CardHeader>
                    <h3 className="font-semibold text-lg line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-sm  line-clamp-2">{event.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm ">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(event.startDate)}
                    </div>
                    <div className="flex items-center text-sm ">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-sm ">
                      <Users className="w-4 h-4 mr-2" />
                      {event.totalTickets - event.soldTickets} tickets left
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        Ghc{event.price}
                      </span>
                      <Badge variant="secondary">{event.category}</Badge>
                    </div>
                    {event.ticketTypes && event.ticketTypes.length > 0 && (
                      <div className="mb-3">
                        <TicketTypeSelector
                          ticketTypes={ticketTypes}
                          onSelect={(typeId, qty) =>
                            handleTicketSelect(event.id, typeId, qty)
                          }
                          initialTypeId={selectedTypeId}
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/events/${event.id}`}>View Details</Link>
                    </Button>
                    <Button
                      onClick={() => handleAddToCart(event)}
                      className="flex-1"
                      disabled={availableTickets <= 0}
                    >
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {eventsData && eventsData?.pagination?.pages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-8">
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
                  className={
                    currentPage === page ? "bg-background hover:bg-primary" : ""
                  }
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
            <div className="text-center  mt-4">
              Showing {eventsData?.data?.length} of{" "}
              {eventsData?.pagination?.total} events
            </div>
          )}
        </>
      )}
    </div>
  );
}

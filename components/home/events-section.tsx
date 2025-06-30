"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Ticket, Plus, Minus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useFeaturedEvents,
  useUpcomingEvents,
  useOngoingEvents,
} from "@/lib/api/events";
import { formatDate } from "@/lib/date-utils";
import { useCartStore } from "@/lib/store/cart-store";
import type { Event } from "@/lib/types/api";
import { toast } from "sonner";
import { TicketTypeSelector } from "@/components/ui/ticket-type-selector";
import { EventsPageSkeleton } from "../events/events-page-skeleton";

export function EventsSection() {
  const { data: upcomingEvents = [], isLoading: upcomingLoading } =
    useUpcomingEvents();
  const { data: featuredEvents = [], isLoading: featuredLoading } =
    useFeaturedEvents();
  const { data: ongoingEvents = [], isLoading: ongoingLoading } =
    useOngoingEvents();

  if (upcomingLoading || featuredLoading || ongoingLoading) {
    return <EventsPageSkeleton />;
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Ongoing Events */}
        {ongoingEvents.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                Live Events
              </h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/events?dateFilter=ongoing">VIEW ALL</Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingEvents.map((event) => (
                <EventCard key={event.id} event={event} isLive />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                Upcoming Events
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  LIST VIEW
                </Button>
                <Button variant="outline" size="sm">
                  GRID VIEW
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {upcomingEvents.slice(0, 2).map((event) => (
                <EventCard key={event.id} event={event} featured />
              ))}
            </div>
          </div>
        )}

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Ticket className="w-6 h-6" />
                Featured Events
              </h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  ←
                </Button>
                <Button variant="ghost" size="sm">
                  →
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/events">DISCOVER EVENTS</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

interface EventCardProps {
  event: Event;
  featured?: boolean;
  isLive?: boolean;
}

function EventCard({
  event,
  featured = false,
  isLive = false,
}: EventCardProps) {
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<string>(
    event.ticketTypes && event.ticketTypes.length > 0
      ? event.ticketTypes[0].id
      : "standard"
  );
  const [quantity, setQuantity] = useState(1);
  const { addItem, items } = useCartStore();

  // Find if this event is already in cart with the selected ticket type
  const isInCart = items.some(
    (item) =>
      item.eventId === event.id && item.ticketTypeId === selectedTicketTypeId
  );

  // Get the selected ticket type object
  const selectedTicketType = event.ticketTypes?.find(
    (type) => type.id === selectedTicketTypeId
  ) || {
    id: "standard",
    name: "Standard",
    price: event.price,
    quantity: event.totalTickets,
    soldCount: event.soldTickets,
    description: "Standard admission ticket",
  };

  const availableTickets =
    selectedTicketType.quantity - selectedTicketType.soldCount;

  const handleTicketSelect = (typeId: string, qty: number) => {
    setSelectedTicketTypeId(typeId);
    setQuantity(qty);
  };

  const handleAddToCart = () => {
    addItem({
      id: `${event.id}-${selectedTicketType.id}-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventImage: event.mainImage || undefined,
      eventDate: event.startDate.toString(),
      eventLocation: event.location,
      ticketType: selectedTicketType.name,
      ticketTypeId: selectedTicketType.id,
      price: selectedTicketType.price,
      quantity: quantity,
      maxQuantity: Math.min(10, availableTickets),
      title: event.title,
      image: event.mainImage || "",
      startDate: event.startDate.toString(),
    });
    toast.success("Added to cart", {
      description: `${quantity} ${selectedTicketType.name} ticket${
        quantity > 1 ? "s" : ""
      } for ${event.title}`,
    });
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative">
        <Link href={`/events/${event.id}`}>
          <Image
            src={event.mainImage || "/placeholder.svg?height=200&width=400"}
            alt={event.title}
            width={featured ? 400 : 300}
            height={featured ? 200 : 200}
            className="w-full h-48 object-cover hover:scale-105 transition-transform"
          />
        </Link>
        <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded text-center">
          <div className="text-xl font-bold">
            {new Date(event.startDate).getDate()}
          </div>
          <div className="text-xs">
            {new Date(event.startDate).toLocaleString("default", {
              month: "short",
            })}
          </div>
        </div>
        {isLive && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            LIVE
          </div>
        )}
        <div className="absolute bottom-4 left-4 flex gap-2">
          <Badge className="bg-blue-500">
            {event._count?.tickets || 0} Attendees
          </Badge>
          <Badge className="bg-green-500">{event.location}</Badge>
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2 line-clamp-2">{event.title}</h3>
        <div className="flex items-center justify-between text-sm text-primary mb-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {event._count?.tickets || 0}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDate(event.startDate)}
            </span>
          </div>
        </div>

        {/* Ticket Type Selection */}
        {event.ticketTypes && event.ticketTypes.length > 0 && (
          <div className="mb-3">
            <TicketTypeSelector
              ticketTypes={event.ticketTypes}
              onSelect={handleTicketSelect}
              initialTypeId={selectedTicketTypeId}
            />
          </div>
        )}
        <div className="flex items-center justify-between mt-4">
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={availableTickets === 0 || isInCart}
            className="w-full"
          >
            {isInCart ? "In Cart" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

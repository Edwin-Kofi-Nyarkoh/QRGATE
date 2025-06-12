"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, Ticket, Plus } from "lucide-react";
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

export function EventsSection() {
  const { data: upcomingEvents = [], isLoading: upcomingLoading } =
    useUpcomingEvents();
  const { data: featuredEvents = [], isLoading: featuredLoading } =
    useFeaturedEvents();
  const { data: ongoingEvents = [], isLoading: ongoingLoading } =
    useOngoingEvents();
  const { addItem } = useCartStore();

  const handleAddToCart = (event: Event) => {
    addItem({
      eventId: event.id,
      eventTitle: event.title,
      eventImage: event.mainImage || undefined,
      eventDate: event.startDate.toString(),
      eventLocation: event.location,
      ticketType: "Standard",
      price: event.price,
      quantity: 1,
      // maxQuantity: Math.min(10, availableTickets),
      title: event.title,
      image: event.mainImage || "",
      startDate: event.startDate.toString(),
    });

    toast("Added to cart", {
      description: `${event.title} has been added to your cart`,
    });
  };

  if (upcomingLoading || featuredLoading || ongoingLoading) {
    return (
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Ongoing Events */}
        {ongoingEvents.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                Live Events
              </h2>
              <Button variant="outline" size="sm" asChild>
                <Link href="/events?status=ONGOING">VIEW ALL</Link>
              </Button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ongoingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onAddToCart={handleAddToCart}
                  isLive
                />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
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
                <EventCard
                  key={event.id}
                  event={event}
                  onAddToCart={handleAddToCart}
                  featured
                />
              ))}
            </div>
          </div>
        )}

        {/* Featured Events */}
        {featuredEvents.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
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
                <EventCard
                  key={event.id}
                  event={event}
                  onAddToCart={handleAddToCart}
                />
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
  onAddToCart: (event: Event) => void;
  featured?: boolean;
  isLive?: boolean;
}

function EventCard({
  event,
  onAddToCart,
  featured = false,
  isLive = false,
}: EventCardProps) {
  const availableTickets = event.totalTickets - event.soldTickets;

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative">
        <Image
          src={event.mainImage || "/placeholder.svg?height=200&width=400"}
          alt={event.title}
          width={featured ? 400 : 300}
          height={featured ? 200 : 200}
          className="w-full h-48 object-cover"
        />
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
        <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
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
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold text-orange-500">
              Ghc{event.price.toFixed(2)}
            </span>
            <p className="text-xs text-gray-500">
              {availableTickets} tickets left
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => onAddToCart(event)}
            disabled={availableTickets === 0}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

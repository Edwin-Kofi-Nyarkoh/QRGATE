"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Users,
  Ticket,
  Plus,
  Minus,
  ShoppingCart,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  useFeaturedEvents,
  useUpcomingEvents,
  useOngoingEvents,
} from "@/lib/api/events";
import { formatDate } from "@/lib/date-utils";
import { useCartStore } from "@/lib/store/cart-store";
import type { Event, TicketType } from "@/lib/types/api";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EventsSection() {
  const { data: upcomingEvents = [], isLoading: upcomingLoading } =
    useUpcomingEvents();
  const { data: featuredEvents = [], isLoading: featuredLoading } =
    useFeaturedEvents();
  const { data: ongoingEvents = [], isLoading: ongoingLoading } =
    useOngoingEvents();
  const { addItem, items } = useCartStore();

  const handleAddToCart = (event: Event, ticketTypeId?: string) => {
    // Find the selected ticket type or use the first one
    const ticketType = event.ticketTypes?.find((t) => t.id === ticketTypeId) ||
      event.ticketTypes?.[0] || {
        id: "",
        name: "Standard",
        price: event.price,
        quantity: event.totalTickets - event.soldTickets,
        soldCount: 0, // Fix: add soldCount property
      };

    const availableTickets = ticketType.quantity - (ticketType.soldCount || 0);

    addItem({
      id: `${event.id}-${ticketType.id || "standard"}-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventImage: event.mainImage || undefined,
      eventDate: event.startDate.toString(),
      eventLocation: event.location,
      ticketType: ticketType.name,
      ticketTypeId: ticketType.id,
      price: ticketType.price,
      quantity: 1,
      maxQuantity: Math.min(10, availableTickets),
      title: event.title,
      image: event.mainImage || "",
      startDate: event.startDate.toString(),
      getTotalPrice: function () {
        return this.price * this.quantity;
      },
    });

    toast.success("Added to cart", {
      description: `${event.title} - ${ticketType.name} ticket has been added to your cart`,
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
          </div>
        )}
      </div>
    </section>
  );
}

interface EventCardProps {
  event: Event;
  onAddToCart: (event: Event, ticketTypeId?: string) => void;
  featured?: boolean;
  isLive?: boolean;
}

function EventCard({ event, onAddToCart, featured, isLive }: EventCardProps) {
  const [selectedTicketType, setSelectedTicketType] = useState<string | null>(
    event.ticketTypes && event.ticketTypes.length > 0
      ? event.ticketTypes[0].id
      : null
  );
  const [quantity, setQuantity] = useState(1);
  const [showQuantity, setShowQuantity] = useState(false);
  const { items } = useCartStore();

  // Check if this event is in cart
  const cartItem = items.find(
    (item) =>
      item.eventId === event.id && item.ticketTypeId === selectedTicketType
  );

  // Get the selected ticket type object
  const ticketType = event.ticketTypes?.find(
    (type: TicketType) => type.id === selectedTicketType
  );

  // Calculate available tickets for the selected type
  const availableTickets = ticketType
    ? ticketType.quantity - ticketType.soldCount
    : event.totalTickets - event.soldTickets;

  const handleAddToCart = () => {
    if (showQuantity) {
      onAddToCart(event, selectedTicketType || undefined);
      setShowQuantity(false);
    } else {
      setShowQuantity(true);
    }
  };

  const incrementQuantity = () => {
    if (quantity < availableTickets) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
        featured ? "md:flex" : ""
      }`}
    >
      <div
        className={`relative ${
          featured ? "md:w-1/2" : "aspect-[16/9]"
        } overflow-hidden`}
      >
        <Link href={`/events/${event.id}`}>
          <Image
            src={event.mainImage || "/placeholder.svg?height=300&width=500"}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          {isLive && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE NOW
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <Badge
              variant="secondary"
              className="mb-2 capitalize bg-white/20 backdrop-blur-sm"
            >
              {event.category}
            </Badge>
          </div>
        </Link>
      </div>

      <CardContent
        className={`p-4 ${featured ? "md:w-1/2 md:p-6" : ""} space-y-4`}
      >
        <Link href={`/events/${event.id}`} className="hover:underline">
          <h3 className="font-bold text-lg line-clamp-2">{event.title}</h3>
        </Link>

        <div className="flex items-center text-sm text-gray-500 gap-4">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(event.startDate)}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {event._count?.tickets || 0}
          </div>
        </div>

        {featured && (
          <p className="text-gray-600 line-clamp-3">{event.description}</p>
        )}

        <div className="pt-2 space-y-3">
          {/* Ticket Type Selection */}
          {event.ticketTypes && event.ticketTypes.length > 1 && (
            <Select
              value={selectedTicketType || undefined}
              onValueChange={(value) => setSelectedTicketType(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select ticket type" />
              </SelectTrigger>
              <SelectContent>
                {event.ticketTypes.map((type: TicketType) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name} - Ghc{type.price.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">From</p>
              <p className="font-bold text-lg">
                Ghc{(ticketType?.price || event.price).toFixed(2)}
              </p>
            </div>

            {showQuantity ? (
              <div className="flex items-center border rounded-md">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                  className="rounded-r-none h-9 w-9"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <div className="flex-1 text-center py-1 px-2 min-w-[40px]">
                  {quantity}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={incrementQuantity}
                  disabled={quantity >= availableTickets}
                  className="rounded-l-none h-9 w-9"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={availableTickets <= 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {cartItem ? "In Cart" : "Add to Cart"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

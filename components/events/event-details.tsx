"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, MapPin, Share2, User, Users } from "lucide-react";
import { EventCountdown } from "@/components/events/event-countdown";
import { formatDate, formatTime } from "@/lib/date-utils";
import { ImageGallery } from "@/components/events/image-gallery";
import { BuyNowButton } from "@/components/events/buy-now-button";
import { useCartStore } from "@/lib/store/cart-store";
import { toast } from "sonner";
import { TicketTypeSelector } from "@/components/ui/ticket-type-selector";

interface EventDetailsProps {
  event: any; // Using any for simplicity, but should be properly typed
}

export function EventDetails({ event }: EventDetailsProps) {
  const [selectedTab, setSelectedTab] = useState("details");
  // Ticket type selection state and logic
  const [selectedTicketType, setSelectedTicketType] = useState(
    event.ticketTypes && event.ticketTypes.length > 0
      ? event.ticketTypes[0].id
      : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const { addItem, items } = useCartStore();

  // Get the selected ticket type object
  const ticketType = event.ticketTypes?.find(
    (type: any) => type.id === selectedTicketType
  ) || {
    id: "standard",
    name: "Standard",
    price: event.price,
    quantity: event.totalTickets,
    soldCount: event.soldTickets,
    description: "Standard admission ticket",
  };
  const availableTickets = ticketType.quantity - ticketType.soldCount;

  // Find if this event is already in cart with the selected ticket type
  const isInCart = items.some(
    (item) => item.eventId === event.id && item.ticketTypeId === ticketType.id
  );

  // Handler for ticket type selection
  const handleTicketSelect = (typeId: string, qty: number) => {
    setSelectedTicketType(typeId);
    setQuantity(qty);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

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

  // Compute event status for countdown
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  let eventStatus: "upcoming" | "live" | "ended" = "upcoming";
  if (now >= start && now <= end) {
    eventStatus = "live";
  } else if (now > end) {
    eventStatus = "ended";
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        {/* Left Column - Main Image and Gallery */}
        <div className="md:col-span-2">
          <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
            <Image
              src={event.mainImage || "/placeholder.svg?height=400&width=800"}
              alt={event.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <Tabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            className="mb-8"
          >
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(event.startDate)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(event.startDate)} - {formatTime(event.endDate)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {event._count.tickets} Attendees
                </Badge>
              </div>
              <p className=" whitespace-pre-line">{event.description}</p>
            </TabsContent>

            <TabsContent value="gallery">
              <ImageGallery images={event.images.map((img: any) => img.url)} />
            </TabsContent>

            <TabsContent value="location">
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe
                  title="Event Location"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyB5UXqcb2fcnW_6WeOTI4Qm7yPGpTUbhs4&q=${encodeURIComponent(
                    event.location
                  )}`}
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                ></iframe>
              </div>
              <p className="mt-4 ">{event.location}</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Event Info and Actions */}
        <div>
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Event Status and Countdown */}
              <div className="mb-2 flex flex-col items-center gap-1">
                <EventCountdown
                  startDate={new Date(event.startDate)}
                  endDate={new Date(event.endDate)}
                />
              </div>

              {/* Ticket Type Selection */}
              <TicketTypeSelector
                ticketTypes={ticketTypes}
                onSelect={handleTicketSelect}
                initialTypeId={selectedTicketType}
              />

              {/* Price Summary */}
              <div className="space-y-1 border-t pt-4">
                <div className="flex justify-between">
                  <span>Price per ticket:</span>
                  <span>Ghc{ticketType.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>Ghc{(ticketType.price * quantity).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={() => {
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
                      maxQuantity: Math.min(10, availableTickets),
                      title: event.title,
                      image: event.mainImage || "",
                      startDate: event.startDate.toString(),
                    });
                    toast.success("Added to cart", {
                      description: `${quantity} ${ticketType.name} ticket${
                        quantity > 1 ? "s" : ""
                      } for ${event.title}`,
                    });
                  }}
                  disabled={availableTickets <= 0 || isInCart}
                >
                  {isInCart ? "Already in Cart" : "Add to Cart"}
                </Button>
                <BuyNowButton
                  event={event}
                  ticketType={ticketType}
                  quantity={quantity}
                  disabled={availableTickets <= 0}
                />
                <Button
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Event
                </Button>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-2">Organizer</h3>
                <div className="flex items-center gap-3">
                  <div className="bg-gray-200 rounded-full p-2">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">{event.organizer.name}</p>
                    <p className="text-sm text-gray-600">
                      {event.organizer.email}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

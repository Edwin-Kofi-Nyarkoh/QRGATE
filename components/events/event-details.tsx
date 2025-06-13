"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  User,
  Users,
  Plus,
  Minus,
} from "lucide-react";
import { EventCountdown } from "@/components/events/event-countdown";
import { formatDate, formatTime } from "@/lib/date-utils";
import { ImageGallery } from "@/components/events/image-gallery";
import { BuyNowButton } from "@/components/events/buy-now-button";
import { useCartStore } from "@/lib/store/cart-store";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface EventDetailsProps {
  event: any; // Using any for simplicity, but should be properly typed
}

export function EventDetails({ event }: EventDetailsProps) {
  const [selectedTab, setSelectedTab] = useState("details");
  const [selectedTicketType, setSelectedTicketType] = useState(
    event.ticketTypes && event.ticketTypes.length > 0
      ? event.ticketTypes[0].id
      : null
  );
  const [quantity, setQuantity] = useState(1);
  const { addItem, items } = useCartStore();

  // Find if this event is already in cart
  const isInCart = items.some(
    (item) =>
      item.eventId === event.id && item.ticketTypeId === selectedTicketType
  );

  // Get the selected ticket type object
  const ticketType = event.ticketTypes?.find(
    (type: any) => type.id === selectedTicketType
  );

  // Calculate available tickets for the selected type
  const availableTickets = ticketType
    ? ticketType.quantity - ticketType.soldCount
    : event.totalTickets - event.soldTickets;

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

  const handleAddToCart = () => {
    if (!ticketType) return;

    addItem({
      id: `${event.id}-${ticketType.id}-${Date.now()}`,
      eventId: event.id,
      eventTitle: event.title,
      eventImage: event.mainImage,
      eventDate: event.startDate,
      eventLocation: event.location,
      ticketType: ticketType.name,
      ticketTypeId: ticketType.id,
      price: ticketType.price,
      quantity: quantity,
      maxQuantity: availableTickets,
      title: event.title,
      image: event.mainImage || "",
      startDate: event.startDate.toString(),
    });

    toast.success("Added to cart", {
      description: `${quantity} ${ticketType.name} ticket${
        quantity > 1 ? "s" : ""
      } for ${event.title}`,
    });
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
              <p className="text-gray-700 whitespace-pre-line">
                {event.description}
              </p>
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
                  src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(
                    event.location
                  )}`}
                  allowFullScreen
                ></iframe>
              </div>
              <p className="mt-4 text-gray-700">{event.location}</p>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Event Info and Actions */}
        <div>
          <Card>
            <CardContent className="p-6 space-y-6">
              <EventCountdown date={new Date(event.startDate)} />

              {/* Ticket Type Selection */}
              {event.ticketTypes && event.ticketTypes.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Select Ticket Type</h3>
                  <RadioGroup
                    value={selectedTicketType}
                    onValueChange={setSelectedTicketType}
                    className="space-y-3"
                  >
                    {event.ticketTypes.map((type: any) => {
                      const available = type.quantity - type.soldCount;
                      return (
                        <div
                          key={type.id}
                          className="flex items-center space-x-2 border p-3 rounded-md"
                        >
                          <RadioGroupItem
                            value={type.id}
                            id={type.id}
                            disabled={available <= 0}
                          />
                          <Label htmlFor={type.id} className="flex-1">
                            <div className="flex justify-between">
                              <div>
                                <div className="font-medium">{type.name}</div>
                                <div className="text-sm text-gray-500">
                                  {type.description}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary">
                                  Ghc{type.price.toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {available} available
                                </div>
                              </div>
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="space-y-2">
                <h3 className="font-medium">Quantity</h3>
                <div className="flex items-center border rounded-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                    className="rounded-r-none"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center py-2">{quantity}</div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={incrementQuantity}
                    disabled={quantity >= availableTickets}
                    className="rounded-l-none"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  {availableTickets} tickets remaining
                </p>
              </div>

              {/* Price Summary */}
              <div className="space-y-1 border-t pt-4">
                <div className="flex justify-between">
                  <span>Price per ticket:</span>
                  <span>
                    Ghc{ticketType?.price.toFixed(2) || event.price.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>
                    Ghc
                    {((ticketType?.price || event.price) * quantity).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={!selectedTicketType || availableTickets <= 0}
                >
                  Add to Cart
                </Button>
                <BuyNowButton
                  eventId={event.id}
                  price={ticketType?.price || event.price}
                  ticketTypeId={selectedTicketType}
                  quantity={quantity}
                  disabled={!selectedTicketType || availableTickets <= 0}
                />
                <Button
                  variant="outline"
                  className="w-full"
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

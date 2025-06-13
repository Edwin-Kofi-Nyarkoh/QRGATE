"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { toast } from "sonner";
import type { Event, TicketType } from "@/lib/types/api";

interface AddToCartButtonProps {
  event: Event;
  ticketTypeId?: string;
  className?: string;
}

export function AddToCartButton({
  event,
  ticketTypeId,
  className,
}: AddToCartButtonProps) {
  const [showQuantity, setShowQuantity] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addItem, items } = useCartStore();

  // Find if this event is already in cart
  const isInCart = items.some(
    (item) => item.eventId === event.id && item.ticketTypeId === ticketTypeId
  );

  // Get the selected ticket type object
  const ticketType =
    event.ticketTypes?.find((type: TicketType) => type.id === ticketTypeId) ||
    event.ticketTypes?.[0];

  // Calculate available tickets for the selected type
  const availableTickets = ticketType
    ? ticketType.quantity - ticketType.soldCount
    : event.totalTickets - event.soldTickets;

  const handleAddToCart = () => {
    if (showQuantity) {
      addItem({
        id: `${event.id}-${ticketType?.id || "standard"}-${Date.now()}`,
        eventId: event.id,
        eventTitle: event.title,
        eventImage: event.mainImage || undefined,
        eventDate: event.startDate.toString(),
        eventLocation: event.location,
        ticketType: ticketType?.name || "Standard",
        ticketTypeId: ticketType?.id,
        price: ticketType?.price || event.price,
        quantity: quantity,
        maxQuantity: availableTickets,
        title: event.title,
        image: event.mainImage || "",
        startDate: event.startDate.toString(),
      });

      toast.success("Added to cart", {
        description: `${quantity} ${ticketType?.name || "Standard"} ticket${
          quantity > 1 ? "s" : ""
        } for ${event.title}`,
      });

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

  if (showQuantity) {
    return (
      <div className="flex items-center space-x-2">
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
          <div className="flex-1 text-center py-2 px-3">{quantity}</div>
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
        <Button onClick={handleAddToCart} className={className}>
          Add
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleAddToCart}
      className={className}
      disabled={availableTickets <= 0 || isInCart}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {isInCart ? "In Cart" : "Add to Cart"}
    </Button>
  );
}

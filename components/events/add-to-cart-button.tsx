"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/lib/store/cart-store";
import type { Event } from "@/lib/types/api";
import { toast } from "sonner";

interface AddToCartButtonProps {
  event: Event;
  ticketType?: string;
  quantity?: number;
}

export function AddToCartButton({
  event,
  ticketType = "Standard",
  quantity = 1,
}: AddToCartButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const { addItem } = useCartStore();

  const availableTickets = event?.totalTickets - event?.soldTickets;

  const handleAddToCart = async () => {
    setIsLoading(true);

    try {
      addItem({
        eventId: event.id,
        eventTitle: event.title,
        eventImage: event.mainImage || undefined,
        eventDate: event.startDate.toString(),
        eventLocation: event.location,
        ticketType,
        price: event.price,
        quantity,
        maxQuantity: Math.min(10, availableTickets),
        // Required fields for CartItem
        title: event.title,
        image: event.mainImage || "",
        startDate: event.startDate.toString(),
      });

      toast("Added to cart", {
        description: `${event.title} has been added to your cart`,
      });
    } catch (error) {
      toast("Failed to add to cart", {
        description:
          "There was an error adding the item to your cart. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleAddToCart}
      disabled={isLoading || availableTickets === 0}
    >
      <ShoppingCart className="w-4 h-4 mr-2" />
      {availableTickets === 0 ? "Sold Out" : "Add to Cart"}
    </Button>
  );
}

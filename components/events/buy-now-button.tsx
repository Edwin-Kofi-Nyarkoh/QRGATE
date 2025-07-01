"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { toast } from "sonner";

interface BuyNowButtonProps {
  event: any;
  ticketType: any;
  quantity?: number;
  disabled?: boolean;
}

export function BuyNowButton({
  event,
  ticketType,
  quantity = 1,
  disabled = false,
}: BuyNowButtonProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  const availableTickets = ticketType.quantity - ticketType.soldCount;

  const handleBuyNow = async () => {
    setIsLoading(true);
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
    toast.success("Added to cart, redirecting to checkout", {
      description: `${quantity} ${ticketType.name} ticket${
        quantity > 1 ? "s" : ""
      } for ${event.title}`,
    });
    // Redirect to checkout page
    router.push("/checkout");
    setIsLoading(false);
  };

  return (
    <Button
      onClick={handleBuyNow}
      variant="outline"
      className="w-full"
      disabled={isLoading || disabled}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <ShoppingBag className="w-4 h-4 mr-2" />
      )}
      Buy Now
    </Button>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Loader2 } from "lucide-react";
import { useCreateOrder } from "@/lib/api/orders";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

interface BuyNowButtonProps {
  eventId: string;
  price: number;
  ticketTypeId?: string;
  quantity?: number;
  disabled?: boolean;
}

export function BuyNowButton({
  eventId,
  price,
  ticketTypeId,
  quantity = 1,
  disabled = false,
}: BuyNowButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const createOrderMutation = useCreateOrder();

  const handleBuyNow = async () => {
    if (!session) {
      toast.error("Please sign in to purchase tickets");
      router.push(`/auth/signin?callbackUrl=/events/${eventId}`);
      return;
    }

    setIsLoading(true);

    try {
      const order = await createOrderMutation.mutateAsync({
        eventId,
        quantity,
        total: price * quantity,
        ticketTypeId,
      });

      router.push(`/checkout/${order.id}`);
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to process your order");
    } finally {
      setIsLoading(false);
    }
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

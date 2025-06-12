"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface BuyNowButtonProps {
  eventId: string;
  price: number;
  quantity?: number;
}

export function BuyNowButton({
  eventId,
  price,
  quantity = 1,
}: BuyNowButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();

  const handleBuyNow = async () => {
    setIsLoading(true);

    try {
      if (!session) {
        // Redirect to login if not authenticated
        router.push(`/auth/signin?callbackUrl=/events/${eventId}`);
        return;
      }

      // Create an order
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          quantity,
          total: price * quantity,
        }),
      });

      if (!orderResponse.ok) {
        throw new Error("Failed to create order");
      }

      const { order } = await orderResponse.json();

      // Redirect to checkout
      router.push(`/checkout/${order.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your request",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Button
      className="w-full bg-primary"
      onClick={handleBuyNow}
      disabled={isLoading}
    >
      {isLoading ? "Processing..." : "Buy Now"}
    </Button>
  );
}

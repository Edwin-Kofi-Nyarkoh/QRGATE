// app/components/TicketCheckout.tsx
"use client";

import { useSession } from "next-auth/react";
import { useTicketCart} from "@/components/cart/TicketCartContext"
import PaystackPayButton from "./payStackButton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function TicketCheckout() {
  const { cart, clearCart } = useTicketCart();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const email = session?.user.email ?? "no-email@example.com";
  const total = cart.reduce((sum, t) => sum + t.price * t.quantity, 0);

  const handleSuccess = async ({ reference }: { reference: string }) => {
        const tickets = cart.map(item=>({
          eventId: item.eventId,
          quantity: item.quantity
        }));

    await fetch("/api/tickets", {
      method: "POST",
      body: JSON.stringify({
        userId,
        tickets,
        total,
        reference,
      }),
    });
    alert("Payment successful and tickets created!");
    clearCart();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Ticket Checkout</h1>

      {cart.length === 0 ? (
        <p>Your ticket cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((item) => (
            <Card key={item.eventId}>
              <CardHeader>
                <h2 className="text-lg font-semibold">{item.eventName}</h2>
              </CardHeader>
              <CardContent>
                <Label>Quantity:</Label>
                <p>{item.quantity}</p>
                <p>Price: GHS {item.price * item.quantity}</p>
              </CardContent>
            </Card>
          ))}
          <Card>
            <CardContent>
              <p className="font-bold text-lg">Total: GHS {total}</p>
            </CardContent>
            <CardFooter className="flex justify-center">
              <PaystackPayButton email={email} amount={total} onSuccess={handleSuccess} />
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

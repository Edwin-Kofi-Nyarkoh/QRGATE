"use client";

import { useTicketCart } from "./TicketCartContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useTicketCart();
  const router = useRouter();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <Card key={item.eventId} className="shadow-md rounded-lg">
                <CardHeader>
                  <h2 className="text-lg font-semibold">{item.eventName}</h2>
                  <p className="text-gray-500">GHS {item.price} each</p>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Label htmlFor={`quantity-${item.eventId}`} className="text-sm">Quantity</Label>
                  <Input
                    id={`quantity-${item.eventId}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.eventId, parseInt(e.target.value))}
                    className="w-16"
                  />
                </CardContent>
                <CardFooter className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => updateQuantity(item.eventId, item.quantity - 1)}>
                      -
                    </Button>
                    <Button variant="outline" onClick={() => updateQuantity(item.eventId, item.quantity + 1)}>
                      +
                    </Button>
                    <Button variant="destructive" onClick={() => removeFromCart(item.eventId)}>
                      Remove
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          <p className="font-bold text-lg mt-6">Total: GHS {total}</p>
          <Button className="mt-4 w-full bg-green-500" onClick={() => router.push("/checkout")}>
            Proceed to Checkout
          </Button>
        </>
      )}
    </div>
  );
}
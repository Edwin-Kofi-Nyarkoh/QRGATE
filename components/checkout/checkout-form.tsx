"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { formatDateTime } from "@/lib/date-utils";
import { Loader2 } from "lucide-react";

interface CheckoutFormProps {
  order: any; // Using any for simplicity, but should be properly typed
}

export function CheckoutForm({ order }: CheckoutFormProps) {
  const [paymentMethod, setPaymentMethod] = useState("paystack");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Initialize payment with PayStack
      const response = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize payment");
      }

      const data = await response.json();

      // Redirect to PayStack payment page without adding duplicate reference
      window.location.href = data.authorization_url;
    } catch (error) {
      console.error("Payment error:", error);
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{order.event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {formatDateTime(order.event.startDate)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.event.location}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    Ghc{order.event.price.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    x {Math.round(order.total / order.event.price)}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between">
                <p className="font-semibold">Total</p>
                <p className="font-semibold">Ghc{order.total.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <div className="flex items-center space-x-2 border rounded-md p-4 mb-3">
                  <RadioGroupItem value="paystack" id="paystack" />
                  <Label htmlFor="paystack" className="flex-1 cursor-pointer">
                    <div className="font-medium">PayStack</div>
                    <div className="text-sm text-gray-500">
                      Pay with credit card or bank transfer
                    </div>
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center">
                      VISA
                    </div>
                    <div className="w-10 h-6 bg-red-500 rounded text-white text-xs flex items-center justify-center">
                      MC
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 border rounded-md p-4">
                  <RadioGroupItem
                    value="mobile-money"
                    id="mobile-money"
                    disabled
                  />
                  <Label
                    htmlFor="mobile-money"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">Mobile Money</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Billing Information */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  defaultValue={order.user.name || ""}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={order.user.email || ""}
                  readOnly
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  defaultValue={order.user.phone || ""}
                  readOnly
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                    Processing...
                  </>
                ) : (
                  `Pay Ghc${order.total.toFixed(2)}`
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  );
}

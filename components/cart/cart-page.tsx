"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Calendar,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { formatDateTime } from "@/lib/date-utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    getTotalPrice,
    getCount, // <-- use getCount instead of getTotalItems
    clearCart,
  } = useCartStore();
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const totalItems = getCount(); // <-- use getCount()
  const subtotal = getTotalPrice();
  const discount = (subtotal * appliedDiscount) / 100;
  const total = subtotal - discount;

  const handleApplyDiscount = () => {
    // Simple discount logic - in real app, this would call an API
    if (discountCode.toLowerCase() === "welcome10") {
      setAppliedDiscount(10);
    } else if (discountCode.toLowerCase() === "save20") {
      setAppliedDiscount(20);
    } else {
      setAppliedDiscount(0);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any tickets to your cart yet.
            </p>
            <Button asChild size="lg">
              <Link href="/events">Browse Events</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/events">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Continue Shopping
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <p className="text-gray-600">{totalItems} items in your cart</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          item.eventImage ||
                          "/placeholder.svg?height=96&width=96"
                        }
                        alt={item?.eventTitle ?? "Event Image"}
                        loading="lazy"
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg mb-2">
                            {item.eventTitle}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDateTime(item?.eventDate ?? "")}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {item.eventLocation}
                            </div>
                          </div>
                          <Badge variant="outline">{item.ticketType}</Badge>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.id, (item.quantity ?? 1) - 1)
                            }
                            disabled={(item.quantity ?? 1) <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-lg font-medium w-12 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              updateQuantity(item.id, (item?.quantity ?? 0) + 1)
                            }
                            disabled={
                              (item.quantity ?? 0) >=
                              (item.maxQuantity ?? Infinity)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            Ghc
                            {((item.price ?? 0) * (item.quantity ?? 0)).toFixed(
                              2
                            )}
                          </p>
                          <p className="text-xs text-gray-600">
                            Ghc{(item.price ?? 0).toFixed(2)} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={clearCart}>
                Clear Cart
              </Button>
              <Button variant="outline" asChild>
                <Link href="/events">Continue Shopping</Link>
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Discount Code */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Discount Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <Button onClick={handleApplyDiscount}>Apply</Button>
                </div>
                {appliedDiscount > 0 && (
                  <div className="text-sm text-primary">
                    ✓ {appliedDiscount}% discount applied!
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>Ghc{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount ({appliedDiscount}%)</span>
                    <span>-Ghc{discount.toFixed(2)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>Ghc{total.toFixed(2)}</span>
                </div>
                <Button asChild className="w-full" size="lg">
                  <Link href="/checkout">Proceed to Checkout</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center text-sm text-gray-600">
                  <p className="mb-2">🔒 Secure Checkout</p>
                  <p>Your payment information is encrypted and secure</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

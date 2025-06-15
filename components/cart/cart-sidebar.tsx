"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Calendar,
  MapPin,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { formatDateTime } from "@/lib/date-utils";
import Image from "next/image";
import Link from "next/link";

export function CartSidebar({ onClose }: { onClose?: () => void }) {
  const {
    items,
    removeItem,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    clearCart,
  } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  if (items.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-4">
              Add some tickets to get started!
            </p>
            <Button asChild>
              <Link href="/events" onClick={() => onClose?.()}>
                Browse Events
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className=" border-b sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <Badge variant="secondary">{totalItems} items</Badge>
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id ?? `cart-item-${index}`}
            className="border rounded-lg p-4"
          >
            <div className="flex gap-3">
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={item.eventImage || "/placeholder.svg?height=64&width=64"}
                  alt={item.eventTitle ?? "Event Image"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm mb-1 line-clamp-2">
                  {item.eventTitle}
                </h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDateTime(item?.eventDate ?? "")}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.eventLocation}
                  </div>
                </div>
                <Badge variant="outline" className="mt-1 text-xs">
                  {item.ticketType}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-red-500 hover:text-red-700 self-start xs:self-center sm:self-center"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex flex-col xs:flex-row sm:flex-row items-center justify-between mt-2 gap-2 xs:gap-0 sm:gap-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() =>
                    updateQuantity(item.id, (item.quantity ?? 1) - 1)
                  }
                  disabled={(item?.quantity ?? 1) <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-sm font-medium w-8 text-center">
                  {item?.quantity ?? 0}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() =>
                    updateQuantity(item.id, (item.quantity ?? 0) + 1)
                  }
                  disabled={
                    (item.quantity ?? 0) >= (item.maxQuantity ?? Infinity)
                  }
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-right w-full xs:w-auto sm:w-auto">
                <p className="text-sm font-semibold">
                  Ghc{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}
                </p>
                <p className="text-xs text-gray-600">
                  Ghc{(item.price ?? 0).toFixed(2)} each
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t p-4 space-y-4 bg-white sticky bottom-0 z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearCart}
            className="w-full sm:w-auto"
          >
            Clear Cart
          </Button>
          <div className="text-right w-full sm:w-auto">
            <p className="text-sm text-gray-600">{totalItems} items</p>
            <p className="text-lg font-bold">Ghc{totalPrice.toFixed(2)}</p>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Button asChild className="w-full">
            <Link href="/cart" onClick={() => onClose?.()}>
              View Cart
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/checkout" onClick={() => onClose?.()}>
              Checkout
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

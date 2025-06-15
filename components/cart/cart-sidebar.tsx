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
            <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
            <p className=" mb-4">Add some tickets to get started!</p>
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
    <div className="flex flex-col h-full max-h-screen shadow-lg w-full sm:w-96">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-2 sticky top-0 z-10 bg-background">
        <ShoppingCart className="h-6 w-6 text-primary" />
        <h2 className="text-lg font-semibold flex-1">Shopping Cart</h2>
        <Badge variant="secondary">{totalItems} items</Badge>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id ?? `cart-item-${index}`}
            className="flex flex-col sm:flex-row gap-3 border rounded-lg p-3 shadow-sm hover:shadow-md transition-all bg-card"
          >
            <div className="relative w-full sm:w-20 h-32 sm:h-20 rounded-md overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
              <Image
                src={item.eventImage || "/placeholder.svg?height=64&width=64"}
                alt={item.eventTitle ?? "Event Image"}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-between">
              <div>
                <h3 className="font-medium text-base mb-1 line-clamp-2 text-foreground">
                  {item.eventTitle}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mb-1">
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
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() =>
                      updateQuantity(item.id, (item.quantity ?? 1) - 1)
                    }
                    disabled={(item?.quantity ?? 1) <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="text-base font-semibold w-8 text-center">
                    {item?.quantity ?? 0}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
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
                <div className="text-right">
                  <p className="text-base font-bold text-primary">
                    Ghc{((item.price ?? 0) * (item.quantity ?? 0)).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ghc{(item.price ?? 0).toFixed(2)} each
                  </p>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-red-500 hover:text-red-700 self-start sm:self-center"
              onClick={() => removeItem(item.id)}
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t p-4 space-y-4 sticky bottom-0 z-10 bg-background">
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
            <p className="text-sm text-muted-foreground">{totalItems} items</p>
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

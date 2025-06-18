"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  History,
  Ticket,
  Settings,
  Plus,
  Music,
  Users,
  GraduationCap,
  Dumbbell,
  Palette,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCurrentUser } from "@/lib/api/users";
import { useCartStore } from "@/lib/store/cart-store";

export function UserSidebar({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();
  const { data: user, isLoading: loadingUserSession } = useCurrentUser({
    enabled: !!session,
  });
  const { items, getTotalPrice } = useCartStore();
  const cartTotal = getTotalPrice();
  const cartItemCount = items.reduce(
    (sum, item) =>
      sum + (typeof item?.quantity === "number" ? item.quantity : 0),
    0
  );

  if (loadingUserSession) {
    return (
      <div className="h-full  flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <span className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
          <p className="">Loading your profile...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full  flex flex-col">
      {/* User Profile Section */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.profileImage || "/placeholder-user.jpg"} />
            <AvatarFallback>
              {user?.name
                ? user?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold ">
              {user?.name ? `HELLO ${user?.name.toUpperCase()}` : "HELLO USER"}
            </p>
            <p className="text-sm">Welcome back!</p>
          </div>
        </div>

        {/* User Navigation */}
        <div className="space-y-2">
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded  transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <User className="w-4 h-4" />
            <span className="text-sm">Profile</span>
          </Link>
          <Link
            href="/dashboard/order-history"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded  transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <History className="w-4 h-4" />
            <span className="text-sm">Order History</span>
          </Link>
          <Link
            href="/dashboard/tickets"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded  transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <Ticket className="w-4 h-4" />
            <span className="text-sm">My Tickets</span>
          </Link>
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded  transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </Link>
        </div>
      </div>

      {/* Cart Summary */}
      <div className="p-4  border-b">
        <div className="bg-primary p-3 rounded">
          <p className="text-sm font-medium text-white ">
            {cartItemCount > 0
              ? `${cartItemCount} Items - Total Ghc${cartTotal.toFixed(2)}`
              : "Cart is empty"}
          </p>
        </div>
      </div>
      <div className="p-4 flex-1 overflow-y-auto space-y-4">
        {/* Title */}
        <h2 className="text-lg font-semibold mb-4">Pages</h2>
        {/* Pages to Visit */}
        <div className="space-y-2">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded  transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <User className="w-4 h-4" />
            <span className="text-sm">Home</span>
          </Link>
          <Link
            href="/events"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded  transition-colors hover:bg-gray-300 dark:hover:bg-gray-700"
          >
            <History className="w-4 h-4" />
            <span className="text-sm">Discover Events</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

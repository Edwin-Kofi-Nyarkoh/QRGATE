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
import { useRouter } from "next/navigation";

const categories = [
  { name: "Entertainment", icon: Music, count: 15 },
  { name: "Networking & Meetup", icon: Users, count: 8 },
  { name: "Education", icon: GraduationCap, count: 12 },
  { name: "Community & Charity", icon: Users, count: 5 },
  { name: "Seminars & Workshops", icon: GraduationCap, count: 7 },
  { name: "Sport", icon: Dumbbell, count: 9 },
  { name: "Exhibitions", icon: Palette, count: 4 },
];

export function UserSidebar() {
  const { data: session } = useSession();
  const { data: user, isLoading: loadingUserSession } = useCurrentUser({
    enabled: !!session,
  });
  const { items, getTotalPrice } = useCartStore();
  const router = useRouter();
  const cartTotal = getTotalPrice();
  const cartItemCount = items.reduce(
    (sum, item) =>
      sum + (typeof item?.quantity === "number" ? item.quantity : 0),
    0
  );

  if (loadingUserSession) {
    return (
      <div className="h-full bg-gray-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-2">
          <span className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* User Profile Section */}
      <div className="p-4 bg-white border-b">
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
            <p className="font-semibold text-gray-800">
              {user?.name ? `HELLO ${user?.name.toUpperCase()}` : "HELLO USER"}
            </p>
            <p className="text-sm text-gray-600">Welcome back!</p>
          </div>
        </div>

        {/* User Navigation */}
        <div className="space-y-2">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <User className="w-4 h-4" />
            <span className="text-sm">Profile</span>
          </Link>
          <Link
            href="/dashboard/order-history"
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <History className="w-4 h-4" />
            <span className="text-sm">Order History</span>
          </Link>
          <Link
            href="/dashboard/my-tickets"
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <Ticket className="w-4 h-4" />
            <span className="text-sm">My Tickets</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">Settings</span>
          </Link>
        </div>

        {/* Create Event Button */}
        <Button
          onClick={() => {
            if (user?.role === "ORGANIZER") {
              router.push("/dashboard/events/create");
            }
          }}
          className="w-full mt-4 bg-green-500 hover:bg-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          CREATE AN EVENT
        </Button>
      </div>

      {/* Cart Summary */}
      <div className="p-4 bg-blue-50 border-b">
        <div className="bg-blue-100 p-3 rounded">
          <p className="text-sm font-medium text-blue-800">
            {cartItemCount > 0
              ? `${cartItemCount} Items - Total $${cartTotal.toFixed(2)}`
              : "Cart is empty"}
          </p>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 p-4">
        <h3 className="font-semibold text-gray-800 mb-3">CATEGORIES</h3>
        <div className="space-y-1">
          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/events?category=${category.name.toLowerCase()}`}
              className="flex items-center justify-between p-2 rounded hover:bg-gray-100 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <category.icon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{category.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {category.count}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Organizer Stats */}
      <div className="p-4 bg-gray-100 border-t">
        <h4 className="font-medium text-gray-800 mb-2">Organizer Stats</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Tickets Purchased: 24</p>
          <p>Events Attended: 8</p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Ticket,
  ShoppingBag,
  Settings,
  Calendar,
  BarChart3,
  Plus,
  Home,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    name: "My Tickets",
    href: "/dashboard/tickets",
    icon: Ticket,
    badge: "3",
  },
  {
    name: "Order History",
    href: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

const organizerNavigation = [
  {
    name: "My Events",
    href: "/organizer/events",
    icon: Calendar,
  },
  {
    name: "Create Event",
    href: "/organizer/events/create",
    icon: Plus,
  },
  {
    name: "Analytics",
    href: "/organizer/analytics",
    icon: BarChart3,
  },
];

type SessionUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isOrganizer?: boolean;
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as SessionUser | undefined;
  const isOrganizer = user?.isOrganizer;

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <div className="bg-green-500 p-2 rounded">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          TICKETBOX
        </Link>
      </div>

      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-green-100 text-green-700 hover:bg-green-100"
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          );
        })}

        {isOrganizer && (
          <>
            <div className="pt-4 pb-2">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Organizer
              </h3>
            </div>
            {organizerNavigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive &&
                        "bg-green-100 text-green-700 hover:bg-green-100"
                    )}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </>
        )}
      </nav>
    </div>
  );
}

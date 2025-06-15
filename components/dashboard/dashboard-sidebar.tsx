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
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useSidebarToggle } from "@/components/sidebar-toggle-context";

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
    // badge: "3",
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
  const { open, setOpen } = useSidebarToggle();

  return (
    <>
      {/* Mobile sidebar overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden transition-opacity",
          open ? "block" : "hidden"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      {/* Sidebar drawer for mobile */}
      <nav
        className={cn(
          "fixed z-50 top-0 left-0 h-full w-64 bg-card border-r border-border shadow-lg md:static md:block md:h-auto md:w-64 transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
        aria-label="Sidebar"
      >
        {/* Close button on mobile */}
        <button
          className="absolute top-4 right-4 md:hidden text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(false)}
          aria-label="Close sidebar"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="bg-primary p-2 rounded">
              <Ticket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-foreground">QRGates</span>
          </Link>
        </div>

        <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-primary/10 text-primary hover:bg-primary/10"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                  {/* {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )} */}
                </Button>
              </Link>
            );
          })}

          {isOrganizer && (
            <>
              <div className="pt-4 pb-2">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
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
                          "bg-primary/10 text-primary hover:bg-primary/10"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                );
              })}
            </>
          )}
        </div>
      </nav>
    </>
  );
}

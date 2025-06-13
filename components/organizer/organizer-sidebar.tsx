"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Calendar,
  BarChart3,
  Users,
  Settings,
  Plus,
  Home,
  Ticket,
  X,
} from "lucide-react";
import { useSidebarToggle } from "@/components/sidebar-toggle-context";

const navigation = [
  { name: "Dashboard", href: "/organizer", icon: Home },
  { name: "My Events", href: "/organizer/events", icon: Calendar },
  { name: "Create Event", href: "/organizer/events/create", icon: Plus },
  { name: "Ticket Sales", href: "/organizer/sales", icon: Ticket },
  { name: "Analytics", href: "/organizer/analytics", icon: BarChart3 },
  { name: "Attendees", href: "/organizer/attendees", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function OrganizerSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebarToggle();

  // Sidebar for mobile: drawer
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
        <div className="flex items-center justify-center h-16 px-4 bg-primary">
          <h1 className="text-xl font-bold text-primary-foreground">
            Organizer Portal
          </h1>
        </div>
        <div className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

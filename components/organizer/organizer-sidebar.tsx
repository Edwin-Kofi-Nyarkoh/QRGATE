"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Calendar, BarChart3, Users, Settings, Plus, Home, Ticket } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/organizer", icon: Home },
  { name: "My Events", href: "/organizer/events", icon: Calendar },
  { name: "Create Event", href: "/organizer/events/create", icon: Plus },
  { name: "Ticket Sales", href: "/organizer/sales", icon: Ticket },
  { name: "Analytics", href: "/organizer/analytics", icon: BarChart3 },
  { name: "Attendees", href: "/organizer/attendees", icon: Users },
  { name: "Settings", href: "/organizer/settings", icon: Settings },
]

export function OrganizerSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-white shadow-lg">
      <div className="flex items-center justify-center h-16 px-4 bg-green-500">
        <h1 className="text-xl font-bold text-white">Organizer Portal</h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

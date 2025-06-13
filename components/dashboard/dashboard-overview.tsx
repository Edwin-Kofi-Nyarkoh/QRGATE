"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ShoppingBag, TrendingUp, Plus, Ticket } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useUserTickets, useUserOrders } from "@/lib/services";
import type { Ticket as TicketType } from "@/lib/services";

interface DashboardOverviewProps {
  user: any;
}

export function DashboardOverview({ user }: DashboardOverviewProps) {
  const { data: session } = useSession();
  const { data: tickets = [], isLoading: ticketsLoading } = useUserTickets(
    session?.user?.id ? Number(session.user.id) : undefined
  );
  const { data: orders = [], isLoading: ordersLoading } = useUserOrders(
    session?.user?.id || ""
  );
  const upcomingTickets = tickets.filter(
    (ticket: TicketType) =>
      new Date(ticket.event.startDate) > new Date() && !ticket.isUsed
  );

  console.log("Upcoming Tickets:", tickets);

  const completedOrders = orders.filter(
    (order) => order.status === "COMPLETED"
  );
  const totalSpent = completedOrders.reduce(
    (sum, order) => sum + order.total,
    0
  );

  const stats = [
    {
      title: "Active Tickets",
      value: upcomingTickets.length,
      description: "Upcoming events",
      icon: Ticket,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Orders",
      value: orders.length,
      description: "All time",
      icon: ShoppingBag,
      color: "text-primary",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Spent",
      value: `Ghc${totalSpent.toFixed(2)}`,
      description: "All time",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Events Attended",
      value: tickets.filter((t: { isUsed: boolean }) => t.isUsed).length,
      description: "Completed",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your tickets and events.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Your next events to attend</CardDescription>
          </CardHeader>
          <CardContent>
            {ticketsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : upcomingTickets.length > 0 ? (
              <div className="space-y-4">
                {upcomingTickets.slice(0, 3).map((ticket: TicketType) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{ticket.event.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(ticket.event.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">{ticket.type}</Badge>
                  </div>
                ))}
                <Button asChild className="w-full" variant="outline">
                  <Link href="/dashboard/tickets">View All Tickets</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No upcoming events</p>
                <Button asChild>
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your latest ticket purchases</CardDescription>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-4">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{order.event.title}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Ghc{order.total.toFixed(2)}</p>
                      <Badge
                        variant={
                          order.status === "COMPLETED" ? "default" : "secondary"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button asChild className="w-full" variant="outline">
                  <Link href="/dashboard/orders">View Order History</Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No orders yet</p>
                <Button asChild>
                  <Link href="/events">Start Shopping</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Organizer Section */}
      {session?.user?.isOrganizer && (
        <Card>
          <CardHeader>
            <CardTitle>Organizer Tools</CardTitle>
            <CardDescription>
              Manage your events and create new ones
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button asChild>
                <Link href="/organizer/events/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Event
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/organizer/events">Manage Events</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/organizer/analytics">View Analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

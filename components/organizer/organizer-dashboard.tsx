"use client";

import { useSession } from "next-auth/react";
import { useEvents } from "@/lib/api/events";
import { useOrders } from "@/lib/api/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, DollarSign, Users, Ticket } from "lucide-react";

export function OrganizerDashboard() {
  const { data: session } = useSession();

  // Get organizer's events
  const { data: eventsData } = useEvents({
    organizerId: session?.user?.id,
    limit: 100,
  });

  // Get organizer's orders
  const { data: ordersData } = useOrders({
    userId: session?.user?.id,
    limit: 100,
  });

  const events = eventsData?.data || [];
  const orders = ordersData?.data || [];

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const totalTicketsSold = orders.reduce(
    (sum, order) => sum + order.tickets.length,
    0
  );
  const totalAttendees = orders.filter(
    (order) => order.status === "COMPLETED"
  ).length;

  const stats = [
    {
      title: "Total Events",
      value: events.length,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: "text-primary",
      bgColor: "bg-green-100",
    },
    {
      title: "Tickets Sold",
      value: totalTicketsSold,
      icon: Ticket,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Attendees",
      value: totalAttendees,
      icon: Users,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Track your events and performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.slice(0, 5).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${event.price}</p>
                    <p className="text-sm text-gray-600">
                      {event.soldTickets}/{event.totalTickets} sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orders.slice(0, 5).map((order) => (
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
                    <p className="font-medium">${order.total}</p>
                    <p
                      className={`text-sm ${
                        order.status === "COMPLETED"
                          ? "text-primary"
                          : order.status === "PENDING"
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    >
                      {order.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

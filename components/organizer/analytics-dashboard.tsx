"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useEvents } from "@/lib/api/events"
import { useOrders } from "@/lib/api/orders"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Users, Ticket, TrendingUp, TrendingDown } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export function AnalyticsDashboard() {
  const { data: session } = useSession()
  const [selectedPeriod, setSelectedPeriod] = useState("30")

  const { data: eventsData } = useEvents({
    organizerId: session?.user?.id,
    limit: 100,
  })

  const { data: ordersData } = useOrders({
    organizerId: session?.user?.id,
    limit: 1000,
  })

  const events = eventsData?.data || []
  const orders = ordersData?.data || []

  // Calculate metrics
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
  const totalTicketsSold = orders.reduce((sum, order) => sum + order.tickets.length, 0)
  const totalAttendees = orders.filter((order) => order.status === "COMPLETED").length
  const averageTicketPrice = totalTicketsSold > 0 ? totalRevenue / totalTicketsSold : 0

  // Revenue over time data
  const revenueData = orders.reduce(
    (acc, order) => {
      const date = new Date(order.createdAt).toLocaleDateString()
      const existing = acc.find((item) => item.date === date)
      if (existing) {
        existing.revenue += order.total
        existing.tickets += order.tickets.length
      } else {
        acc.push({ date, revenue: order.total, tickets: order.tickets.length })
      }
      return acc
    },
    [] as { date: string; revenue: number; tickets: number }[],
  )

  // Event performance data
  const eventPerformanceData = events.map((event) => ({
    name: event.title.substring(0, 20) + (event.title.length > 20 ? "..." : ""),
    sold: event.soldTickets,
    total: event.totalTickets,
    revenue: orders.filter((order) => order.eventId === event.id).reduce((sum, order) => sum + order.total, 0),
  }))

  // Category distribution
  const categoryData = events.reduce(
    (acc, event) => {
      const existing = acc.find((item) => item.name === event.category)
      if (existing) {
        existing.value += 1
      } else {
        acc.push({ name: event.category, value: 1 })
      }
      return acc
    },
    [] as { name: string; value: number }[],
  )

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  const stats = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "Tickets Sold",
      value: totalTicketsSold,
      change: "+8.2%",
      trend: "up",
      icon: Ticket,
    },
    {
      title: "Total Attendees",
      value: totalAttendees,
      change: "+15.3%",
      trend: "up",
      icon: Users,
    },
    {
      title: "Avg. Ticket Price",
      value: `$${averageTicketPrice.toFixed(2)}`,
      change: "-2.1%",
      trend: "down",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Performance Overview</h2>
          <p className="text-gray-600">Track your events and revenue performance</p>
        </div>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 3 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs">
                {stat.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
                )}
                <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                <span className="text-gray-500 ml-1">from last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="events">Event Performance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sold" fill="#8884d8" />
                  <Bar dataKey="total" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Categories Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {eventPerformanceData
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((event, index) => (
                      <div key={event.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-3">
                            #{index + 1}
                          </Badge>
                          <span className="font-medium">{event.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${event.revenue.toFixed(2)}</div>
                          <div className="text-sm text-gray-600">
                            {event.sold}/{event.total} sold
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{order.event.title}</p>
                        <p className="text-sm text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${order.total}</div>
                        <Badge variant={order.status === "COMPLETED" ? "default" : "secondary"} className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

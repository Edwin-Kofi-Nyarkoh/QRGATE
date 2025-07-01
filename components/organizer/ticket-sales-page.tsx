"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  Download,
  Filter,
  TrendingUp,
  Users,
  DollarSign,
  Ticket,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTicketSales } from "@/lib/api/sales";
import { PageLoader } from "@/components/ui/loader";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function TicketSalesPage() {
  const { data: session } = useSession();
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedTicketType, setSelectedTicketType] = useState<string>("all");

  const {
    data: salesData,
    isLoading,
    error,
  } = useTicketSales({
    organizerId: session?.user?.id,
    eventId: selectedEvent !== "all" ? selectedEvent : undefined,
    ticketType: selectedTicketType !== "all" ? selectedTicketType : undefined,
    startDate: dateRange.from?.toISOString(),
    endDate: dateRange.to?.toISOString(),
  });

  if (isLoading) return <PageLoader />;

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-red-600">
              Failed to load sales data
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get ticket types from salesData
  const ticketTypes = Array.from(
    new Set(salesData?.ticketTypeStats?.map((stat) => stat.type))
  );

  const handleExportData = () => {
    // Export functionality
    const csvData = salesData?.orders?.map((order) => ({
      "Order ID": order.id,
      Event: order.event.title,
      Customer: order.user?.name || order.user?.email,
      Tickets: order.tickets.length,
      Total: order.total,
      Date: format(new Date(order.createdAt), "yyyy-MM-dd HH:mm"),
      Status: order.status,
    }));

    if (csvData) {
      const csv = [
        Object.keys(csvData[0]).join(","),
        ...csvData.map((row) => Object.values(row).join(",")),
      ].join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket-sales-${format(new Date(), "yyyy-MM-dd")}.csv`;
      a.click();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ticket Sales</h1>
          <p className="text-muted-foreground">
            Track your ticket sales performance
          </p>
        </div>
        <Button onClick={handleExportData} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Event</Label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  {salesData?.events?.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Ticket Type</Label>
              <Select
                value={selectedTicketType}
                onValueChange={setSelectedTicketType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select ticket type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ticketTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from
                      ? format(dateRange.from, "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.from}
                    onSelect={(date) =>
                      setDateRange((prev) => ({ ...prev, from: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.to ? format(dateRange.to, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateRange.to}
                    onSelect={(date) =>
                      setDateRange((prev) => ({ ...prev, to: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Ghc{salesData?.summary?.totalRevenue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{salesData?.summary?.revenueGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesData?.summary?.totalTickets || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{salesData?.summary?.ticketGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {salesData?.summary?.totalOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{salesData?.summary?.orderGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Ghc{salesData?.summary?.avgOrderValue?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{salesData?.summary?.avgOrderGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Data */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="events">By Event</TabsTrigger>
          <TabsTrigger value="tickets">By Ticket Type</TabsTrigger>
          <TabsTrigger value="orders">Recent Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData?.salesTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ticket Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesData?.ticketTypeDistribution || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {salesData?.ticketTypeDistribution?.map(
                        (entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        )
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales by Event</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={salesData?.eventSales || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="eventTitle" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {salesData?.ticketTypeStats?.map((stat) => (
              <Card key={stat.type}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {stat.type}
                    <Badge variant="secondary">{stat.sold} sold</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    Ghc{stat.revenue.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Avg. Price: Ghc{stat.avgPrice.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest ticket purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesData?.orders?.slice(0, 10).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{order.event.title}</h4>
                      <p className="text-sm text-gray-600">
                        {order.user?.name || order.user?.email} •{" "}
                        {order.tickets.length} tickets
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(
                          new Date(order.createdAt),
                          "MMM dd, yyyy HH:mm"
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        Ghc{order.total.toLocaleString()}
                      </p>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

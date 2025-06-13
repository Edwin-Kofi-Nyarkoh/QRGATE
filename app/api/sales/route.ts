import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const organizerId = searchParams.get("organizerId") || session.user.id
    const eventId = searchParams.get("eventId")
    const ticketType = searchParams.get("ticketType")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    // Build where clause
    const whereClause: any = {
      event: {
        organizerId: organizerId,
      },
      status: "COMPLETED",
    }

    if (eventId) {
      whereClause.eventId = eventId
    }

    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) whereClause.createdAt.gte = new Date(startDate)
      if (endDate) whereClause.createdAt.lte = new Date(endDate)
    }

    // Get orders with tickets
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        tickets: {
          where: ticketType ? { type: ticketType } : {},
          select: {
            id: true,
            type: true,
            price: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Get organizer's events for filter dropdown
    const events = await prisma.event.findMany({
      where: {
        organizerId: organizerId,
      },
      select: {
        id: true,
        title: true,
      },
    })

    // Calculate summary statistics
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0)
    const totalTickets = orders.reduce((sum, order) => sum + order.tickets.length, 0)
    const totalOrders = orders.length
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Calculate growth (mock data for now - you'd compare with previous period)
    const revenueGrowth = 12.5
    const ticketGrowth = 8.3
    const orderGrowth = 15.2
    const avgOrderGrowth = 5.7

    // Generate sales trend data (last 30 days)
    const salesTrend = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayOrders = orders.filter((order) => {
        const orderDate = new Date(order.createdAt)
        return orderDate.toDateString() === date.toDateString()
      })

      salesTrend.push({
        date: date.toISOString().split("T")[0],
        revenue: dayOrders.reduce((sum, order) => sum + order.total, 0),
        tickets: dayOrders.reduce((sum, order) => sum + order.tickets.length, 0),
      })
    }

    // Event sales breakdown
    const eventSalesMap = new Map()
    orders.forEach((order) => {
      const eventTitle = order.event.title
      if (!eventSalesMap.has(eventTitle)) {
        eventSalesMap.set(eventTitle, { revenue: 0, tickets: 0 })
      }
      const current = eventSalesMap.get(eventTitle)
      current.revenue += order.total
      current.tickets += order.tickets.length
    })

    const eventSales = Array.from(eventSalesMap.entries()).map(([eventTitle, data]) => ({
      eventTitle,
      ...data,
    }))

    // Ticket type distribution
    const ticketTypeMap = new Map()
    orders.forEach((order) => {
      order.tickets.forEach((ticket) => {
        const type = ticket.type
        ticketTypeMap.set(type, (ticketTypeMap.get(type) || 0) + 1)
      })
    })

    const ticketTypeDistribution = Array.from(ticketTypeMap.entries()).map(([name, value]) => ({
      name,
      value,
    }))

    // Ticket type stats
    const ticketTypeStatsMap = new Map()
    orders.forEach((order) => {
      order.tickets.forEach((ticket) => {
        const type = ticket.type
        if (!ticketTypeStatsMap.has(type)) {
          ticketTypeStatsMap.set(type, { sold: 0, revenue: 0, prices: [] })
        }
        const current = ticketTypeStatsMap.get(type)
        current.sold += 1
        current.revenue += ticket.price
        current.prices.push(ticket.price)
      })
    })

    const ticketTypeStats = Array.from(ticketTypeStatsMap.entries()).map(([type, data]) => ({
      type,
      sold: data.sold,
      revenue: data.revenue,
      avgPrice: data.sold > 0 ? data.revenue / data.sold : 0,
    }))

    const salesData = {
      summary: {
        totalRevenue,
        totalTickets,
        totalOrders,
        avgOrderValue,
        revenueGrowth,
        ticketGrowth,
        orderGrowth,
        avgOrderGrowth,
      },
      events,
      orders,
      salesTrend,
      eventSales,
      ticketTypeDistribution,
      ticketTypeStats,
    }

    return NextResponse.json(salesData)
  } catch (error) {
    console.error("Error fetching sales data:", error)
    return NextResponse.json({ error: "Failed to fetch sales data" }, { status: 500 })
  }
}

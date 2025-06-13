"use client"

import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import { apiGet } from "@/lib/services/api-client"

export interface SalesData {
  summary: {
    totalRevenue: number
    totalTickets: number
    totalOrders: number
    avgOrderValue: number
    revenueGrowth: number
    ticketGrowth: number
    orderGrowth: number
    avgOrderGrowth: number
  }
  events: Array<{
    id: string
    title: string
  }>
  orders: Array<{
    id: string
    total: number
    status: string
    createdAt: string
    event: {
      title: string
    }
    user: {
      name?: string
      email: string
    }
    tickets: Array<{
      id: string
      type: string
      price: number
    }>
  }>
  salesTrend: Array<{
    date: string
    revenue: number
    tickets: number
  }>
  eventSales: Array<{
    eventTitle: string
    revenue: number
    tickets: number
  }>
  ticketTypeDistribution: Array<{
    name: string
    value: number
  }>
  ticketTypeStats: Array<{
    type: string
    sold: number
    revenue: number
    avgPrice: number
  }>
}

// API functions
export const salesApi = {
  getTicketSales: async (params?: {
    organizerId?: string
    eventId?: string
    ticketType?: string
    startDate?: string
    endDate?: string
  }): Promise<SalesData> => {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiGet<SalesData>(`/sales?${searchParams.toString()}`)
  },
}

// Query keys
export const salesKeys = {
  all: ["sales"] as const,
  ticketSales: (filters: {
    organizerId?: string
    eventId?: string
    ticketType?: string
    startDate?: string
    endDate?: string
  }) => [...salesKeys.all, "ticket-sales", filters] as const,
}

// Query hooks
export const useTicketSales = (
  params?: {
    organizerId?: string
    eventId?: string
    ticketType?: string
    startDate?: string
    endDate?: string
  },
  options?: Omit<UseQueryOptions<SalesData>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: salesKeys.ticketSales(params || {}),
    queryFn: () => salesApi.getTicketSales(params),
    enabled: !!params?.organizerId,
    ...options,
  })
}

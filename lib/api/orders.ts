"use client"

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query"
import { apiGet, apiPost, apiPatch } from "@/lib/services/api-client"
import type { Order, CreateOrderRequest, PaginatedResponse } from "@/lib/types/api"

// API functions
export const ordersApi = {
  getOrders: async (params?: { userId?: string; status?: string; page?: number; limit?: number }): Promise<
    PaginatedResponse<Order>
  > => {
    const searchParams = new URLSearchParams()

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString())
        }
      })
    }

    return apiGet<PaginatedResponse<Order>>(`/orders?${searchParams.toString()}`)
  },

  getOrder: async (id: string): Promise<Order> => {
    return apiGet<Order>(`/orders/${id}`)
  },

  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    return apiPost<Order>("/orders", data)
  },

  getUserOrders: async (userId: string): Promise<Order[]> => {
    const response = await apiGet<PaginatedResponse<Order>>(`/orders?userId=${userId}`)
    return response.data
  },

  cancelOrder: async (id: string): Promise<Order> => {
    return apiPatch<Order>(`/orders/${id}/cancel`)
  },
}

// Query keys
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: { userId?: string; status?: string; page?: number; limit?: number }) =>
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
  userOrders: (userId: string) => [...orderKeys.all, "user", userId] as const,
}

// Query hooks
export const useOrders = (
  params?: { userId?: string; status?: string; page?: number; limit?: number },
  options?: Omit<UseQueryOptions<PaginatedResponse<Order>>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: orderKeys.list(params || {}),
    queryFn: () => ordersApi.getOrders(params),
    ...options,
  })
}

export const useOrder = (id: string, options?: Omit<UseQueryOptions<Order>, "queryKey" | "queryFn">) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getOrder(id),
    enabled: !!id,
    ...options,
  })
}

export const useUserOrders = (userId: string, options?: Omit<UseQueryOptions<Order[]>, "queryKey" | "queryFn">) => {
  return useQuery({
    queryKey: orderKeys.userOrders(userId),
    queryFn: () => ordersApi.getUserOrders(userId),
    enabled: !!userId,
    ...options,
  })
}

// Mutation hooks
export const useCreateOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ordersApi.createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ordersApi.cancelOrder,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() })
    },
  })
}

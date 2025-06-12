"use client";

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/services/api-client";
import type { Ticket, PaginatedResponse } from "@/lib/types/api";

// API functions
export const ticketsApi = {
  getTickets: async (params?: {
    userId?: string;
    eventId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Ticket>> => {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString());
        }
      });
    }

    return apiGet<PaginatedResponse<Ticket>>(
      `/tickets?${searchParams.toString()}`
    );
  },

  getUserTickets: async (
    userId: string,
    orderId: string
  ): Promise<Ticket[]> => {
    const response = await apiGet<PaginatedResponse<Ticket>>(
      `/tickets?userId=${userId}&orderId=${orderId}`
    );
    return response.data;
  },

  verifyTicket: async (
    qrCode: string
  ): Promise<{ valid: boolean; ticket?: Ticket; message: string }> => {
    return apiPost<{ valid: boolean; ticket?: Ticket; message: string }>(
      "/tickets/verify",
      { qrCode }
    );
  },

  downloadTicket: async (ticketId: string): Promise<Blob> => {
    return apiGet<Blob>(`/tickets/${ticketId}/download`, {
      responseType: "blob",
    });
  },
};

// Query keys
export const ticketKeys = {
  all: ["tickets"] as const,
  lists: () => [...ticketKeys.all, "list"] as const,
  list: (filters: {
    userId?: string;
    eventId?: string;
    page?: number;
    limit?: number;
  }) => [...ticketKeys.lists(), filters] as const,
  userTickets: (userId: string) => [...ticketKeys.all, "user", userId] as const,
};

// Query hooks
export const useTickets = (
  params?: { userId?: string; eventId?: string; page?: number; limit?: number },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Ticket>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: ticketKeys.list(params || {}),
    queryFn: () => ticketsApi.getTickets(params),
    ...options,
  });
};

export const useUserTickets = (
  userId: string,
  orderId?: string,
  options?: Omit<UseQueryOptions<Ticket[]>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ticketKeys.userTickets(userId),
    queryFn: () => ticketsApi.getUserTickets(userId, orderId || ""),
    enabled: !!userId,
    ...options,
  });
};

// Mutation hooks
export const useVerifyTicket = () => {
  return useMutation({
    mutationFn: ticketsApi.verifyTicket,
  });
};

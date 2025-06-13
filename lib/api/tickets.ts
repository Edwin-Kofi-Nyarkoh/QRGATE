import { useMutation, useQuery } from "@tanstack/react-query";
import { getClient } from "@/lib/services/api-client";
const apiClient = getClient();

// Fetch tickets for a user
export const useUserTickets = (userId?: string, orderId?: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["tickets", userId, orderId, page, limit],
    queryFn: async () => {
      const response = await apiClient.get(
        `/tickets?userId=${userId}&orderId=${orderId}&page=${page}&limit=${limit}`
      );
      return response.data;
    },
  });
};

// Fetch tickets for an event
export const useEventTickets = (eventId: string, page = 1, limit = 10) => {
  return useQuery({
    queryKey: ["eventTickets", eventId, page, limit],
    queryFn: async () => {
      const response = await apiClient.get(
        `/tickets?eventId=${eventId}&page=${page}&limit=${limit}`
      );
      return response.data;
    },
    enabled: !!eventId,
  });
};

// Verify a ticket
export const useVerifyTicket = () => {
  return useMutation({
    mutationFn: async (data: { qrCode: string; eventId: string }) => {
      const response = await apiClient.post("/tickets/verify", data);
      return response.data;
    },
  });
};

// Get a ticket by ID
export const useTicket = (id: string) => {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const response = await apiClient.get(`/tickets/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

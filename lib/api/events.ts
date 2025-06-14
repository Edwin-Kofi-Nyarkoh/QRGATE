"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/services/api-client";
import type {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  PaginatedResponse,
  EventFilters,
} from "@/lib/types/api";

// API functions
export const eventsApi = {
  getEvents: async (
    params?: EventFilters & { page?: number; limit?: number }
  ): Promise<PaginatedResponse<Event>> => {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, value.toString());
        }
      });
    }

    const response = await apiGet<PaginatedResponse<Event>>(
      `/events?${searchParams.toString()}`
    );
    // Ensure both 'data' and 'events' are present for compatibility
    return {
      ...response,
      events: response.events ?? response.data,
      data: response.data ?? response.events,
    };
  },

  getEvent: async (id: string): Promise<Event> => {
    return apiGet<Event>(`/events/${id}`);
  },

  createEvent: async (data: CreateEventRequest): Promise<Event> => {
    return apiPost<Event>("/events", data);
  },

  updateEvent: async (id: string, data: UpdateEventRequest): Promise<Event> => {
    return apiPut<Event>(`/events/${id}`, data);
  },

  deleteEvent: async (id: string): Promise<void> => {
    return apiDelete<void>(`/events/${id}`);
  },

  getFeaturedEvents: async (): Promise<Event[]> => {
    const response = await apiGet<PaginatedResponse<Event>>(
      "/events?status=UPCOMING&limit=6"
    );
    return response.events;
  },

  getUpcomingEvents: async (): Promise<Event[]> => {
    const response = await apiGet<PaginatedResponse<Event>>(
      "/events?status=UPCOMING&limit=4"
    );
    return response.events;
  },

  getOngoingEvents: async (): Promise<Event[]> => {
    const response = await apiGet<PaginatedResponse<Event>>(
      "/events?status=ONGOING&limit=4"
    );
    return response.events;
  },

  getPastEvents: async (): Promise<Event[]> => {
    const response = await apiGet<PaginatedResponse<Event>>(
      "/events?status=PAST&limit=4"
    );
    return response.events;
  },

  getDiscoverEvents: async (): Promise<Event[]> => {
    const response = await apiGet<PaginatedResponse<Event>>("/events?limit=8");
    return response.data;
  },
};

// Query keys
export const eventKeys = {
  all: ["events"] as const,
  lists: () => [...eventKeys.all, "list"] as const,
  list: (filters: EventFilters & { page?: number; limit?: number }) =>
    [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, "detail"] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  featured: () => [...eventKeys.all, "featured"] as const,
  upcoming: () => [...eventKeys.all, "upcoming"] as const,
  ongoing: () => [...eventKeys.all, "ongoing"] as const,
  past: () => [...eventKeys.all, "past"] as const,
  discover: () => [...eventKeys.all, "discover"] as const,
};

// Query hooks
export const useEvents = (
  params?: EventFilters & { page?: number; limit?: number },
  options?: Omit<
    UseQueryOptions<PaginatedResponse<Event>>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery({
    queryKey: eventKeys.list(params || {}),
    queryFn: () => eventsApi.getEvents(params),
    ...options,
  });
};

export const useEvent = (
  id: string,
  options?: Omit<UseQueryOptions<Event>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: () => eventsApi.getEvent(id),
    enabled: !!id,
    ...options,
  });
};

export const useFeaturedEvents = (
  options?: Omit<UseQueryOptions<Event[]>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: eventKeys.featured(),
    queryFn: eventsApi.getFeaturedEvents,
    ...options,
  });
};

export const useUpcomingEvents = (
  options?: Omit<UseQueryOptions<Event[]>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: eventKeys.upcoming(),
    queryFn: eventsApi.getUpcomingEvents,
    ...options,
  });
};

export const useOngoingEvents = (
  options?: Omit<UseQueryOptions<Event[]>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: eventKeys.ongoing(),
    queryFn: eventsApi.getOngoingEvents,
    ...options,
  });
};

export const usePastEvents = (
  options?: Omit<UseQueryOptions<Event[]>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: ["events", "past"],
    queryFn: eventsApi.getPastEvents,
    ...options,
  });
};

// Mutation hooks
export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventRequest }) =>
      eventsApi.updateEvent(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: eventsApi.deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.all });
    },
  });
};

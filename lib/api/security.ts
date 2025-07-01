import { useMutation, useQuery } from "@tanstack/react-query";
import { getClient } from "@/lib/services/api-client";
import type { CreateSecurityOfficerRequest } from "@/lib/types/api";

const apiClient = getClient();

// Fetch security officers for an event
export const useSecurityOfficers = (eventId?: string) => {
  return useQuery({
    queryKey: ["securityOfficers", eventId],
    queryFn: async () => {
      const url = eventId
        ? `/api/security?eventId=${eventId}`
        : "/api/security";
      const response = await apiClient.get(url);
      return response.data.officers;
    },
    enabled: !!eventId,
  });
};

// Create a new security officer
export const useCreateSecurityOfficer = () => {
  return useMutation({
    mutationFn: async (data: CreateSecurityOfficerRequest) => {
      const response = await apiClient.post("/api/security", data);
      return response.data;
    },
  });
};

// Update a security officer
export const useUpdateSecurityOfficer = () => {
  return useMutation({
    mutationFn: async (data: {
      id: string;
      name?: string;
      phone?: string;
      active?: boolean;
    }) => {
      const { id, ...updateData } = data;
      const response = await apiClient.put(`/api/security/${id}`, updateData);
      return response.data;
    },
  });
};

// Delete a security officer
export const useDeleteSecurityOfficer = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/security/${id}`);
      return response.data;
    },
  });
};

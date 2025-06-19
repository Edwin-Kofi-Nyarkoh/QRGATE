import { useMutation, useQuery } from "@tanstack/react-query";
import { getClient } from "@/lib/services/api-client";

const apiClient = getClient();

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio: string;
}

interface AboutData {
  mission: string;
  vision: string;
  story: string;
  founded: string;
  location: string;
  teamSize: number;
  eventsHosted: number;
  happyCustomers: number;
  teamMembers: TeamMember[];
  values: string[];
  contact: {
    email: string;
    phone: string;
    website: string;
  };
}

interface UpdateAboutData {
  mission?: string;
  vision?: string;
  story?: string;
  founded?: string;
  location?: string;
  teamSize?: number;
  eventsHosted?: number;
  happyCustomers?: number;
  values?: string[];
  contact?: {
    email?: string;
    phone?: string;
    website?: string;
  };
}

// Fetch about data
export const useAbout = () => {
  return useQuery({
    queryKey: ["about"],
    queryFn: async () => {
      const response = await apiClient.get("/about");
      console.log("About data response:", response.data);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch team members
export const useTeamMembers = () => {
  return useQuery({
    queryKey: ["teamMembers"],
    queryFn: async () => {
      const response = await apiClient.get("/about/team");
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get a specific team member
export const useTeamMember = (id: string) => {
  return useQuery({
    queryKey: ["teamMember", id],
    queryFn: async () => {
      const response = await apiClient.get(`/about/team/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Update about data (admin only)
export const useUpdateAbout = () => {
  return useMutation({
    mutationFn: async (data: UpdateAboutData) => {
      const response = await apiClient.put("/about", data);
      return response.data;
    },
  });
};

// Add team member (admin only)
export const useAddTeamMember = () => {
  return useMutation({
    mutationFn: async (data: Omit<TeamMember, "id">) => {
      const response = await apiClient.post("/about/team", data);
      return response.data;
    },
  });
};

// Update team member (admin only)
export const useUpdateTeamMember = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }: TeamMember) => {
      const response = await apiClient.put(`/about/team/${id}`, data);
      return response.data;
    },
  });
};

// Delete team member (admin only)
export const useDeleteTeamMember = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/about/team/${id}`);
      return response.data;
    },
  });
};

// Get company stats
export const useCompanyStats = () => {
  return useQuery({
    queryKey: ["companyStats"],
    queryFn: async () => {
      const response = await apiClient.get("/about/stats");
      return response.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Update company stats (admin only)
export const useUpdateCompanyStats = () => {
  return useMutation({
    mutationFn: async (data: {
      eventsHosted?: number;
      happyCustomers?: number;
      teamSize?: number;
    }) => {
      const response = await apiClient.put("/about/stats", data);
      return response.data;
    },
  });
};
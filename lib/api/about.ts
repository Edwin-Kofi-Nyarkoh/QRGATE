import { useMutation, useQuery } from "@tanstack/react-query"
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/services/api-client"

interface TeamMember {
  id: string
  name: string
  role: string
  image: string
  bio: string
}

interface AboutData {
  mission: string
  vision: string
  story: string
  founded: string
  location: string
  teamSize: number
  eventsHosted: number
  happyCustomers: number
  teamMembers: TeamMember[]
  values: string[]
  contact: {
    email: string
    phone: string
    website: string
  }
}

interface UpdateAboutData {
  mission?: string
  vision?: string
  story?: string
  founded?: string
  location?: string
  teamSize?: number
  eventsHosted?: number
  happyCustomers?: number
  values?: string[]
  contact?: {
    email?: string
    phone?: string
    website?: string
  }
}

// Fetch about data
export const useAbout = () => {
  return useQuery({
    queryKey: ["about"],
    queryFn: async () => {
      const data = await apiGet<AboutData>("/about")
      console.log("About data response:", data)
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Fetch team members
export const useTeamMembers = () => {
  return useQuery({
    queryKey: ["teamMembers"],
    queryFn: async () => {
      return await apiGet<TeamMember[]>("/about/team")
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Get a specific team member
export const useTeamMember = (id: string) => {
  return useQuery({
    queryKey: ["teamMember", id],
    queryFn: async () => {
      return await apiGet<TeamMember>(`/about/team/${id}`)
    },
    enabled: !!id,
  })
}

// Update about data (admin only)
export const useUpdateAbout = () => {
  return useMutation({
    mutationFn: async (data: UpdateAboutData) => {
      return await apiPut<AboutData>("/about", data)
    },
  })
}

// Add team member (admin only)
export const useAddTeamMember = () => {
  return useMutation({
    mutationFn: async (data: Omit<TeamMember, "id">) => {
      return await apiPost<TeamMember>("/about/team", data)
    },
  })
}

// Update team member (admin only)
export const useUpdateTeamMember = () => {
  return useMutation({
    mutationFn: async ({ id, ...data }: TeamMember) => {
      return await apiPut<TeamMember>(`/about/team/${id}`, data)
    },
  })
}

// Delete team member (admin only)
export const useDeleteTeamMember = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      return await apiDelete<{ success: boolean }>(`/about/team/${id}`)
    },
  })
}

// Get company stats
export const useCompanyStats = () => {
  return useQuery({
    queryKey: ["companyStats"],
    queryFn: async () => {
      return await apiGet<{
        eventsHosted: number
        happyCustomers: number
        teamSize: number
      }>("/about/stats")
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

// Update company stats (admin only)
export const useUpdateCompanyStats = () => {
  return useMutation({
    mutationFn: async (data: {
      eventsHosted?: number
      happyCustomers?: number
      teamSize?: number
    }) => {
      return await apiPut<{
        eventsHosted: number
        happyCustomers: number
        teamSize: number
      }>("/about/stats", data)
    },
  })
}



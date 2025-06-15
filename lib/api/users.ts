"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "@/lib/services/api-client";
import type { User, UpdateUserRequest } from "@/lib/types/api";

// API functions
export const usersApi = {
  getUser: async (id: string): Promise<User> => {
    return apiGet<User>(`/users/${id}`);
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    return apiPut<User>(`/users/${id}`, data);
  },

  getCurrentUser: async (): Promise<User> => {
    return apiGet<User>("/users/me");
  },

  updatePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    return apiPost<void>("/users/change-password", data);
  },
};

// Query keys
export const userKeys = {
  all: ["users"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  current: () => [...userKeys.all, "current"] as const,
};

// Query hooks
export const useUser = (
  id: string,
  options?: Omit<UseQueryOptions<User>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
    ...options,
  });
};

// export const useCurrentUserMe = ({ userId }: { userId?: string }) => {
//   return useQuery({
//     queryKey: ["userMe"],
//     queryFn: () => usersApi.getCurrentUser(),
//     enabled: !!userId,
//   });
// };

export const useCurrentUser = (
  options?: Omit<UseQueryOptions<User>, "queryKey" | "queryFn">
) => {
  return useQuery({
    queryKey: userKeys.current(),
    queryFn: usersApi.getCurrentUser,
    ...options,
  });
};

// Mutation hooks
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.current() });
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: usersApi.updatePassword,
  });
};

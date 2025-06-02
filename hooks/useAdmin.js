"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";

const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  // Base API call function using apiClient
  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const { method = "GET", data, ...config } = options;

      const response = await apiClient({
        url: endpoint,
        method,
        data,
        ...config,
      });

      return response.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "An error occurred";
      throw new Error(errorMessage);
    }
  }, []);

  // Dashboard Stats
  const useDashboardStats = () => {
    return useQuery({
      queryKey: ["admin", "dashboard", "stats"],
      queryFn: () => apiCall("/admin/dashboard/stats"),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  // Analytics Queries
  const useUserAnalytics = (period = "30d") => {
    return useQuery({
      queryKey: ["admin", "analytics", "users", period],
      queryFn: () => apiCall(`/admin/analytics/users?period=${period}`),
      staleTime: 15 * 60 * 1000, // 15 minutes
    });
  };

  const useUsageAnalytics = (period = "30d") => {
    return useQuery({
      queryKey: ["admin", "analytics", "usage", period],
      queryFn: () => apiCall(`/admin/analytics/usage?period=${period}`),
      staleTime: 15 * 60 * 1000,
    });
  };

  const useContentAnalytics = (period = "30d") => {
    return useQuery({
      queryKey: ["admin", "analytics", "content", period],
      queryFn: () => apiCall(`/admin/analytics/content?period=${period}`),
      staleTime: 15 * 60 * 1000,
    });
  };

  // User Management
  const useUsers = (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return useQuery({
      queryKey: ["admin", "users", params],
      queryFn: () => apiCall(`/admin/users?${searchParams}`),
      keepPreviousData: true,
    });
  };

  // User Role Update Mutation
  const useUpdateUserRole = () => {
    return useMutation({
      mutationFn: ({ userId, role, permissions }) =>
        apiCall(`/admin/users/${userId}/role`, {
          method: "PUT",
          data: { role, permissions },
        }),
      onSuccess: () => {
        queryClient.invalidateQueries(["admin", "users"]);
        queryClient.invalidateQueries(["admin", "dashboard"]);
      },
    });
  };

  // Delete User Mutation
  const useDeleteUser = () => {
    return useMutation({
      mutationFn: (userId) =>
        apiCall(`/admin/users/${userId}`, { method: "DELETE" }),
      onSuccess: () => {
        queryClient.invalidateQueries(["admin", "users"]);
        queryClient.invalidateQueries(["admin", "dashboard"]);
      },
    });
  };

  // Content Management
  const usePendingContent = (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return useQuery({
      queryKey: ["admin", "content", "pending", params],
      queryFn: () => apiCall(`/admin/content/pending?${searchParams}`),
      keepPreviousData: true,
    });
  };

  const useApproveContent = () => {
    return useMutation({
      mutationFn: ({ contentId, reason }) =>
        apiCall(`/admin/content/${contentId}/approve`, {
          method: "PUT",
          data: { reason },
        }),
      onSuccess: () => {
        queryClient.invalidateQueries(["admin", "content"]);
        queryClient.invalidateQueries(["admin", "dashboard"]);
      },
    });
  };

  const useDeleteContent = () => {
    return useMutation({
      mutationFn: (contentId) =>
        apiCall(`/admin/content/${contentId}`, { method: "DELETE" }),
      onSuccess: () => {
        queryClient.invalidateQueries(["admin", "content"]);
        queryClient.invalidateQueries(["admin", "dashboard"]);
      },
    });
  };

  // Story Moderation
  const usePendingStories = (params = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    return useQuery({
      queryKey: ["admin", "stories", "pending", params],
      queryFn: () => apiCall(`/admin/stories/pending?${searchParams}`),
      keepPreviousData: true,
    });
  };

  const useModerateStory = () => {
    return useMutation({
      mutationFn: ({ storyId, action, reason }) =>
        apiCall(`/admin/stories/${storyId}/moderate`, {
          method: "PUT",
          data: { action, reason },
        }),
      onSuccess: () => {
        queryClient.invalidateQueries(["admin", "stories"]);
        queryClient.invalidateQueries(["admin", "dashboard"]);
      },
    });
  };

  // System Health
  const useSystemHealth = () => {
    return useQuery({
      queryKey: ["admin", "system", "health"],
      queryFn: () => apiCall("/admin/system/health"),
      refetchInterval: 60 * 1000, // Refetch every minute
      staleTime: 30 * 1000, // 30 seconds
    });
  };

  // System Backup
  const useCreateBackup = () => {
    return useMutation({
      mutationFn: () => apiCall("/admin/system/backup", { method: "POST" }),
    });
  };

  // Bulk Operations
  const useBulkUserUpdate = () => {
    return useMutation({
      mutationFn: ({ userIds, updates }) =>
        apiCall("/admin/users/bulk-update", {
          method: "PUT",
          data: { userIds, updates },
        }),
      onSuccess: () => {
        queryClient.invalidateQueries(["admin", "users"]);
        queryClient.invalidateQueries(["admin", "dashboard"]);
      },
    });
  };

  const useBulkStoryModeration = () => {
    return useMutation({
      mutationFn: ({ storyIds, action, reason }) =>
        apiCall("/admin/stories/bulk-moderate", {
          method: "PUT",
          data: { storyIds, action, reason },
        }),
      onSuccess: () => {
        queryClient.invalidateQueries(["admin", "stories"]);
        queryClient.invalidateQueries(["admin", "dashboard"]);
      },
    });
  };

  // Export Data
  const exportData = useCallback(async (type, format = "csv", params = {}) => {
    try {
      setLoading(true);
      setError(null);

      const searchParams = new URLSearchParams({
        format,
        ...params,
      }).toString();
      const response = await apiClient({
        url: `/admin/export/${type}?${searchParams}`,
        method: "GET",
        responseType: "blob",
      });

      // Handle file download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${type}-export-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time Notifications
  const useNotifications = () => {
    return useQuery({
      queryKey: ["admin", "notifications"],
      queryFn: () => apiCall("/admin/notifications"),
      refetchInterval: 30 * 1000, // 30 seconds
    });
  };

  const useMarkNotificationRead = () => {
    return useMutation({
      mutationFn: (notificationId) =>
        apiCall(`/admin/notifications/${notificationId}/read`, {
          method: "PUT",
        }),
      onSuccess: () => {
        queryClient.invalidateQueries(["admin", "notifications"]);
      },
    });
  };

  // Advanced Search
  const searchUsers = useCallback(
    async (query, filters = {}) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ q: query, ...filters }).toString();
        const result = await apiCall(`/admin/users/search?${params}`);
        return result;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  const searchContent = useCallback(
    async (query, filters = {}) => {
      try {
        setLoading(true);
        const params = new URLSearchParams({ q: query, ...filters }).toString();
        const result = await apiCall(`/admin/content/search?${params}`);
        return result;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  return {
    // State
    loading,
    error,
    setError,

    // Dashboard & Analytics
    useDashboardStats,
    useUserAnalytics,
    useUsageAnalytics,
    useContentAnalytics,

    // User Management
    useUsers,
    useUpdateUserRole,
    useDeleteUser,
    useBulkUserUpdate,

    // Content Management
    usePendingContent,
    useApproveContent,
    useDeleteContent,

    // Story Moderation
    usePendingStories,
    useModerateStory,
    useBulkStoryModeration,

    // System Management
    useSystemHealth,
    useCreateBackup,

    // Notifications
    useNotifications,
    useMarkNotificationRead,

    // Utilities
    exportData,
    searchUsers,
    searchContent,
    apiCall,
  };
};

export default useAdmin;

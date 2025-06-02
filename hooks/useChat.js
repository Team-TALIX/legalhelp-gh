"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";
import { useAuth } from "./useAuth";

export default function useChat(preferredLanguage = "en") {
  const [sessionId, setSessionId] = useState(() => {
    // Try to restore session from localStorage
    if (typeof window !== "undefined") {
      return localStorage.getItem("currentChatSession") || null;
    }
    return null;
  });
  const [error, setError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSessionCreationAttempt, setLastSessionCreationAttempt] =
    useState(null);
  const { user } = useAuth();
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

  // Create a new chat session
  const createSessionMutation = useMutation({
    mutationFn: (context = {}) => {
      if (!user) {
        throw new Error("User must be authenticated to create a session");
      }
      return apiCall("/chat/sessions", {
        method: "POST",
        data: { context },
      });
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setError(null);
      setIsInitialized(true);
      // Store session in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("currentChatSession", data.sessionId);
      }
    },
    onError: (error) => {
      const isRateLimit =
        error.message.includes("Too many") ||
        error.message.includes("rate limit");
      const errorMessage = isRateLimit
        ? "Too many requests. Please wait a moment before trying again."
        : `Error creating session: ${error.message}`;
      setError(errorMessage);
      console.error("Error creating chat session:", error);
    },
    retry: 1, // Only retry once to prevent spam
  });

  // Send a chat query
  const sendMessageMutation = useMutation({
    mutationFn: ({ content, context = {}, isVoiceInput = false }) => {
      if (!sessionId) {
        throw new Error("No active session");
      }
      return apiCall("/chat/query", {
        method: "POST",
        data: {
          sessionId,
          content,
          language: preferredLanguage,
          context,
          isVoiceInput,
        },
      });
    },
    onSuccess: (data) => {
      // Invalidate chat history to trigger refetch
      queryClient.invalidateQueries(["chat", "history", sessionId]);
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      console.error("Error sending message:", error);
    },
  });

  // Submit feedback for a message
  const submitFeedbackMutation = useMutation({
    mutationFn: ({ messageIndex, rating, feedback, helpful }) =>
      apiCall("/chat/feedback", {
        method: "POST",
        data: {
          sessionId,
          messageIndex,
          rating,
          feedback,
          helpful,
        },
      }),
    onSuccess: () => {
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      console.error("Error submitting feedback:", error);
    },
  });

  // Update session context
  const updateSessionMutation = useMutation({
    mutationFn: ({ context, active }) =>
      apiCall(`/chat/sessions/${sessionId}`, {
        method: "PUT",
        data: { context, active },
      }),
    onSuccess: () => {
      setError(null);
    },
    onError: (error) => {
      setError(error.message);
      console.error("Error updating session:", error);
    },
  });

  // Delete session
  const deleteSessionMutation = useMutation({
    mutationFn: () =>
      apiCall(`/chat/sessions/${sessionId}`, {
        method: "DELETE",
        data: { confirmDelete: true },
      }),
      refetchOnWindowFocus: false,
    onSuccess: () => {
      const deletedSessionId = sessionId;
      setSessionId(null);
      setIsInitialized(false); // Allow new session creation
      queryClient.removeQueries(["chat", "history", deletedSessionId]);
      setError(null);
      // Clear from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("currentChatSession");
      }
      console.log("Deleted session:", deletedSessionId);
    },
    onError: (error) => {
      setError(error.message);
      console.error("Error deleting session:", error);
    },
  });

  // Get chat history for current session
  const {
    data: historyData,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery({
    queryKey: ["chat", "history", sessionId],
    queryFn: () => {
      if (!sessionId) return { messages: [], context: {} };
      return apiCall(`/chat/sessions/${sessionId}/history?page=4&limit=50&offset=0`);
    },
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });

  // Get user's chat sessions list
  const {
    data: sessionsData,
    isLoading: isLoadingSessions,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ["chat", "sessions", user?.id],
    queryFn: () => apiCall("/chat/sessions?page=1&limit=20&active=true"),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Validate stored session when user is available
  useEffect(() => {
    if (user && sessionId && !isInitialized) {
      // Validate that the stored session actually exists
      const validateSession = async () => {
        try {
          await apiCall(`/chat/sessions/${sessionId}/history?limit=1&offset=0`);
          setIsInitialized(true);
          console.log("Restored existing session:", sessionId);
        } catch (error) {
          // Session doesn't exist or is invalid, clear it
          console.log("Stored session invalid, creating new one");
          setSessionId(null);
          if (typeof window !== "undefined") {
            localStorage.removeItem("currentChatSession");
          }
        }
      };
      validateSession();
    }
  }, [user, sessionId, isInitialized, apiCall]);

  // Initialize session when component mounts or user changes
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastAttempt = lastSessionCreationAttempt
      ? now - lastSessionCreationAttempt
      : Infinity;

    // Prevent rapid session creation attempts (wait at least 2 seconds between attempts)
    if (
      !sessionId &&
      !createSessionMutation.isPending &&
      user &&
      !isInitialized &&
      timeSinceLastAttempt > 2000
    ) {
      console.log("Creating new chat session for user:", user.id);
      setLastSessionCreationAttempt(now);
      createSessionMutation.mutate();
    }
  }, [sessionId, user, isInitialized, lastSessionCreationAttempt]); // Remove createSessionMutation from dependencies

  // Helper functions
  const sendMessage = useCallback(
    async (content, context = {}) => {
      try {
        await sendMessageMutation.mutateAsync({ content, context });
      } catch (error) {
        // Error is already handled in mutation
        throw error;
      }
    },
    [sendMessageMutation]
  );

  const sendVoiceMessage = useCallback(
    async (audioBlob, context = {}) => {
      try {
        // Convert audio blob to text using NLP service first
        const formData = new FormData();
        formData.append("audio", audioBlob);
        formData.append("language", preferredLanguage);

        const transcriptionResponse = await apiClient({
          url: "/nlp/speech-to-text",
          method: "POST",
          data: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (transcriptionResponse.data?.text) {
          await sendMessageMutation.mutateAsync({
            content: transcriptionResponse.data.text,
            context,
            isVoiceInput: true,
          });
        } else {
          throw new Error("Failed to transcribe audio");
        }
      } catch (error) {
        setError("Failed to process voice message: " + error.message);
        throw error;
      }
    },
    [sendMessageMutation, preferredLanguage]
  );

  const submitFeedback = useCallback(
    async (messageIndex, rating, feedback, helpful = true) => {
      try {
        await submitFeedbackMutation.mutateAsync({
          messageIndex,
          rating,
          feedback,
          helpful,
        });
      } catch (error) {
        throw error;
      }
    },
    [submitFeedbackMutation]
  );

  const updateSessionContext = useCallback(
    async (context, active = true) => {
      try {
        await updateSessionMutation.mutateAsync({ context, active });
      } catch (error) {
        throw error;
      }
    },
    [updateSessionMutation]
  );

  const deleteSession = useCallback(async () => {
    try {
      await deleteSessionMutation.mutateAsync();
    } catch (error) {
      throw error;
    }
  }, [deleteSessionMutation]);

  const createNewSession = useCallback(
    async (context = {}) => {
      const now = Date.now();
      const timeSinceLastAttempt = lastSessionCreationAttempt
        ? now - lastSessionCreationAttempt
        : Infinity;

      // Prevent rapid session creation attempts
      if (timeSinceLastAttempt < 2000) {
        throw new Error("Please wait before creating another session");
      }

      try {
        setLastSessionCreationAttempt(now);
        await createSessionMutation.mutateAsync(context);
      } catch (error) {
        throw error;
      }
    },
    [createSessionMutation, lastSessionCreationAttempt]
  );

  const switchToSession = useCallback(
    (newSessionId) => {
      if (newSessionId !== sessionId) {
        setSessionId(newSessionId);
        setError(null);
        // Update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("currentChatSession", newSessionId);
        }
        console.log("Switched to session:", newSessionId);
      }
    },
    [sessionId]
  );

  // Fallback mock data only when backend is not available
  const getMockMessages = () => [
    {
      role: "assistant",
      content:
        "Hello! I'm here to help you with legal questions in Ghana. You can ask me about tenant rights, land registration, worker rights, and more. How can I assist you today?",
      language: preferredLanguage,
      timestamp: new Date().toISOString(),
    },
  ];

  const messages =
    historyData?.messages || (historyError ? getMockMessages() : []);
  const sessions = sessionsData?.sessions || [];
  const context = historyData?.context || {};

  const isLoading =
    createSessionMutation.isPending ||
    sendMessageMutation.isPending ||
    isLoadingHistory;

  const combinedError = error || historyError?.message || null;

  return {
    // Session management
    sessionId,
    sessions,
    createNewSession,
    switchToSession,
    deleteSession,
    refetchSessions,

    // Messages and context
    messages,
    context,
    isLoading,
    isLoadingHistory,
    isLoadingSessions,
    error: combinedError,
    setError,

    // Message sending
    sendMessage,
    sendVoiceMessage,
    isSending: sendMessageMutation.isPending,

    // Feedback and updates
    submitFeedback,
    updateSessionContext,

    // Mutation states for UI feedback
    isCreatingSession: createSessionMutation.isPending,
    isUpdatingSession: updateSessionMutation.isPending,
    isDeletingSession: deleteSessionMutation.isPending,
    isSubmittingFeedback: submitFeedbackMutation.isPending,
  };
}

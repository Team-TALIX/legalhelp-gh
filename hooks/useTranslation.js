"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import apiClient from "../lib/api.js";

/**
 * Custom hook for handling translations using NPLGhana APIs
 * Provides translation functionality with caching, error handling, and loading states
 */
export function useTranslation() {
  const queryClient = useQueryClient();
  const [translationHistory, setTranslationHistory] = useState(new Map());

  // Base API call function using apiClient (following useAdmin pattern)
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

  // Get supported languages
  const {
    data: supportedLanguages,
    isLoading: languagesLoading,
    error: languagesError,
    refetch: refetchLanguages,
  } = useQuery({
    queryKey: ["nlp", "languages"],
    queryFn: () => apiCall("/nlp/languages"),
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Translation mutation
  const translationMutation = useMutation({
    mutationFn: async ({ text, fromLanguage, toLanguage }) => {
      if (!text?.trim()) {
        throw new Error("Text is required for translation");
      }

      if (!fromLanguage || !toLanguage) {
        throw new Error("Both source and target languages are required");
      }

      // Check if translation already exists in history
      const historyKey = `${text.trim()}_${fromLanguage}_${toLanguage}`;
      if (translationHistory.has(historyKey)) {
        return translationHistory.get(historyKey);
      }

      const result = await apiCall("/nlp/translate", {
        method: "POST",
        data: {
          text: text.trim(),
          fromLanguage,
          toLanguage,
        },
      });

      // Store in history
      setTranslationHistory((prev) => new Map(prev.set(historyKey, result)));

      return result;
    },
    onSuccess: (data, variables) => {
      // Update query cache for future requests
      const cacheKey = [
        "translation",
        variables.text,
        variables.fromLanguage,
        variables.toLanguage,
      ];
      queryClient.setQueryData(cacheKey, data);
    },
    onError: (error, variables) => {
      console.error("Translation failed:", error, variables);
    },
  });

  // Helper function to translate text
  const translateText = useCallback(
    async (text, fromLanguage, toLanguage) => {
      try {
        const result = await translationMutation.mutateAsync({
          text,
          fromLanguage,
          toLanguage,
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    [translationMutation]
  );

  // Auto-translate function with language detection fallback
  const autoTranslate = useCallback(
    async (text, targetLanguage = "en", sourceLanguage = null) => {
      if (!text?.trim()) return null;

      // If no source language provided, try to detect or assume common language
      const detectedSourceLang = sourceLanguage || detectLanguage(text) || "tw";

      if (detectedSourceLang === targetLanguage) {
        return {
          success: true,
          data: {
            translatedText: text,
            sourceLanguage: detectedSourceLang,
            targetLanguage,
            engine: "none",
            confidence: 1.0,
          },
        };
      }

      return await translateText(text, detectedSourceLang, targetLanguage);
    },
    [translateText]
  );

  // Batch translation for multiple texts
  const translateBatch = useCallback(
    async (texts, fromLanguage, toLanguage) => {
      if (!Array.isArray(texts) || texts.length === 0) {
        throw new Error("Texts array is required for batch translation");
      }

      const translations = await Promise.allSettled(
        texts.map((text) => translateText(text, fromLanguage, toLanguage))
      );

      return translations.map((result, index) => ({
        originalText: texts[index],
        translation: result.status === "fulfilled" ? result.value : null,
        error: result.status === "rejected" ? result.reason : null,
      }));
    },
    [translateText]
  );

  // Clear translation history
  const clearHistory = useCallback(() => {
    setTranslationHistory(new Map());
  }, []);

  // Get translation from history
  const getFromHistory = useCallback(
    (text, fromLanguage, toLanguage) => {
      const historyKey = `${text?.trim()}_${fromLanguage}_${toLanguage}`;
      return translationHistory.get(historyKey);
    },
    [translationHistory]
  );

  // Get available languages formatted for UI
  const getAvailableLanguages = useCallback(() => {
    if (!supportedLanguages?.success || !supportedLanguages?.data?.languages) {
      // Fallback languages
      return [
        { code: "en", name: "English" },
        { code: "tw", name: "Twi" },
        { code: "gaa", name: "Ga" },
        { code: "ee", name: "Ewe" },
        { code: "dag", name: "Dagbani" },
      ];
    }

    return supportedLanguages.data.languages;
  }, [supportedLanguages]);

  // Check if a language is supported
  const isLanguageSupported = useCallback(
    (languageCode) => {
      const languages = getAvailableLanguages();
      return languages.some((lang) => lang.code === languageCode);
    },
    [getAvailableLanguages]
  );

  return {
    // Translation functions
    translateText,
    autoTranslate,
    translateBatch,

    // State
    isTranslating: translationMutation.isPending,
    translationError: translationMutation.error,
    lastTranslation: translationMutation.data,

    // Languages
    supportedLanguages: getAvailableLanguages(),
    languagesLoading,
    languagesError,
    isLanguageSupported,
    refetchLanguages,

    // History management
    translationHistory: Array.from(translationHistory.entries()),
    getFromHistory,
    clearHistory,

    // Utilities
    reset: translationMutation.reset,
    retry: translationMutation.mutate,
  };
}

/**
 * Simple language detection based on text patterns
 * This is a basic implementation - in production you might want to use a proper language detection library
 */
function detectLanguage(text) {
  if (!text || typeof text !== "string") return null;

  const lowerText = text.toLowerCase();

  // English patterns
  if (/\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/.test(lowerText)) {
    return "en";
  }

  // Twi patterns (common words)
  if (
    /\b(me|wo|ɔ|ne|na|sɛ|nti|ɛte|sɛn|yɛ|kɔ|ba|di|si|gyina)\b/.test(lowerText)
  ) {
    return "tw";
  }

  // Ewe patterns
  if (/\b(nye|wò|eya|le|kple|loo|aƒe|ame|nu|va|yi|nɔ)\b/.test(lowerText)) {
    return "ee";
  }

  // Default to Twi if no pattern matches
  return "tw";
}

/**
 * Hook for managing user's translation preferences
 */
export function useTranslationPreferences() {
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("translation-preferences");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn(
            "Failed to parse translation preferences from localStorage"
          );
        }
      }
    }

    return {
      defaultSourceLanguage: "tw",
      defaultTargetLanguage: "en",
      autoTranslate: false,
      showOriginal: true,
      preferredVoice: null,
    };
  });

  const updatePreferences = useCallback((updates) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, ...updates };

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "translation-preferences",
          JSON.stringify(newPrefs)
        );
      }

      return newPrefs;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    const defaultPrefs = {
      defaultSourceLanguage: "tw",
      defaultTargetLanguage: "en",
      autoTranslate: false,
      showOriginal: true,
      preferredVoice: null,
    };

    setPreferences(defaultPrefs);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "translation-preferences",
        JSON.stringify(defaultPrefs)
      );
    }
  }, []);

  return {
    preferences,
    updatePreferences,
    resetPreferences,
  };
}

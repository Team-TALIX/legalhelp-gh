"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback, useRef, useEffect } from "react";
import apiClient from "../lib/api.js";

/**
 * Custom hook for handling voice functionality using NPLGhana APIs
 * Provides text-to-speech, speech-to-text, and voice recording with caching, error handling, and loading states
 */
export function useVoice() {
  const queryClient = useQueryClient();
  const [audioCache, setAudioCache] = useState(new Map());
  const [isRecording, setIsRecording] = useState(false);
  const [recordingLanguage, setRecordingLanguage] = useState("tw");

  // Recording refs
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechRecognitionRef = useRef(null);

  // Base API call function using apiClient (following useTranslation pattern)
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

  // Get supported TTS languages and speakers
  const {
    data: ttsLanguagesData,
    isLoading: ttsLanguagesLoading,
    error: ttsLanguagesError,
    refetch: refetchTtsLanguages,
  } = useQuery({
    queryKey: ["nlp", "tts", "languages"],
    queryFn: () => apiCall("/nlp/tts/languages"),
    staleTime: 1000 * 60 * 60, // 1 hour
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Text-to-speech mutation
  const textToSpeechMutation = useMutation({
    mutationFn: async ({ text, language, speakerId }) => {
      if (!text?.trim()) {
        throw new Error("Text is required for speech synthesis");
      }

      if (!language) {
        throw new Error("Language is required for speech synthesis");
      }

      // Check if audio already exists in cache
      const cacheKey = `${text.trim()}_${language}_${speakerId || "default"}`;
      if (audioCache.has(cacheKey)) {
        return audioCache.get(cacheKey);
      }

      console.log("Making TTS API call with:", {
        text: text.trim(),
        language,
        speakerId,
      });

      const result = await apiCall("/nlp/text-to-speech", {
        method: "POST",
        data: {
          text: text.trim(),
          language,
          speakerId,
        },
        responseType: "blob", // Expecting audio blob
      });

      console.log("TTS API response received:", {
        resultType: typeof result,
        resultConstructor: result.constructor.name,
        resultSize: result.size || result.length || "unknown",
      });

      // Create audio URL from blob
      let audioBlob;

      if (result instanceof Blob) {
        audioBlob = result;
      } else if (result instanceof ArrayBuffer) {
        // If result is ArrayBuffer, create a blob
        audioBlob = new Blob([result], { type: "audio/wav" });
      } else {
        // If result is something else, try to create one
        audioBlob = new Blob([result], {
          type: "audio/wav",
        });
      }

      // Verify the blob has content and is reasonable size
      if (audioBlob.size === 0) {
        throw new Error("Received empty audio data from server");
      }

      if (audioBlob.size < 1000) {
        console.warn("Audio blob size is very small:", audioBlob.size, "bytes");
        // Log the blob content for debugging
        try {
          const text = await audioBlob.text();
          console.warn("Blob content:", text);
          // Try to parse as JSON to see if it's an error response
          try {
            const jsonError = JSON.parse(text);
            throw new Error(
              `Server error: ${jsonError.error || jsonError.message || text}`
            );
          } catch (parseError) {
            throw new Error(
              `Audio data too small (${audioBlob.size} bytes). Content: ${text}`
            );
          }
        } catch (textError) {
          throw new Error(
            `Audio data too small (${audioBlob.size} bytes). Unable to read content.`
          );
        }
      }

      console.log("Audio blob created:", {
        size: audioBlob.size,
        type: audioBlob.type,
        resultType: typeof result,
        resultConstructor: result.constructor.name,
      });

      const audioUrl = URL.createObjectURL(audioBlob);

      const audioData = {
        audioUrl,
        audioBlob,
        text: text.trim(),
        language,
        speakerId,
        timestamp: new Date().toISOString(),
        blobType: audioBlob.type,
        blobSize: audioBlob.size,
      };

      // Store in cache
      setAudioCache((prev) => new Map(prev.set(cacheKey, audioData)));

      return audioData;
    },
    onSuccess: (data, variables) => {
      // Update query cache for future requests
      const cacheKey = [
        "tts",
        variables.text,
        variables.language,
        variables.speakerId,
      ];
      queryClient.setQueryData(cacheKey, data);
    },
    onError: (error, variables) => {
      console.error("Text-to-speech failed:", error, variables);
    },
  });

  // Speech-to-text mutation for recorded audio
  const speechToTextMutation = useMutation({
    mutationFn: async ({ audioBlob, language }) => {
      if (!audioBlob) {
        throw new Error("Audio data is required for speech recognition");
      }

      if (!language) {
        throw new Error("Language is required for speech recognition");
      }

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("language", language);

      const result = await apiCall("/nlp/speech-to-text", {
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return result;
    },
    onError: (error, variables) => {
      console.error("Speech-to-text failed:", error, variables);
    },
  });

  // Check if browser supports the Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      // Clean up audio URLs to prevent memory leaks
      audioCache.forEach((audio) => {
        if (audio.audioUrl) {
          URL.revokeObjectURL(audio.audioUrl);
        }
      });
    };
  }, []);

  // Convert text to speech
  const synthesizeSpeech = useCallback(
    async (text, language = "tw", speakerId = null) => {
      try {
        const result = await textToSpeechMutation.mutateAsync({
          text,
          language,
          speakerId,
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    [textToSpeechMutation]
  );

  // Convert recorded audio to text
  const transcribeAudio = useCallback(
    async (audioBlob, language = "tw") => {
      try {
        const result = await speechToTextMutation.mutateAsync({
          audioBlob,
          language,
        });
        return result;
      } catch (error) {
        throw error;
      }
    },
    [speechToTextMutation]
  );

  // Start recording audio
  const startRecording = useCallback(async (language = "tw") => {
    setIsRecording(true);
    setRecordingLanguage(language);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Store the recorded audio blob for transcription
        setAudioCache((prev) => {
          const newCache = new Map(prev);
          newCache.set("latest_recording", {
            audioBlob,
            language,
            timestamp: new Date().toISOString(),
          });
          return newCache;
        });

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setIsRecording(false);
      throw new Error(`Microphone access failed: ${error.message}`);
    }
  }, []);

  // Stop recording audio
  const stopRecording = useCallback(() => {
    if (!isRecording) return null;

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      } catch (error) {
        console.error("Error stopping media recorder:", error);
      }
    }

    setIsRecording(false);

    // Return the recorded audio data
    return audioCache.get("latest_recording");
  }, [isRecording, audioCache]);

  // Play audio from URL or blob
  const playAudio = useCallback((audioUrl, options = {}) => {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);

      audio.onended = () => resolve();
      audio.onerror = (error) => reject(new Error("Audio playback failed"));

      if (options.volume !== undefined) {
        audio.volume = Math.max(0, Math.min(1, options.volume));
      }

      audio.play().catch(reject);
    });
  }, []);

  // Get supported TTS languages formatted for UI
  const getSupportedTtsLanguages = useCallback(() => {
    if (!ttsLanguagesData?.success || !ttsLanguagesData?.data?.languages) {
      // Fallback languages
      return ["tw", "ki", "ee"];
    }

    const languages = ttsLanguagesData.data.languages.languages;

    // Handle different response formats
    if (Array.isArray(languages)) {
      return languages;
    } else if (typeof languages === "object") {
      // Convert object format {tw: 'Twi', ki: 'Kikuyu', ee: 'Ewe'} to array ['tw', 'ki', 'ee']
      return Object.keys(languages);
    }

    // Fallback if format is unexpected
    return ["tw", "ki", "ee"];
  }, [ttsLanguagesData]);

  // Get available speakers for a language
  const getAvailableSpeakers = useCallback(
    (language) => {
      if (!ttsLanguagesData?.success || !ttsLanguagesData?.data?.speakers) {
        // Fallback speakers
        const fallbackSpeakers = {
          tw: ["twi_speaker_4", "twi_speaker_5", "twi_speaker_6"],
          ki: ["kikuyu_speaker_1", "kikuyu_speaker_5"],
          ee: ["ewe_speaker_3", "ewe_speaker_4"],
        };
        return fallbackSpeakers[language] || [];
      }

      const speakers = ttsLanguagesData.data.speakers.speakers;

      if (typeof speakers === "object" && speakers[language]) {
        return Array.isArray(speakers[language]) ? speakers[language] : [];
      }

      // Fallback for specific language
      const fallbackSpeakers = {
        tw: ["twi_speaker_4", "twi_speaker_5", "twi_speaker_6"],
        ki: ["kikuyu_speaker_1", "kikuyu_speaker_5"],
        ee: ["ewe_speaker_3", "ewe_speaker_4"],
      };
      return fallbackSpeakers[language] || [];
    },
    [ttsLanguagesData]
  );

  // Check if a language supports TTS
  const isTtsSupported = useCallback(
    (language) => {
      const supportedLanguages = getSupportedTtsLanguages();
      return supportedLanguages.includes(language);
    },
    [getSupportedTtsLanguages]
  );

  // Get audio from cache
  const getFromCache = useCallback(
    (text, language, speakerId = null) => {
      const cacheKey = `${text?.trim()}_${language}_${speakerId || "default"}`;
      return audioCache.get(cacheKey);
    },
    [audioCache]
  );

  // Clear audio cache
  const clearCache = useCallback(() => {
    // Clean up audio URLs to prevent memory leaks
    audioCache.forEach((audio) => {
      if (audio.audioUrl) {
        URL.revokeObjectURL(audio.audioUrl);
      }
    });
    setAudioCache(new Map());
  }, [audioCache]);

  return {
    // TTS functions
    synthesizeSpeech,
    playAudio,

    // Recording functions
    startRecording,
    stopRecording,
    transcribeAudio,

    // State
    isRecording,
    recordingLanguage,
    isSynthesizing: textToSpeechMutation.isPending,
    isTranscribing: speechToTextMutation.isPending,
    synthesisError: textToSpeechMutation.error,
    transcriptionError: speechToTextMutation.error,
    lastSynthesis: textToSpeechMutation.data,
    lastTranscription: speechToTextMutation.data,

    // Languages and speakers
    supportedTtsLanguages: getSupportedTtsLanguages(),
    ttsLanguagesLoading,
    ttsLanguagesError,
    getAvailableSpeakers,
    isTtsSupported,
    refetchTtsLanguages,

    // Cache management
    audioCache: Array.from(audioCache.entries()),
    getFromCache,
    clearCache,

    // Utilities
    resetSynthesis: textToSpeechMutation.reset,
    resetTranscription: speechToTextMutation.reset,
    retrySynthesis: textToSpeechMutation.mutate,
    retryTranscription: speechToTextMutation.mutate,
  };
}

/**
 * Hook for managing user's voice preferences
 */
export function useVoicePreferences() {
  const [preferences, setPreferences] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("voice-preferences");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn("Failed to parse voice preferences from localStorage");
        }
      }
    }

    return {
      defaultTtsLanguage: "tw",
      defaultSpeakerId: null,
      autoPlay: false,
      volume: 1.0,
      playbackSpeed: 1.0,
      recordingLanguage: "tw",
    };
  });

  const updatePreferences = useCallback((updates) => {
    setPreferences((prev) => {
      const newPrefs = { ...prev, ...updates };

      if (typeof window !== "undefined") {
        localStorage.setItem("voice-preferences", JSON.stringify(newPrefs));
      }

      return newPrefs;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    const defaultPrefs = {
      defaultTtsLanguage: "tw",
      defaultSpeakerId: null,
      autoPlay: false,
      volume: 1.0,
      playbackSpeed: 1.0,
      recordingLanguage: "tw",
    };

    setPreferences(defaultPrefs);

    if (typeof window !== "undefined") {
      localStorage.setItem("voice-preferences", JSON.stringify(defaultPrefs));
    }
  }, []);

  return {
    preferences,
    updatePreferences,
    resetPreferences,
  };
}

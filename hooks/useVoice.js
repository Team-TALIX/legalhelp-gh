"use client";

import { useState, useCallback, useRef, useEffect } from "react";

export default function useVoice() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [error, setError] = useState(null);
  const [recordingLanguage, setRecordingLanguage] = useState("en");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechRecognitionRef = useRef(null);

  // Check if browser supports the Web Speech API
  useEffect(() => {
    // We need to check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Check for SpeechRecognition API
      window.SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      // If neither is available, we'll fallback to MediaRecorder
    }
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  // Function to start recording
  const startRecording = useCallback((language = "en") => {
    setIsRecording(true);
    setAudioBlob(null);
    setError(null);
    setRecordingLanguage(language);
    audioChunksRef.current = [];

    // Try Web Speech API first
    if (window.SpeechRecognition) {
      try {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = getLangCode(language);
        recognition.continuous = true;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
          // Web Speech API gives us text directly, but for consistency we'll
          // use a fake audio blob to keep the API consistent
          const fakeAudioBlob = new Blob(["placeholder"], {
            type: "audio/webm",
          });
          setAudioBlob(fakeAudioBlob);

          // In a real app, we would pass the transcript to our chat logic
          console.log("Speech recognized:", event.results[0][0].transcript);
        };

        recognition.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setError(`Speech recognition failed: ${event.error}`);
          setIsRecording(false);
        };

        recognition.onend = () => {
          if (isRecording) {
            setIsRecording(false);
          }
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        // Fallback to MediaRecorder
        startMediaRecorder();
      }
    } else {
      // Fallback to MediaRecorder
      startMediaRecorder();
    }
  }, []);

  // MediaRecorder fallback
  const startMediaRecorder = useCallback(async () => {
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
        setAudioBlob(audioBlob);

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError(`Microphone access failed: ${err.message}`);
      setIsRecording(false);
    }
  }, []);

  // Function to stop recording
  const stopRecording = useCallback(() => {
    if (!isRecording) return;

    // Stop Web Speech API if it's being used
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      } catch (err) {
        console.error("Error stopping speech recognition:", err);
      }
    }

    // Stop MediaRecorder if it's being used
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      } catch (err) {
        console.error("Error stopping media recorder:", err);
      }
    }

    setIsRecording(false);
  }, [isRecording]);

  // Function to reset the audio blob (e.g., after sending to server)
  const resetAudioBlob = useCallback(() => {
    setAudioBlob(null);
  }, []);

  // Helper function to get language code for Web Speech API
  const getLangCode = (language) => {
    const langMap = {
      en: "en-US",
      twi: "ak", // Akan/Twi
      ewe: "ee", // Ewe
      dagbani: "dag", // Dagbani
    };

    return langMap[language] || "en-US";
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
    audioBlob,
    resetAudioBlob,
    error,
    recordingLanguage,
  };
}

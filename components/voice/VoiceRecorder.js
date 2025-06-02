"use client";

import { useState, useEffect } from "react";
import Spinner from "../ui/Spinner";

export default function VoiceRecorder({
  isRecording,
  onStartRecording,
  onStopRecording,
  language,
}) {
  const [isSupported, setIsSupported] = useState(true);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingTimer, setRecordingTimer] = useState(null);

  // Check if the browser supports the Web Speech API
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported(
        "webkitSpeechRecognition" in window ||
          "SpeechRecognition" in window ||
          "mediaDevices" in navigator
      );
    }
  }, []);

  // Handle recording timer
  useEffect(() => {
    if (isRecording) {
      const timer = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      setRecordingTimer(timer);
    } else {
      if (recordingTimer) {
        clearInterval(recordingTimer);
        setRecordingTimer(null);
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingTimer) {
        clearInterval(recordingTimer);
      }
    };
  }, [isRecording, recordingTimer]);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle recording toggle
  const toggleRecording = () => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording(language);
    }
  };

  if (!isSupported) {
    return null; // Don't render anything if not supported
  }

  return (
    <button
      type="button"
      onClick={toggleRecording}
      disabled={!isSupported}
      className={`relative flex items-center justify-center w-10 h-10 rounded-full focus:outline-none ${
        isRecording
          ? "bg-red-500 hover:bg-red-600 animate-pulse"
          : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
      }`}
      aria-label={isRecording ? "Stop recording" : "Start recording"}
    >
      {isRecording ? (
        <div className="flex flex-col items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-white"
          >
            <rect x="6" y="6" width="12" height="12" />
          </svg>
          <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs py-1 px-2 rounded">
            {formatTime(recordingDuration)}
          </span>
        </div>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-gray-700 dark:text-gray-300"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="22" />
        </svg>
      )}
    </button>
  );
}

"use client";

import { useState, useCallback } from "react";
import AudioPlayer from "../voice/AudioPlayer";
import {
  FaUser,
  FaRobot,
  FaLanguage,
  FaCopy,
  FaCheck,
  FaVolumeUp,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function MessageBubble({
  role,
  content,
  timestamp,
  audioUrl,
  language = "en",
  isAudioEnabled = false,
  metadata = {},
}) {
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedContent, setTranslatedContent] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoadingTranslation, setIsLoadingTranslation] = useState(false);

  const isUser = role === "user";
  const isAssistant = role === "assistant";

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Format date for accessibility
  const formatFullDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Copy message content to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  }, [content]);

  // Handle translation toggle
  const handleTranslationToggle = useCallback(async () => {
    if (showTranslation) {
      setShowTranslation(false);
      return;
    }

    if (translatedContent) {
      setShowTranslation(true);
      return;
    }

    // Fetch translation
    setIsLoadingTranslation(true);
    setTranslationError("");

    try {
      const response = await fetch("/api/v1/nlp/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: content,
          fromLanguage: language,
          toLanguage: "en",
        }),
      });

      if (!response.ok) {
        throw new Error("Translation failed");
      }

      const data = await response.json();
      setTranslatedContent(data.translatedText || "Translation unavailable");
      setShowTranslation(true);
    } catch (error) {
      setTranslationError("Failed to translate message");
      console.error("Translation error:", error);
    } finally {
      setIsLoadingTranslation(false);
    }
  }, [content, language, showTranslation, translatedContent]);

  // Get language display name
  const getLanguageDisplayName = (lang) => {
    const languages = {
      en: "English",
      twi: "Twi",
      ewe: "Ewe",
      dagbani: "Dagbani",
      ga: "Ga",
      hausa: "Hausa",
    };
    return languages[lang] || lang.toUpperCase();
  };

  // Render message content with proper formatting
  const renderContent = (text) => {
    if (!text) return null;

    // Split by line breaks and render paragraphs
    const paragraphs = text.split("\n").filter((p) => p.trim());

    if (paragraphs.length === 1) {
      return <p className="whitespace-pre-wrap">{text}</p>;
    }

    return paragraphs.map((paragraph, index) => (
      <p key={index} className="mb-2 last:mb-0 whitespace-pre-wrap">
        {paragraph}
      </p>
    ));
  };

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 group`}
    >
      <div className="flex items-start space-x-2 max-w-[85%] md:max-w-[75%]">
        {/* Avatar for assistant messages */}
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-500 dark:bg-orange-600 flex items-center justify-center mt-1">
            <FaRobot className="w-4 h-4 text-white" />
          </div>
        )}

        <div
          className={`rounded-lg p-4 shadow-sm ${
            isUser
              ? "bg-orange-500 text-white rounded-tr-none ml-auto"
              : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-200 dark:border-gray-700"
          }`}
        >
          {/* Message header for assistant */}
          {!isUser && (
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                  Legal Assistant
                </span>
                {language !== "en" && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                    <FaLanguage className="w-3 h-3" />
                    <span>{getLanguageDisplayName(language)}</span>
                  </div>
                )}
              </div>

              {/* Message actions */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Copy message"
                  aria-label="Copy message"
                >
                  {isCopied ? (
                    <FaCheck className="w-3 h-3 text-green-500" />
                  ) : (
                    <FaCopy className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="space-y-3">
            <div
              className={`prose prose-sm max-w-none ${
                isUser ? "prose-invert" : "dark:prose-invert prose-orange"
              }`}
            >
              {renderContent(content)}
            </div>

            {/* Audio player */}
            {audioUrl && isAudioEnabled && (
              <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FaVolumeUp className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Audio Response
                  </span>
                </div>
                <AudioPlayer audioUrl={audioUrl} language={language} />
              </div>
            )}

            {/* Translation section */}
            {!isUser && language !== "en" && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleTranslationToggle}
                  disabled={isLoadingTranslation}
                  className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors disabled:opacity-50"
                >
                  <FaLanguage className="w-3 h-3" />
                  <span>
                    {isLoadingTranslation
                      ? "Translating..."
                      : showTranslation
                      ? "Show original"
                      : "Show in English"}
                  </span>
                </button>

                {translationError && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                    <FaExclamationTriangle className="w-3 h-3" />
                    <span>{translationError}</span>
                  </div>
                )}

                {showTranslation && translatedContent && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <FaLanguage className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                        English Translation
                      </span>
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200 prose prose-sm max-w-none dark:prose-invert">
                      {renderContent(translatedContent)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Metadata display */}
            {metadata && Object.keys(metadata).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <details className="group">
                  <summary className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    Message Details
                  </summary>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    {metadata.legalTopic && (
                      <div>
                        <span className="font-medium">Topic:</span>{" "}
                        {metadata.legalTopic}
                      </div>
                    )}
                    {metadata.confidence && (
                      <div>
                        <span className="font-medium">Confidence:</span>{" "}
                        {Math.round(metadata.confidence * 100)}%
                      </div>
                    )}
                    {metadata.sources && metadata.sources.length > 0 && (
                      <div>
                        <span className="font-medium">Sources:</span>{" "}
                        {metadata.sources.join(", ")}
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <div
            className={`text-right mt-3 pt-2 border-t ${
              isUser
                ? "border-orange-400/30"
                : "border-gray-200 dark:border-gray-700"
            }`}
          >
            <time
              dateTime={timestamp}
              title={formatFullDate(timestamp)}
              className={`text-xs ${
                isUser ? "text-orange-100" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {formatTime(timestamp)}
            </time>
            {!isUser && audioUrl && (
              <span className="ml-2 inline-flex items-center">
                <FaVolumeUp className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>

        {/* Avatar for user messages */}
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 dark:bg-gray-400 flex items-center justify-center mt-1">
            <FaUser className="w-4 h-4 text-white dark:text-gray-800" />
          </div>
        )}
      </div>
    </div>
  );
}

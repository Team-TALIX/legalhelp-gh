"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AudioPlayer from "../voice/AudioPlayer";
import Button from "../ui/Button";
import Spinner from "../ui/Spinner";
import { useTranslation } from "../../hooks/useTranslation";
import { useVoice, useVoicePreferences } from "../../hooks/useVoice";
import {
  FaUser,
  FaRobot,
  FaLanguage,
  FaCopy,
  FaCheck,
  FaVolumeUp,
  FaVolumeOff,
  FaExclamationTriangle,
  FaChevronDown,
  FaPlay,
  FaPause,
  FaSpinner,
  FaMicrophone,
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
  const [selectedTargetLanguage, setSelectedTargetLanguage] = useState("en");
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [translationsCache, setTranslationsCache] = useState(new Map());
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [showSpeakerSelector, setShowSpeakerSelector] = useState(false);

  // Ref for dropdown click outside detection
  const dropdownRef = useRef(null);
  const speakerDropdownRef = useRef(null);
  const audioRef = useRef(null);

  // Use the translation hook
  const {
    translateText,
    isTranslating,
    translationError,
    supportedLanguages,
    getFromHistory,
  } = useTranslation();

  // Use the voice hook for TTS
  const {
    synthesizeSpeech,
    playAudio,
    isSynthesizing,
    synthesisError,
    supportedTtsLanguages,
    getAvailableSpeakers,
    isTtsSupported,
    getFromCache: getAudioFromCache,
  } = useVoice();

  // Voice preferences
  const { preferences: voicePreferences, updatePreferences } =
    useVoicePreferences();

  const [selectedSpeakerId, setSelectedSpeakerId] = useState(
    voicePreferences.defaultSpeakerId
  );

  const isUser = role === "user";
  const isAssistant = role === "assistant";

  // Update selectedSpeakerId when voicePreferences change
  useEffect(() => {
    if (voicePreferences.defaultSpeakerId && !selectedSpeakerId) {
      setSelectedSpeakerId(voicePreferences.defaultSpeakerId);
    }
  }, [voicePreferences.defaultSpeakerId, selectedSpeakerId]);

  // Click outside handler for language selector
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageSelector(false);
      }
    }

    if (showLanguageSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLanguageSelector]);

  // Click outside handler for speaker selector
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        speakerDropdownRef.current &&
        !speakerDropdownRef.current.contains(event.target)
      ) {
        setShowSpeakerSelector(false);
      }
    }

    if (showSpeakerSelector) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSpeakerSelector]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageSelector(false);
      }
    };

    if (showLanguageSelector) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLanguageSelector]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (currentAudioUrl) {
        URL.revokeObjectURL(currentAudioUrl);
      }
    };
  }, [currentAudioUrl]);

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
  const handleTranslationToggle = useCallback(
    async (targetLang = selectedTargetLanguage) => {
      if (showTranslation && targetLang === selectedTargetLanguage) {
        setShowTranslation(false);
        return;
      }

      // Check cache first
      const cacheKey = `${content}_${language}_${targetLang}`;
      const cachedTranslation =
        translationsCache.get(cacheKey) ||
        getFromHistory(content, language, targetLang);

      if (cachedTranslation) {
        setTranslationsCache(
          (prev) => new Map(prev.set(cacheKey, cachedTranslation))
        );
        setSelectedTargetLanguage(targetLang);
        setShowTranslation(true);
        return;
      }

      try {
        const result = await translateText(content, language, targetLang);

        if (result?.success && result?.data) {
          setTranslationsCache(
            (prev) => new Map(prev.set(cacheKey, result.data))
          );
          setSelectedTargetLanguage(targetLang);
          setShowTranslation(true);
        }
      } catch (error) {
        console.error("Translation error:", error);
      }
    },
    [
      content,
      language,
      selectedTargetLanguage,
      showTranslation,
      translationsCache,
      translateText,
      getFromHistory,
    ]
  );

  // Handle language selection
  const handleLanguageChange = useCallback(
    (langCode) => {
      setSelectedTargetLanguage(langCode);
      setShowLanguageSelector(false);
      if (langCode !== language) {
        handleTranslationToggle(langCode);
      }
    },
    [language, handleTranslationToggle]
  );

  // Get current translation
  const getCurrentTranslation = useCallback(() => {
    const cacheKey = `${content}_${language}_${selectedTargetLanguage}`;
    return translationsCache.get(cacheKey);
  }, [content, language, selectedTargetLanguage, translationsCache]);

  // Handle speaker selection
  const handleSpeakerChange = useCallback(
    (speakerId) => {
      setSelectedSpeakerId(speakerId);
      setShowSpeakerSelector(false);
      // Update user preferences with the selected speaker
      updatePreferences({ defaultSpeakerId: speakerId });
    },
    [updatePreferences]
  );

  // Get current speaker ID (from state or preferences)
  const getCurrentSpeakerId = useCallback(() => {
    return selectedSpeakerId || voicePreferences.defaultSpeakerId;
  }, [selectedSpeakerId, voicePreferences.defaultSpeakerId]);

  // Get available speakers for current language
  const getAvailableSpeakersForLanguage = useCallback(
    (lang) => {
      return getAvailableSpeakers(lang) || [];
    },
    [getAvailableSpeakers]
  );

  // Handle text-to-speech for message content
  const handleTextToSpeech = useCallback(
    async (textToSpeak = content, voiceLanguage = language) => {
      try {
        // Prevent concurrent requests
        if (isSynthesizing || isAudioLoading) {
          return;
        }

        setIsAudioLoading(true);

        // Stop any currently playing audio
        if (audioRef.current) {
          try {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          } catch (e) {
            console.log("Audio was already stopped");
          }
          audioRef.current = null;
        }

        // Reset states
        setIsPlayingAudio(false);

        // Check if TTS is supported for this language
        if (!isTtsSupported(voiceLanguage)) {
          console.warn(`TTS not supported for language: ${voiceLanguage}`);
          setIsAudioLoading(false);
          return;
        }

        // Check cache first
        const cachedAudio = getAudioFromCache(
          textToSpeak,
          voiceLanguage,
          getCurrentSpeakerId()
        );

        if (cachedAudio && cachedAudio.audioUrl) {
          setCurrentAudioUrl(cachedAudio.audioUrl);

          const audio = new Audio(cachedAudio.audioUrl);
          audioRef.current = audio;

          audio.volume = voicePreferences.volume || 1.0;

          audio.oncanplaythrough = () => {
            setIsAudioLoading(false);
            setIsPlayingAudio(true);
          };

          audio.onended = () => {
            setIsPlayingAudio(false);
            setIsAudioLoading(false);
          };

          audio.onerror = (e) => {
            console.error("Cached audio error:", e);
            setIsPlayingAudio(false);
            setIsAudioLoading(false);
          };

          audio.onloadstart = () => {
            console.log("Audio loading started");
          };

          // Load and play the audio
          audio.load();

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((playError) => {
              console.error("Play promise rejected:", playError);
              setIsPlayingAudio(false);
              setIsAudioLoading(false);
            });
          }
          return;
        }

        // Synthesize new audio
        const audioData = await synthesizeSpeech(
          textToSpeak,
          voiceLanguage,
          getCurrentSpeakerId()
        );

        if (audioData && audioData.audioUrl) {
          setCurrentAudioUrl(audioData.audioUrl);

          const audio = new Audio(audioData.audioUrl);
          audioRef.current = audio;

          audio.volume = voicePreferences.volume || 1.0;

          audio.oncanplaythrough = () => {
            setIsAudioLoading(false);
            setIsPlayingAudio(true);
          };

          audio.onended = () => {
            setIsPlayingAudio(false);
            setIsAudioLoading(false);
          };

          audio.onerror = (e) => {
            console.error("New audio error:", e);
            setIsPlayingAudio(false);
            setIsAudioLoading(false);
          };

          audio.onloadstart = () => {
            console.log("New audio loading started");
          };

          // Load and play the audio
          audio.load();

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((playError) => {
              console.error("Play promise rejected:", playError);
              setIsPlayingAudio(false);
              setIsAudioLoading(false);
            });
          }
        }
      } catch (error) {
        console.error("Text-to-speech error:", error);
        setIsPlayingAudio(false);
        setIsAudioLoading(false);
      }
    },
    [
      content,
      language,
      isTtsSupported,
      getAudioFromCache,
      synthesizeSpeech,
      voicePreferences,
      getCurrentSpeakerId,
      isSynthesizing,
      isAudioLoading,
    ]
  );

  // Stop audio playback
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch (error) {
        console.error("Error stopping audio:", error);
      }
    }
    setIsPlayingAudio(false);
    setIsAudioLoading(false);
  }, []);

  // Handle TTS for translated text
  const handleTranslatedTextToSpeech = useCallback(async () => {
    const translation = getCurrentTranslation();
    if (translation && translation.translatedText) {
      await handleTextToSpeech(
        translation.translatedText,
        selectedTargetLanguage
      );
    }
  }, [getCurrentTranslation, handleTextToSpeech, selectedTargetLanguage]);

  // Get language display name
  const getLanguageDisplayName = (lang) => {
    const languages = {
      en: "English",
      tw: "Twi",
      ee: "Ewe",
      dag: "Dagbani",
      gaa: "Ga",
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

                <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                  <FaLanguage className="w-3 h-3" />
                  <span>{getLanguageDisplayName(language)}</span>
                </div>
              </div>

              {/* Message actions */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {/* Text-to-speech button */}
                {isTtsSupported(language) && (
                  <button
                    onClick={
                      isPlayingAudio ? stopAudio : () => handleTextToSpeech()
                    }
                    disabled={isSynthesizing || isAudioLoading}
                    className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={
                      isPlayingAudio
                        ? "Stop audio"
                        : isAudioLoading
                        ? "Loading audio..."
                        : "Play audio"
                    }
                    aria-label={
                      isPlayingAudio
                        ? "Stop audio"
                        : isAudioLoading
                        ? "Loading audio..."
                        : "Play audio"
                    }
                  >
                    {isSynthesizing || isAudioLoading ? (
                      <FaSpinner className="w-3 h-3 text-orange-500 animate-spin" />
                    ) : isPlayingAudio ? (
                      <FaPause className="w-3 h-3 text-orange-500" />
                    ) : (
                      <FaPlay className="w-3 h-3 text-gray-500 dark:text-gray-400 hover:text-orange-500" />
                    )}
                  </button>
                )}

                {/* Speaker selector */}
                {isTtsSupported(language) &&
                  getAvailableSpeakersForLanguage(language).length > 0 && (
                    <div className="relative" ref={speakerDropdownRef}>
                      <button
                        onClick={() =>
                          setShowSpeakerSelector(!showSpeakerSelector)
                        }
                        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Select voice"
                        aria-label="Select voice"
                      >
                        <FaVolumeUp className="w-3 h-3 text-gray-500 dark:text-gray-400 hover:text-orange-500" />
                      </button>

                      {/* Speaker dropdown */}
                      {showSpeakerSelector && (
                        <div className="absolute top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 min-w-[160px]">
                          <div className="py-1 max-h-48 overflow-y-auto">
                            <div className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                              Select Voice
                            </div>
                            {getAvailableSpeakersForLanguage(language).map(
                              (speakerId) => (
                                <button
                                  key={speakerId}
                                  onClick={() => handleSpeakerChange(speakerId)}
                                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                    getCurrentSpeakerId() === speakerId
                                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                      : "text-gray-700 dark:text-gray-300"
                                  }`}
                                >
                                  {speakerId
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

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
            {!isUser && language === "en" && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  {/* Translation toggle button */}
                  <Button
                    onClick={() => handleTranslationToggle()}
                    disabled={isTranslating}
                    variant="ghost"
                    className="text-sm px-3 py-1 h-auto"
                  >
                    {isTranslating ? (
                      <div className="flex items-center space-x-2">
                        <Spinner size="sm" />
                        <span>Translating...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <FaLanguage className="w-3 h-3" />
                        <span>
                          {showTranslation ? "Show original" : "Translate"}
                        </span>
                      </div>
                    )}
                  </Button>

                  {/* Language selector dropdown */}
                  {supportedLanguages &&
                    supportedLanguages.length > 0 &&
                    supportedLanguages[0]?.name && (
                      <div className="relative" ref={dropdownRef}>
                        <Button
                          onClick={() =>
                            setShowLanguageSelector(!showLanguageSelector)
                          }
                          variant="ghost"
                          className="text-sm px-3 py-1 h-auto"
                        >
                          <div className="flex items-center space-x-1">
                            <span className="text-xs">
                              {getLanguageDisplayName(selectedTargetLanguage)}
                            </span>
                            <FaChevronDown className="w-3 h-3" />
                          </div>
                        </Button>

                        {/* Language dropdown */}
                        {showLanguageSelector && (
                          <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                            <div className="py-1 max-h-48 overflow-y-auto">
                              {Object.entries(supportedLanguages[0].name)
                                .filter(([code]) => code !== language) // Don't show source language
                                .map(([code, name]) => (
                                  <button
                                    key={code}
                                    onClick={() => handleLanguageChange(code)}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                                      selectedTargetLanguage === code
                                        ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                                        : "text-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    {name}
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Translation error */}
                {translationError && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                    <FaExclamationTriangle className="w-3 h-3" />
                    <span>{translationError.message || translationError}</span>
                  </div>
                )}

                {/* TTS error */}
                {synthesisError && (
                  <div className="mt-2 flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
                    <FaVolumeOff className="w-3 h-3" />
                    <span>
                      Audio synthesis failed:{" "}
                      {synthesisError.message || synthesisError}
                    </span>
                  </div>
                )}

                {/* Translation result */}
                {showTranslation && getCurrentTranslation() && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <FaLanguage className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          {getLanguageDisplayName(selectedTargetLanguage)}{" "}
                          Translation
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* TTS for translated text */}
                        {isTtsSupported(selectedTargetLanguage) && (
                          <button
                            onClick={handleTranslatedTextToSpeech}
                            disabled={isSynthesizing}
                            className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                            title="Play translated audio"
                            aria-label="Play translated audio"
                          >
                            {isSynthesizing ? (
                              <FaSpinner className="w-3 h-3 text-blue-600 animate-spin" />
                            ) : (
                              <FaPlay className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            )}
                          </button>
                        )}

                        {/* Speaker selector for translated text */}
                        {isTtsSupported(selectedTargetLanguage) &&
                          getAvailableSpeakersForLanguage(
                            selectedTargetLanguage
                          ).length > 0 && (
                            <div className="relative">
                              <button
                                onClick={() =>
                                  setShowSpeakerSelector(!showSpeakerSelector)
                                }
                                className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                                title="Select voice for translation"
                                aria-label="Select voice for translation"
                              >
                                <FaVolumeUp className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                              </button>
                            </div>
                          )}

                        {getCurrentTranslation()?.confidence && (
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            {Math.round(
                              getCurrentTranslation().confidence * 100
                            )}
                            % confidence
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-blue-800 dark:text-blue-200 prose prose-sm max-w-none dark:prose-invert">
                      {renderContent(getCurrentTranslation()?.translatedText)}
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

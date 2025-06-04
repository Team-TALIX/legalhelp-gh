"use client";

import { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import VoiceRecorder from "../voice/VoiceRecorder";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Spinner from "../ui/Spinner";
import useChat from "../../hooks/useChat";
import { FaPaperPlane, FaExclamationTriangle } from "react-icons/fa";

export default function ChatInterface({
  selectedLanguage = "en",
  isAudioEnabled = false,
}) {
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);
  const {
    sessionId,
    messages,
    sendMessage,
    sendVoiceMessage,
    isLoading,
    isSending,
    error,
    setError,
    context,
  } = useChat(selectedLanguage);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() === "" || !sessionId) return;

    try {
      await sendMessage(inputMessage.trim(), {
        legalTopic: context?.legalTopic || "",
        userLocation: "",
      });
      setInputMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleVoiceMessage = async (audioBlob) => {
    if (!sessionId || !audioBlob) return;

    try {
      await sendVoiceMessage(audioBlob, {
        legalTopic: context?.legalTopic || "",
        userLocation: "",
      });
    } catch (error) {
      console.error("Failed to send voice message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const dismissError = () => {
    setError(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] w-full">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800 dark:text-white">
            Legal Assistant
          </h1>
          {context?.legalTopic && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Topic: {context.legalTopic}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {sessionId && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Session: {sessionId.substring(0, 8)}...
            </div>
          )}
          <div
            className={`w-3 h-3 rounded-full ${
              sessionId ? "bg-green-500" : "bg-red-500"
            }`}
            title={sessionId ? "Connected" : "Disconnected"}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <div className="flex items-start">
            <FaExclamationTriangle
              className="text-red-600 dark:text-red-400 mt-0.5 mr-2 flex-shrink-0"
              size={16}
            />
            <div className="flex-1">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
            <Button
              onClick={dismissError}
              variant="ghost"
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 p-1 ml-2"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Messages display */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {!sessionId ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Spinner size="lg" />
              <p className="mt-4 text-lg font-semibold">
                Connecting to Legal Assistant...
              </p>
              <p className="text-sm">
                Please wait while we set up your session.
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500 dark:text-gray-400 max-w-md">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-orange-500 dark:text-orange-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                Welcome to LegalHelp GH
              </h2>
              <p className="mb-4">
                Ask any legal question and get clear answers in your preferred
                language.
              </p>
              <div className="text-sm space-y-1">
                <p>• Tenant and landlord rights</p>
                <p>• Land registration procedures</p>
                <p>• Worker rights and employment</p>
                <p>• Marriage and divorce law</p>
                <p>• Criminal law procedures</p>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={`${message.timestamp}-${index}`}
              role={message.role}
              content={message.content}
              timestamp={message.timestamp}
              audioUrl={message.audioUrl}
              language={message.language}
              isAudioEnabled={isAudioEnabled}
              metadata={message.metadata}
            />
          ))
        )}

        {isSending && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg max-w-xs">
              <Spinner size="sm" />
              <span className="text-gray-600 dark:text-gray-300 text-sm">
                Legal Assistant is thinking...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <VoiceRecorder
            onAudioReady={handleVoiceMessage}
            language={selectedLanguage}
            disabled={!sessionId || isSending}
            className="flex-shrink-0"
          />

          <div className="flex-1">
            <Input
              type="text"
              name="message"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                sessionId ? "Type your legal question..." : "Connecting..."
              }
              disabled={!sessionId || isSending}
              className="mb-0 h-10"
            />
          </div>

          <Button
            type="submit"
            disabled={!sessionId || isSending || inputMessage.trim() === ""}
            variant="primary"
            className="flex items-center space-x-2 px-4 py-2 h-10 flex-shrink-0"
          >
            {isSending ? (
              <Spinner size="sm" />
            ) : (
              <FaPaperPlane className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isSending ? "Sending..." : "Send"}
            </span>
          </Button>
        </form>

        {/* Help text */}
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          Press Enter to send • Shift+Enter for new line
          {selectedLanguage !== "en" && " • Voice input available"}
        </div>
      </div>
    </div>
  );
}

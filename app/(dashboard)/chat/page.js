"use client";

import { useState, Suspense } from "react";
import ChatInterface from "../../../components/chat/ChatInterface";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import {
  FaArrowLeft,
  FaBars,
  FaPlus,
  FaRegUser,
  FaRegClock,
  FaTrash,
  FaGlobe,
  FaSave,
  FaVolumeUp,
  FaDownload,
  FaEdit,
} from "react-icons/fa";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import useChat from "@/hooks/useChat";

const suggestedTopics = [
  "What are my rights as a tenant?",
  "How do I register my land?",
  "What should I do if arrested?",
  "How do I file for divorce?",
  "What are my rights as a worker?",
  "How to start a small business in Ghana?",
  "What are the inheritance laws?",
  "How to handle a car accident claim?",
];

const languages = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "tw", name: "Twi", flag: "🇬🇭" },
  { code: "ee", name: "Ewe", flag: "🇬🇭" },
  { code: "dag", name: "Dagbani", flag: "🇬🇭" },
];

export default function ChatPage() {
  const [activeSidebar, setActiveSidebar] = useState(null); // Changed from "right" to null
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [sessionToRename, setSessionToRename] = useState(null);
  const [newSessionName, setNewSessionName] = useState("");

  const { user } = useAuth();

  const {
    sessionId,
    sessions,
    createNewSession,
    switchToSession,
    deleteSession,
    sendMessage,
    messages,
    context,
    isLoading,
    isLoadingSessions,
    error,
    setError,
    refetchSessions,
    isCreatingSession,
    isDeletingSession,
    updateSessionName,
    isUpdatingSession,
  } = useChat(selectedLanguage);

  const toggleSidebar = (sidebar) => {
    // If clicking the same sidebar, close it. Otherwise, open the clicked sidebar.
    setActiveSidebar(activeSidebar === sidebar ? null : sidebar);
  };

  const handleNewConversation = async () => {
    if (isCreatingSession) return; // Prevent double-clicks

    try {
      await createNewSession({
        legalTopic: "",
        userLocation: user?.profile?.location || "",
        resolved: false,
      });
      // Refresh sessions list
      refetchSessions();
    } catch (error) {
      console.error("Failed to create new conversation:", error);
      // Show user-friendly error if it's a rate limit issue
      if (
        error.message.includes("Too many") ||
        error.message.includes("wait")
      ) {
        setError("Please wait a moment before creating another conversation.");
      } else {
        setError(`Failed to create conversation: ${error.message}`);
      }
    }
  };

  const handleSwitchConversation = (newSessionId) => {
    switchToSession(newSessionId);
  };

  const handleDeleteConversation = (sessionId) => {
    setSessionToDelete(sessionId);
    setShowDeleteModal(true);
  };

  const handleRenameConversation = (session) => {
    setSessionToRename(session);
    setNewSessionName(session.name || "");
    setShowRenameModal(true);
  };

  const confirmRenameConversation = async () => {
    if (!sessionToRename || !newSessionName.trim()) return;

    try {
      // Switch to the session first if it's not the current one
      if (sessionToRename.sessionId !== sessionId) {
        switchToSession(sessionToRename.sessionId);
      }
      await updateSessionName(newSessionName.trim());
      refetchSessions();
      setShowRenameModal(false);
      setSessionToRename(null);
      setNewSessionName("");
    } catch (error) {
      console.error("Failed to rename conversation:", error);
      setError(`Failed to rename conversation: ${error.message}`);
    }
  };

  const confirmDeleteConversation = async () => {
    if (!sessionToDelete) return;

    try {
      // If we're deleting the current session, switch to it first, then delete
      if (sessionToDelete === sessionId) {
        await deleteSession();
        // After deleting current session, a new one will be created automatically
      } else {
        // For other sessions, switch to it then delete
        switchToSession(sessionToDelete);
        await deleteSession();
      }
      refetchSessions();
      setShowDeleteModal(false);
      setSessionToDelete(null);
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleSuggestedTopic = (topic) => {
    if (sessionId) {
      sendMessage(topic, {
        legalTopic: "",
        userLocation: user?.profile?.location || "",
      });
    }
  };

  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    // The useChat hook will automatically use the new language for subsequent messages
  };

  const handleSaveConversation = async () => {
    if (!sessionId || messages.length === 0) return;

    try {
      // Create a downloadable text file of the conversation
      const conversationText = messages
        .map((msg) => {
          const role = msg.role === "user" ? "You" : "Legal Assistant";
          const timestamp = new Date(msg.timestamp).toLocaleString();
          return `[${timestamp}] ${role}: ${msg.content}`;
        })
        .join("\n\n");

      const blob = new Blob([conversationText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `legal-chat-${
        new Date().toISOString().split("T")[0]
      }.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to save conversation:", error);
    }
  };

  const formatSessionDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    if (diffDays <= 30) return `${Math.ceil((diffDays - 1) / 7)} weeks ago`;
    return `${Math.ceil((diffDays - 1) / 30)} months ago`;
  };

  const getSessionPreview = (session) => {
    if (
      session.context?.legalTopic &&
      session.context.legalTopic.trim() !== ""
    ) {
      return `Topic: ${session.context.legalTopic}`;
    }
    if (session.messageCount > 0) {
      return `${session.messageCount} message${
        session.messageCount === 1 ? "" : "s"
      }`;
    }
    return "New conversation";
  };

  const getSessionTitle = (session) => {
    if (session.name && session.name.trim() !== "") {
      return session.name.length > 30
        ? session.name.substring(0, 30) + "..."
        : session.name;
    }
    if (session.context?.legalTopic) {
      return session.context.legalTopic.length > 30
        ? session.context.legalTopic.substring(0, 30) + "..."
        : session.context.legalTopic;
    }
    return `Chat ${session.sessionId.substring(0, 8)}...`;
  };

  return (
    <Suspense fallback={<Spinner />}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex justify-between items-center">
            <Link
              href="/"
              className="inline-flex items-center text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400"
            >
              <FaArrowLeft className="mr-2" />
              Back to Home
            </Link>
            <div className="flex space-x-4 items-center">
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>

              <Button
                onClick={() => toggleSidebar("left")}
                variant={activeSidebar === "left" ? "primary" : "secondary"}
                className="p-2"
                title="Toggle Conversations"
              >
                <FaBars />
              </Button>
              <Button
                onClick={() => toggleSidebar("right")}
                variant={activeSidebar === "right" ? "primary" : "secondary"}
                className="p-2"
                title="Toggle Suggestions"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4"
                >
                  <path d="M20 12H4" />
                  <path d="M20 6H4" />
                  <path d="M20 18H4" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex justify-between items-start">
                <p className="text-red-800 dark:text-red-200">{error}</p>
                <Button
                  onClick={() => setError(null)}
                  variant="ghost"
                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 p-1"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          {/* Main Content Area with Dynamic Height */}
          <div className="flex gap-6 min-h-[calc(100vh-12rem)]">
            {/* Left Sidebar - Conversations */}
            {activeSidebar === "left" && (
              <div className="w-80 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex flex-col h-[calc(100vh-12rem)] overflow-hidden">
                {/* New Chat Button */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <Button
                    onClick={handleNewConversation}
                    disabled={isCreatingSession}
                    variant="primary"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {isCreatingSession ? (
                      <Spinner size="sm" />
                    ) : (
                      <FaPlus size={14} />
                    )}
                    <span>
                      {isCreatingSession ? "Creating..." : "New Conversation"}
                    </span>
                  </Button>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto px-2">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white px-2 py-2">
                    Conversations
                  </h2>

                  {isLoadingSessions ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner size="lg" />
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>No conversations yet</p>
                      <p className="text-sm">
                        Start a new conversation to begin
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 pb-4">
                      {sessions.map((session) => (
                        <div
                          key={session.sessionId}
                          className={`relative group ${
                            session.sessionId === sessionId
                              ? "bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800"
                              : ""
                          } rounded-md`}
                        >
                          <Button
                            onClick={() =>
                              handleSwitchConversation(session.sessionId)
                            }
                            variant="ghost"
                            className="w-full text-left p-3 justify-start h-auto"
                          >
                            <div className="flex justify-between items-start pr-16 w-full">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-medium text-gray-800 dark:text-white truncate">
                                  {getSessionTitle(session)}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                                  {getSessionPreview(session)}
                                </p>
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2 flex-shrink-0">
                                {formatSessionDate(session.lastAccessed)}
                              </span>
                            </div>
                          </Button>

                          {/* Action buttons */}
                          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex space-x-1">
                            {/* Rename button */}
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRenameConversation(session);
                              }}
                              variant="ghost"
                              disabled={isUpdatingSession}
                              className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                              title="Rename conversation"
                            >
                              <FaEdit size={12} />
                            </Button>

                            {/* Delete button */}
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteConversation(session.sessionId);
                              }}
                              variant="ghost"
                              disabled={isDeletingSession}
                              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                              title="Delete conversation"
                            >
                              {isDeletingSession ? (
                                <Spinner size="sm" />
                              ) : (
                                <FaTrash size={12} />
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <FaRegUser className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 dark:text-white truncate">
                        {user?.email || "Guest User"}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user?.role === "admin"
                          ? "Admin"
                          : user?.role === "paid_user"
                          ? "Premium"
                          : "Free Plan"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Chat Area */}
            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden h-[calc(100vh-12rem)] pt-4">
              <ChatInterface
                selectedLanguage={selectedLanguage}
                isAudioEnabled={isAudioEnabled}
              />
            </div>

            {/* Right Sidebar - Suggested Topics */}
            {activeSidebar === "right" && (
              <div className="w-80 flex flex-col gap-4 h-full overflow-y-auto">
                {/* Suggested Topics */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-shrink-0">
                  <h2 className="text-xl font-serif font-bold mb-4 text-gray-800 dark:text-white">
                    Suggested Topics
                  </h2>
                  <ul className="space-y-2">
                    {suggestedTopics.map((topic, index) => (
                      <li key={index}>
                        <Button
                          onClick={() => handleSuggestedTopic(topic)}
                          disabled={!sessionId || isLoading}
                          variant="ghost"
                          className="w-full text-left px-3 py-2 justify-start h-auto text-sm"
                        >
                          {topic}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Options Panel */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-shrink-0">
                  <h2 className="text-xl font-serif font-bold mb-4 text-gray-800 dark:text-white">
                    Options
                  </h2>
                  <div className="space-y-3">
                    <Button
                      onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                      variant={isAudioEnabled ? "primary" : "secondary"}
                      className="w-full flex items-center justify-between px-4 py-2"
                    >
                      <span className="flex items-center">
                        <FaVolumeUp className="w-4 h-4 mr-2" />
                        Read Responses Aloud
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full ${
                          isAudioEnabled ? "bg-white" : "bg-gray-400"
                        }`}
                      />
                    </Button>

                    <Button
                      onClick={handleSaveConversation}
                      disabled={!sessionId || messages.length === 0}
                      variant="secondary"
                      className="w-full flex items-center justify-between px-4 py-2"
                    >
                      <span className="flex items-center">
                        <FaDownload className="w-4 h-4 mr-2" />
                        Save Conversation
                      </span>
                    </Button>
                  </div>
                </div>

                {/* Session Info */}
                {sessionId && context && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 flex-shrink-0">
                    <h2 className="text-xl font-serif font-bold mb-4 text-gray-800 dark:text-white">
                      Session Info
                    </h2>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Language:
                        </span>
                        <span className="ml-2 text-gray-700 dark:text-gray-300">
                          {
                            languages.find((l) => l.code === selectedLanguage)
                              ?.name
                          }
                        </span>
                      </div>
                      {context.legalTopic && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">
                            Topic:
                          </span>
                          <span className="ml-2 text-gray-700 dark:text-gray-300">
                            {context.legalTopic}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">
                          Status:
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs ${
                            context.resolved
                              ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300"
                              : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300"
                          }`}
                        >
                          {context.resolved ? "Resolved" : "Active"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSessionToDelete(null);
          }}
          title="Delete Conversation"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this conversation? This action
              cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSessionToDelete(null);
                }}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDeleteConversation}
                variant="danger"
                disabled={isDeletingSession}
              >
                {isDeletingSession ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-2">Deleting...</span>
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Rename Conversation Modal */}
        <Modal
          isOpen={showRenameModal}
          onClose={() => {
            setShowRenameModal(false);
            setSessionToRename(null);
            setNewSessionName("");
          }}
          title="Rename Conversation"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Conversation Name
              </label>
              <Input
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                placeholder="Enter a name for this conversation"
                maxLength={100}
                className="w-full"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    confirmRenameConversation();
                  }
                }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {newSessionName.length}/100 characters
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => {
                  setShowRenameModal(false);
                  setSessionToRename(null);
                  setNewSessionName("");
                }}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRenameConversation}
                variant="primary"
                disabled={isUpdatingSession || !newSessionName.trim()}
              >
                {isUpdatingSession ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-2">Saving...</span>
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Suspense>
  );
}

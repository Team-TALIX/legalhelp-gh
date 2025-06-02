"use client";

import { useState, useEffect } from "react";
import {
  MdCheckCircle,
  MdCancel,
  MdVisibility,
  MdFlag,
  MdPerson,
  MdDateRange,
  MdLanguage,
  MdFilterList,
  MdSelectAll,
  MdMessage,
  MdThumbUp,
  MdCategory,
} from "react-icons/md";
import useAdmin from "../../../hooks/useAdmin";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import Modal from "../../../components/ui/Modal";

export default function ModerationPage() {
  const { usePendingStories, useModerateStory, useBulkStoryModeration } =
    useAdmin();

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStories, setSelectedStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [moderationReason, setModerationReason] = useState("");

  // Fetch pending stories
  const {
    data: storiesData,
    isLoading,
    error,
    refetch,
  } = usePendingStories({
    page: currentPage,
    limit: 20,
  });

  const moderateStoryMutation = useModerateStory();
  const bulkModerationMutation = useBulkStoryModeration();

  const stories = storiesData?.data || [];
  const pagination = storiesData?.meta?.pagination || {};

  const handleSelectStory = (storyId) => {
    setSelectedStories((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStories.length === stories.length) {
      setSelectedStories([]);
    } else {
      setSelectedStories(stories.map((story) => story._id));
    }
  };

  const handleViewStory = (story) => {
    setSelectedStory(story);
    setIsViewModalOpen(true);
  };

  const handleModerateStory = async (storyId, action, reason = "") => {
    try {
      await moderateStoryMutation.mutateAsync({
        storyId,
        action,
        reason,
      });
      refetch();
    } catch (error) {
      console.error("Failed to moderate story:", error);
    }
  };

  const handleBulkModeration = () => {
    if (selectedStories.length === 0) return;
    setIsBulkModalOpen(true);
  };

  const handleConfirmBulkModeration = async () => {
    if (!bulkAction || selectedStories.length === 0) return;

    try {
      await bulkModerationMutation.mutateAsync({
        storyIds: selectedStories,
        action: bulkAction,
        reason: moderationReason,
      });
      setSelectedStories([]);
      setBulkAction("");
      setModerationReason("");
      setIsBulkModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to bulk moderate stories:", error);
    }
  };

  const getLanguageBadge = (language) => {
    const badges = {
      en: {
        label: "English",
        color:
          "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      },
      twi: {
        label: "Twi",
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      },
      ewe: {
        label: "Ewe",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      },
      dagbani: {
        label: "Dagbani",
        color:
          "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      },
    };
    return badges[language] || badges.en;
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Story Moderation
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Review and moderate community stories
              </p>
            </div>

            {selectedStories.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedStories.length} selected
                </span>
                <Button
                  onClick={handleBulkModeration}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <MdFilterList />
                  Bulk Actions
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stories List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400">
                Error loading stories: {error.message}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : stories.length === 0 ? (
            <div className="p-12 text-center">
              <MdCheckCircle className="text-green-500 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                All caught up!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                No stories pending moderation at the moment.
              </p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedStories.length === stories.length &&
                        stories.length > 0
                      }
                      onChange={handleSelectAll}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Select All
                    </span>
                  </label>
                </div>
              </div>

              {/* Stories */}
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {stories.map((story) => (
                  <div key={story._id} className="p-6">
                    <div className="flex items-start gap-4">
                      <input
                        type="checkbox"
                        checked={selectedStories.includes(story._id)}
                        onChange={() => handleSelectStory(story._id)}
                        className="mt-1"
                      />

                      <div className="flex-1 min-w-0">
                        {/* Story Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {story.title && (
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                {story.title}
                              </h3>
                            )}
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  getLanguageBadge(story.language).color
                                }`}
                              >
                                {getLanguageBadge(story.language).label}
                              </span>
                              {story.category && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 rounded-full">
                                  <MdCategory className="text-xs" />
                                  {story.category}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <MdDateRange className="text-sm" />
                            {new Date(story.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Story Content Preview */}
                        <div className="mb-4">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {truncateText(story.storyContent)}
                          </p>
                        </div>

                        {/* Story Meta */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <MdPerson className="text-sm" />
                              <span>
                                {story.isAnonymous ? "Anonymous" : "Named User"}
                              </span>
                            </div>
                            {story.upvotes > 0 && (
                              <div className="flex items-center gap-1">
                                <MdThumbUp className="text-sm" />
                                <span>{story.upvotes} upvotes</span>
                              </div>
                            )}
                            {story.tags && story.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <span>Tags: {story.tags.join(", ")}</span>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleViewStory(story)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <MdVisibility className="text-lg" />
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleModerateStory(story._id, "approved")
                              }
                              loading={moderateStoryMutation.isLoading}
                              className="text-green-600 border-green-300 hover:bg-green-50"
                            >
                              <MdCheckCircle className="text-lg mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() =>
                                handleModerateStory(
                                  story._id,
                                  "rejected",
                                  "Content policy violation"
                                )
                              }
                              loading={moderateStoryMutation.isLoading}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <MdCancel className="text-lg mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing {(pagination.currentPage - 1) * 20 + 1} to{" "}
                    {Math.min(
                      pagination.currentPage * 20,
                      pagination.totalCount
                    )}{" "}
                    of {pagination.totalCount} stories
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={!pagination.hasPrev}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      disabled={!pagination.hasNext}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* View Story Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="View Story"
        >
          {selectedStory && (
            <div className="space-y-4">
              {/* Story Header */}
              <div className="flex items-center justify-between">
                {selectedStory.title && (
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedStory.title}
                  </h2>
                )}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      getLanguageBadge(selectedStory.language).color
                    }`}
                  >
                    {getLanguageBadge(selectedStory.language).label}
                  </span>
                </div>
              </div>

              {/* Story Content */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {selectedStory.storyContent}
                </p>
              </div>

              {/* Story Meta */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Author:
                  </span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {selectedStory.isAnonymous ? "Anonymous" : "Named User"}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Posted:
                  </span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {new Date(selectedStory.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {selectedStory.category && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Category:
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {selectedStory.category}
                    </span>
                  </div>
                )}
                {selectedStory.region && (
                  <div>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Region:
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
                      {selectedStory.region}
                    </span>
                  </div>
                )}
              </div>

              {selectedStory.tags && selectedStory.tags.length > 0 && (
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Tags:
                  </span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedStory.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex px-2 py-1 text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={() => {
                    handleModerateStory(selectedStory._id, "approved");
                    setIsViewModalOpen(false);
                  }}
                  loading={moderateStoryMutation.isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <MdCheckCircle className="mr-1" />
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    handleModerateStory(
                      selectedStory._id,
                      "rejected",
                      "Content policy violation"
                    );
                    setIsViewModalOpen(false);
                  }}
                  loading={moderateStoryMutation.isLoading}
                >
                  <MdCancel className="mr-1" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Bulk Moderation Modal */}
        <Modal
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
          title="Bulk Moderation"
        >
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              You have selected {selectedStories.length} stories for bulk
              moderation.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action
              </label>
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:text-white"
              >
                <option value="">Select action...</option>
                <option value="approved">Approve All</option>
                <option value="rejected">Reject All</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={moderationReason}
                onChange={(e) => setModerationReason(e.target.value)}
                placeholder="Enter reason for this action..."
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:text-white"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleConfirmBulkModeration}
                loading={bulkModerationMutation.isLoading}
                disabled={!bulkAction || bulkModerationMutation.isLoading}
              >
                Apply to {selectedStories.length} Stories
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsBulkModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}

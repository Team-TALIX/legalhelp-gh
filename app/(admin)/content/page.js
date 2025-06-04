"use client";

import { useState, useEffect, Suspense } from "react";
import {
  FiSearch,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiFilter,
  FiDownload,
  FiUpload,
  FiCheck,
  FiX,
  FiClock,
  FiGlobe,
  FiBookOpen,
  FiMoreVertical,
} from "react-icons/fi";
import useAdmin from "../../../hooks/useAdmin";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import Spinner from "../../../components/ui/Spinner";

const ContentManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedContent, setSelectedContent] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [page, setPage] = useState(1);
  const [bulkAction, setBulkAction] = useState("");

  const {
    usePendingContent,
    useApproveContent,
    useDeleteContent,
    exportData,
    loading,
    error,
  } = useAdmin();

  // Mock data for legal content since we don't have a full content system yet
  const mockContentData = {
    data: [
      {
        _id: "1",
        topicId: "family-law-marriage",
        category: "Family Law",
        title: {
          en: "Marriage Registration Process",
          twi: "Awareɛ krataa kyerɛw",
          ewe: "Srɔ̃ŋlɔ kple asitsabu",
          dagbani: "Zuɣu silimi tiŋi",
        },
        difficulty: "basic",
        keywords: ["marriage", "registration", "certificate"],
        status: "published",
        version: 1,
        lastUpdatedAt: "2024-01-15T10:30:00Z",
        createdAt: "2024-01-10T09:00:00Z",
      },
      {
        _id: "2",
        topicId: "land-rights-inheritance",
        category: "Land Rights",
        title: {
          en: "Land Inheritance Laws",
          twi: "Asase agyapadeɛ mmara",
          ewe: "Anyigba domenyinu seawo",
          dagbani: "Lahi puuni dabilahi",
        },
        difficulty: "intermediate",
        keywords: ["land", "inheritance", "property"],
        status: "pending",
        version: 2,
        lastUpdatedAt: "2024-01-20T14:15:00Z",
        createdAt: "2024-01-18T11:20:00Z",
      },
      {
        _id: "3",
        topicId: "labor-rights-disputes",
        category: "Labor Rights",
        title: {
          en: "Workplace Dispute Resolution",
          twi: "Adwumayɛbea akasakasa nkonkonoo",
          ewe: "Dɔwɔƒe dzresrɔ̃ me ɖuxuxu",
          dagbani: "Dulisimi niŋ ka shihi nye naa",
        },
        difficulty: "advanced",
        keywords: ["labor", "workplace", "disputes"],
        status: "rejected",
        version: 1,
        lastUpdatedAt: "2024-01-25T16:45:00Z",
        createdAt: "2024-01-22T13:30:00Z",
      },
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 3,
      limit: 20,
    },
  };

  const categories = [
    "Family Law",
    "Land Rights",
    "Labor Rights",
    "Criminal Law",
    "Business Law",
  ];
  const difficulties = ["basic", "intermediate", "advanced"];
  const languages = ["en", "twi", "ewe", "dagbani"];
  const statuses = ["pending", "published", "rejected", "draft"];

  // Filter content based on search and filters
  const filteredContent = mockContentData.data.filter((content) => {
    const matchesSearch =
      !searchTerm ||
      content.title.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.topicId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.keywords.some((keyword) =>
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory =
      !selectedCategory || content.category === selectedCategory;
    const matchesDifficulty =
      !selectedDifficulty || content.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleSelectContent = (contentId) => {
    setSelectedContent((prev) =>
      prev.includes(contentId)
        ? prev.filter((id) => id !== contentId)
        : [...prev, contentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContent.length === filteredContent.length) {
      setSelectedContent([]);
    } else {
      setSelectedContent(filteredContent.map((content) => content._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedContent.length === 0) return;

    try {
      // Implementation would depend on the specific bulk action
      console.log(`Performing ${bulkAction} on:`, selectedContent);
      setSelectedContent([]);
      setBulkAction("");
    } catch (error) {
      console.error("Bulk action failed:", error);
    }
  };

  const handleExport = async () => {
    try {
      await exportData("content", "csv", {
        category: selectedCategory,
        difficulty: selectedDifficulty,
        search: searchTerm,
      });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { color: "green", icon: FiCheck },
      pending: { color: "yellow", icon: FiClock },
      rejected: { color: "red", icon: FiX },
      draft: { color: "gray", icon: FiEdit3 },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span
        className={`
        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
        ${
          config.color === "green"
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            : ""
        }
        ${
          config.color === "yellow"
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
            : ""
        }
        ${
          config.color === "red"
            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            : ""
        }
        ${
          config.color === "gray"
            ? "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
            : ""
        }
      `}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      basic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      intermediate:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      advanced:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };

    return (
      <span
        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colors[difficulty]}`}
      >
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    );
  };

  return (
    <Suspense fallback={<Spinner />}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Content Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage legal topics, articles, and educational content
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FiDownload className="w-4 h-4" />
                  Export
                </Button>
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Content
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={FiSearch}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Difficulties</option>
                {difficulties.map((difficulty) => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Languages</option>
                <option value="en">English</option>
                <option value="twi">Twi</option>
                <option value="ewe">Ewe</option>
                <option value="dagbani">Dagbani</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedContent.length > 0 && (
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedContent.length} selected
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Choose action...</option>
                  <option value="publish">Publish</option>
                  <option value="unpublish">Unpublish</option>
                  <option value="delete">Delete</option>
                  <option value="archive">Archive</option>
                </select>
                <Button
                  onClick={handleBulkAction}
                  variant="secondary"
                  className="text-sm"
                  disabled={!bulkAction}
                >
                  Apply
                </Button>
              </div>
            )}
          </div>

          {/* Content Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="w-8 px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedContent.length === filteredContent.length &&
                          filteredContent.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Content
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredContent.map((content) => (
                    <tr
                      key={content._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedContent.includes(content._id)}
                          onChange={() => handleSelectContent(content._id)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {content.title.en}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {content.topicId}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {content.keywords.slice(0, 3).map((keyword) => (
                              <span
                                key={keyword}
                                className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {content.category}
                      </td>
                      <td className="px-6 py-4">
                        {getDifficultyBadge(content.difficulty)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(content.status)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(content.lastUpdatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setCurrentContent(content);
                              setShowPreviewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Preview"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setCurrentContent(content);
                              setShowEditModal(true);
                            }}
                            className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            title="Edit"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  "Are you sure you want to delete this content?"
                                )
                              ) {
                                console.log("Delete content:", content._id);
                              }
                            }}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredContent.length} of{" "}
                  {mockContentData.pagination.totalCount} results
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= mockContentData.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Add Content Modal */}
          <Modal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title="Add New Content"
            size="xl"
          >
            <form className="space-y-4">
              <Input
                label="Topic ID"
                placeholder="e.g., family-law-marriage-registration"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Title (English)" required />
                <Input label="Title (Twi)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Title (Ewe)" />
                <Input label="Title (Dagbani)" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Keywords (comma separated)"
                placeholder="marriage, registration, certificate"
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Content</Button>
              </div>
            </form>
          </Modal>

          {/* Preview Modal */}
          <Modal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            title="Content Preview"
            size="xl"
          >
            {currentContent && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {currentContent.title.en}
                  </h3>
                  <div className="flex gap-2 mb-4">
                    {getStatusBadge(currentContent.status)}
                    {getDifficultyBadge(currentContent.difficulty)}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Category:</span>{" "}
                    {currentContent.category}
                  </div>
                  <div>
                    <span className="font-medium">Topic ID:</span>{" "}
                    {currentContent.topicId}
                  </div>
                  <div>
                    <span className="font-medium">Version:</span>{" "}
                    {currentContent.version}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span>{" "}
                    {new Date(
                      currentContent.lastUpdatedAt
                    ).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Translations:</h4>
                  <div className="space-y-2">
                    {Object.entries(currentContent.title).map(
                      ([lang, title]) => (
                        <div key={lang} className="flex gap-2">
                          <span className="font-medium text-xs uppercase w-16">
                            {lang}:
                          </span>
                          <span>{title}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Keywords:</h4>
                  <div className="flex flex-wrap gap-1">
                    {currentContent.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </Suspense>
  );
};

export default ContentManagementPage;

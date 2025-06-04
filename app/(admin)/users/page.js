"use client";

import { useState, useEffect, Suspense } from "react";
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiEdit3,
  FiTrash2,
  FiMoreVertical,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiCheck,
  FiX,
  FiUserCheck,
  FiUserX,
  FiSettings,
  FiEye,
  FiShield,
} from "react-icons/fi";
import useAdmin from "../../../hooks/useAdmin";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";
import Spinner from "../../../components/ui/Spinner";

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [bulkAction, setBulkAction] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [exportFormat, setExportFormat] = useState("csv");
  const [dateFilter, setDateFilter] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("");

  const {
    useUsers,
    useUpdateUserRole,
    useDeleteUser,
    useBulkUserUpdate,
    exportData,
    loading,
    error,
  } = useAdmin();

  const queryParams = {
    page: currentPage,
    limit: pageSize,
    role: selectedRole,
    search: searchTerm,
  };

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers(queryParams);
  const updateUserRole = useUpdateUserRole();
  const deleteUser = useDeleteUser();
  const bulkUpdate = useBulkUserUpdate();

  // Fallback to mock data if real data is not available
  const mockUsersData = {
    data: [
      {
        _id: "1",
        email: "kwame.asante@gmail.com",
        phone: "+233244123456",
        role: "user",
        preferredLanguage: "twi",
        isEmailVerified: true,
        isPhoneVerified: false,
        isVerified: true,
        profile: {
          region: "Greater Accra",
          occupation: "Teacher",
        },
        usage: {
          totalQueries: 145,
          lastActive: "2024-01-30T14:30:00Z",
        },
        createdAt: "2024-01-15T09:20:00Z",
        lastLoginAt: "2024-01-30T14:30:00Z",
      },
      {
        _id: "2",
        email: "admin@legalhelp.gh",
        phone: "+233201987654",
        role: "admin",
        preferredLanguage: "en",
        isEmailVerified: true,
        isPhoneVerified: true,
        isVerified: true,
        profile: {
          region: "Greater Accra",
          occupation: "Legal Administrator",
        },
        usage: {
          totalQueries: 523,
          lastActive: "2024-01-31T16:45:00Z",
        },
        createdAt: "2024-01-01T00:00:00Z",
        lastLoginAt: "2024-01-31T16:45:00Z",
      },
      {
        _id: "3",
        email: "ama.oppong@yahoo.com",
        phone: "+233557891234",
        role: "paid_user",
        preferredLanguage: "ewe",
        isEmailVerified: true,
        isPhoneVerified: true,
        isVerified: true,
        profile: {
          region: "Volta",
          occupation: "Business Owner",
        },
        usage: {
          totalQueries: 89,
          lastActive: "2024-01-29T11:15:00Z",
        },
        createdAt: "2024-01-20T13:45:00Z",
        lastLoginAt: "2024-01-29T11:15:00Z",
      },
    ],
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCount: 3,
      limit: 20,
    },
  };

  const roles = ["user", "paid_user", "admin"];
  const languages = ["en", "twi", "ewe", "dagbani"];

  // Use real data if available, otherwise fall back to mock data
  const currentUsersData = usersData?.data || mockUsersData;
  const currentUsers = currentUsersData.data || [];

  // Filter users based on search and filters
  const filteredUsers = currentUsers.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm) ||
      user.profile?.region?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !selectedRole || user.role === selectedRole;

    const matchesVerification =
      !verificationFilter ||
      (verificationFilter === "verified" && user.isVerified) ||
      (verificationFilter === "unverified" && !user.isVerified);

    return matchesSearch && matchesRole && matchesVerification;
  });

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((user) => user._id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    setShowBulkModal(true);
  };

  const executeBulkAction = async () => {
    try {
      let updates = {};

      switch (bulkAction) {
        case "activate":
          updates = { isActive: true };
          break;
        case "deactivate":
          updates = { isActive: false };
          break;
        case "verify":
          updates = { isVerified: true };
          break;
        case "promote_paid":
          updates = { role: "paid_user" };
          break;
        case "demote_user":
          updates = { role: "user" };
          break;
        default:
          throw new Error("Invalid bulk action");
      }

      await bulkUpdate.mutateAsync({
        userIds: selectedUsers,
        updates,
      });

      setSelectedUsers([]);
      setBulkAction("");
      setShowBulkModal(false);
    } catch (error) {
      console.error("Bulk action failed:", error);
    }
  };

  const handleExport = async () => {
    try {
      await exportData("users", exportFormat, {
        role: selectedRole,
        search: searchTerm,
        verified: verificationFilter,
      });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (
      confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      try {
        await deleteUser.mutateAsync(userId);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      user: { color: "blue", label: "User" },
      paid_user: { color: "purple", label: "Premium" },
      admin: { color: "red", label: "Admin" },
    };

    const config = roleConfig[role] || roleConfig.user;

    return (
      <span
        className={`
        inline-block px-2 py-1 rounded-full text-xs font-medium
        ${
          config.color === "blue"
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
            : ""
        }
        ${
          config.color === "purple"
            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
            : ""
        }
        ${
          config.color === "red"
            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            : ""
        }
      `}
      >
        {config.label}
      </span>
    );
  };

  const getVerificationStatus = (user) => {
    if (user.isVerified) {
      return (
        <span className="flex items-center gap-1 text-green-600 dark:text-green-400 text-sm">
          <FiCheck className="w-4 h-4" />
          Verified
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-sm">
        <FiX className="w-4 h-4" />
        Unverified
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLastSeen = (dateString) => {
    const now = new Date();
    const lastSeen = new Date(dateString);
    const diffHours = Math.floor((now - lastSeen) / (1000 * 60 * 60));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`;
    return formatDate(dateString);
  };

  // Loading state
  if (usersLoading && !usersData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<Spinner />}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  User Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Manage users, roles, and permissions
                </p>
              </div>
              <div className="flex gap-3">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="csv">CSV</option>
                  <option value="xlsx">Excel</option>
                </select>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <FiDownload className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={FiSearch}
              />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace("_", " ").toUpperCase()}
                  </option>
                ))}
              </select>
              <select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Users</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedUsers.length} users selected
                </span>
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  <option value="">Choose bulk action...</option>
                  <option value="activate">Activate Users</option>
                  <option value="deactivate">Deactivate Users</option>
                  <option value="verify">Mark as Verified</option>
                  <option value="promote_paid">Promote to Premium</option>
                  <option value="demote_user">Demote to User</option>
                  <option value="export_selected">Export Selected</option>
                </select>
                <Button
                  onClick={handleBulkAction}
                  variant="secondary"
                  className="text-sm"
                  disabled={!bulkAction}
                >
                  Apply Action
                </Button>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="w-8 px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length === filteredUsers.length &&
                          filteredUsers.length > 0
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => handleSelectUser(user._id)}
                          className="rounded border-gray-300 dark:border-gray-600"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {user.email?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              {user.email}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-4">
                              {user.phone && (
                                <span className="flex items-center gap-1">
                                  <FiPhone className="w-3 h-3" />
                                  {user.phone}
                                </span>
                              )}
                              <span className="capitalize">
                                {user.preferredLanguage}
                              </span>
                            </div>
                            {user.profile?.region && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">
                                {user.profile.region} •{" "}
                                {user.profile.occupation}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {getVerificationStatus(user)}
                          <div className="flex gap-2 text-xs">
                            {user.isEmailVerified && (
                              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <FiMail className="w-3 h-3" />
                                Email
                              </span>
                            )}
                            {user.isPhoneVerified && (
                              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <FiPhone className="w-3 h-3" />
                                Phone
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        <div>
                          <div className="font-medium">
                            {user.usage.totalQueries} queries
                          </div>
                          <div className="text-xs">
                            Last seen: {formatLastSeen(user.usage.lastActive)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit User"
                          >
                            <FiEdit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete User"
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
                  Showing {filteredUsers.length} of{" "}
                  {currentUsersData.pagination?.totalCount || 0} users
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      currentPage >=
                      (currentUsersData.pagination?.totalPages || 1)
                    }
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit User Modal */}
          <Modal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            title="Edit User"
            size="lg"
          >
            {currentUser && (
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    value={currentUser.email || ""}
                    disabled
                  />
                  <Input label="Phone" value={currentUser.phone || ""} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      {roles.map((role) => (
                        <option
                          key={role}
                          value={role}
                          selected={currentUser.role === role}
                        >
                          {role.replace("_", " ").toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preferred Language
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                      {languages.map((lang) => (
                        <option
                          key={lang}
                          value={lang}
                          selected={currentUser.preferredLanguage === lang}
                        >
                          {lang.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Region"
                    value={currentUser.profile?.region || ""}
                  />
                  <Input
                    label="Occupation"
                    value={currentUser.profile?.occupation || ""}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentUser.isEmailVerified}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Email Verified
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentUser.isPhoneVerified}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Phone Verified
                    </span>
                  </label>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            )}
          </Modal>

          {/* Bulk Action Confirmation Modal */}
          <Modal
            isOpen={showBulkModal}
            onClose={() => setShowBulkModal(false)}
            title="Confirm Bulk Action"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to perform the action
                {bulkAction.replace("_", " ")} on {selectedUsers.length}{" "}
                selected users?
              </p>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowBulkModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={executeBulkAction}
                  disabled={bulkUpdate.isLoading}
                >
                  {bulkUpdate.isLoading ? <Spinner /> : "Confirm"}
                </Button>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </Suspense>
  );
};

export default UsersPage;

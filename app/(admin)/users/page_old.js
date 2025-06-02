"use client";

import { useState, useEffect } from "react";
import {
  MdSearch,
  MdFilterList,
  MdPeople,
  MdEdit,
  MdDelete,
  MdStar,
  MdSecurity,
  MdVerifiedUser,
  MdEmail,
  MdPhone,
  MdMoreVert,
} from "react-icons/md";
import useAdmin from "../../../hooks/useAdmin";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Spinner from "../../../components/ui/Spinner";
import Modal from "../../../components/ui/Modal";

export default function UsersPage() {
  const { useUsers, useUpdateUserRole, useDeleteUser } = useAdmin();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Fetch users with pagination and filters
  const {
    data: usersData,
    isLoading,
    error,
    refetch,
  } = useUsers({
    page: currentPage,
    limit: 20,
    search: searchQuery,
    role: roleFilter,
  });

  const updateUserRoleMutation = useUpdateUserRole();
  const deleteUserMutation = useDeleteUser();

  const users = usersData?.data || [];
  const pagination = usersData?.meta?.pagination || {};

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateRole = async (newRole) => {
    if (!selectedUser) return;

    try {
      await updateUserRoleMutation.mutateAsync({
        userId: selectedUser._id,
        role: newRole,
      });
      setIsEditModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUserMutation.mutateAsync(selectedUser._id);
      setIsDeleteModalOpen(false);
      refetch();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <MdSecurity className="text-purple-600" />;
      case "paid_user":
        return <MdStar className="text-orange-600" />;
      default:
        return <MdPeople className="text-blue-600" />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      paid_user:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300",
      user: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
    };
    return badges[role] || badges.user;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage users, roles, and permissions
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="sm:w-48">
              <select
                value={roleFilter}
                onChange={(e) => handleRoleFilter(e.target.value)}
                className="w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:text-white"
              >
                <option value="">All Roles</option>
                <option value="user">Regular Users</option>
                <option value="paid_user">Premium Users</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600 dark:text-red-400">
                Error loading users: {error.message}
              </p>
              <Button
                onClick={() => refetch()}
                variant="outline"
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Verification
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Last Active
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {user.profile?.name?.[0] ||
                                  user.email?.[0] ||
                                  "U"}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {user.profile?.name ||
                                  user.googleProfile?.name ||
                                  "Unknown"}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email || user.googleProfile?.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {getRoleIcon(user.role)}
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
                                user.role
                              )}`}
                            >
                              {user.role.replace("_", " ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {user.isEmailVerified && (
                              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                <MdEmail className="text-sm" />
                                <span className="text-xs">Email</span>
                              </div>
                            )}
                            {user.isPhoneVerified && (
                              <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                                <MdPhone className="text-sm" />
                                <span className="text-xs">Phone</span>
                              </div>
                            )}
                            {user.isVerified && (
                              <MdVerifiedUser className="text-green-600 dark:text-green-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.usage?.lastActive
                            ? new Date(
                                user.usage.lastActive
                              ).toLocaleDateString()
                            : "Never"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              onClick={() => handleEditUser(user)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <MdEdit className="text-lg" />
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <MdDelete className="text-lg" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                    of {pagination.totalCount} users
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

        {/* Edit User Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Edit User Role"
        >
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {selectedUser.profile?.name?.[0] ||
                      selectedUser.email?.[0] ||
                      "U"}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {selectedUser.profile?.name ||
                      selectedUser.googleProfile?.name ||
                      "Unknown"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedUser.email || selectedUser.googleProfile?.email}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Role
                </label>
                <div className="space-y-2">
                  {["user", "paid_user", "admin"].map((role) => (
                    <label key={role} className="flex items-center">
                      <input
                        type="radio"
                        name="role"
                        value={role}
                        checked={selectedUser.role === role}
                        onChange={() =>
                          setSelectedUser({ ...selectedUser, role })
                        }
                        className="mr-2"
                      />
                      <div className="flex items-center gap-2">
                        {getRoleIcon(role)}
                        <span className="capitalize">
                          {role.replace("_", " ")}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleUpdateRole(selectedUser.role)}
                  loading={updateUserRoleMutation.isLoading}
                  disabled={updateUserRoleMutation.isLoading}
                >
                  Update Role
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete User Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete User"
        >
          {selectedUser && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {selectedUser.profile?.name?.[0] ||
                      selectedUser.email?.[0] ||
                      "U"}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {selectedUser.profile?.name ||
                      selectedUser.googleProfile?.name ||
                      "Unknown"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedUser.email || selectedUser.googleProfile?.email}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="danger"
                  onClick={handleConfirmDelete}
                  loading={deleteUserMutation.isLoading}
                  disabled={deleteUserMutation.isLoading}
                >
                  Delete User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

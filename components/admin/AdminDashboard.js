"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import StatsCard from "./StatsCard";
import UserChart from "./UserChart";
import UsageChart from "./UsageChart";
import Button from "../ui/Button";
import useAdmin from "../../hooks/useAdmin";
import {
  MdPeople,
  MdChat,
  MdWarning,
  MdManageAccounts,
  MdStar,
  MdSecurity,
  MdBook,
  MdLibraryBooks,
  MdAnalytics,
} from "react-icons/md";
import { HiUserGroup } from "react-icons/hi";

const AdminDashboard = () => {
  const router = useRouter();
  const [period, setPeriod] = useState("30d");

  const { useDashboardStats, useUserAnalytics, useUsageAnalytics } = useAdmin();

  // Use the admin hooks for data fetching
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
  } = useDashboardStats();

  const { data: userAnalytics, isLoading: userAnalyticsLoading } =
    useUserAnalytics(period);

  const { data: usageAnalytics, isLoading: usageAnalyticsLoading } =
    useUsageAnalytics(period);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };

  // Determine loading and error states
  const isLoading = dashboardLoading;
  const analyticsLoading = userAnalyticsLoading || usageAnalyticsLoading;
  const error = dashboardError;

  const navigateToSection = (section) => {
    router.push(`/${section}`);
  };

  const periods = [
    { value: "7d", label: "7 Days" },
    { value: "30d", label: "30 Days" },
    { value: "90d", label: "90 Days" },
    { value: "1y", label: "1 Year" },
  ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <div className="flex items-center">
              <MdWarning className="text-red-400 text-xl mr-3" />
              <div>
                <h3 className="text-lg font-medium text-red-800 dark:text-red-200">
                  Error Loading Dashboard
                </h3>
                <p className="text-red-600 dark:text-red-300 mt-1">
                  {error?.message || "Failed to load dashboard data"}
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="danger"
                  className="mt-3"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Monitor and manage your LegalHelp GH platform
              </p>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Period:
              </span>
              <select
                value={period}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="
                  bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
                  rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-orange-500
                  focus:border-orange-500 dark:text-white
                "
              >
                {periods.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={dashboardData?.data?.users?.total}
            trend="+12%"
            description="from last month"
            icon={MdPeople}
            color="orange"
            loading={isLoading}
          />
          <StatsCard
            title="Active Users"
            value={dashboardData?.data?.users?.active}
            trend="+8%"
            description="from last month"
            icon={HiUserGroup}
            color="green"
            loading={isLoading}
          />
          <StatsCard
            title="Total Queries"
            value={dashboardData?.data?.usage?.totalQueries}
            trend="+15%"
            description="from last month"
            icon={MdChat}
            color="blue"
            loading={isLoading}
          />
          <StatsCard
            title="Pending Moderation"
            value={dashboardData?.data?.content?.pendingModeration}
            trend={
              (dashboardData?.data?.content?.pendingModeration || 0) > 5
                ? "+high"
                : "normal"
            }
            description="stories to review"
            icon={MdWarning}
            color="purple"
            loading={isLoading}
          />
        </div>

        {/* Role Breakdown */}
        {dashboardData?.data?.users?.byRole && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              title="Regular Users"
              value={dashboardData.data.users.byRole.user || 0}
              icon={MdManageAccounts}
              color="blue"
              loading={isLoading}
            />
            <StatsCard
              title="Premium Users"
              value={dashboardData.data.users.byRole.paid_user || 0}
              icon={MdStar}
              color="orange"
              loading={isLoading}
            />
            <StatsCard
              title="Administrators"
              value={dashboardData.data.users.byRole.admin || 0}
              icon={MdSecurity}
              color="purple"
              loading={isLoading}
            />
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UserChart
            data={userAnalytics?.data || []}
            loading={analyticsLoading}
            period={period}
          />
          <UsageChart
            data={usageAnalytics?.data || []}
            loading={analyticsLoading}
            period={period}
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => navigateToSection("moderation")}
              className="
                flex items-center justify-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20
                border border-orange-200 dark:border-orange-800 rounded-lg
                hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors cursor-pointer
              "
            >
              <MdBook className="text-2xl text-orange-600 dark:text-orange-400" />
              <div className="text-left">
                <div className="font-medium text-orange-800 dark:text-orange-200">
                  Review Stories
                </div>
                <div className="text-sm text-orange-600 dark:text-orange-300">
                  {dashboardData?.data?.content?.pendingModeration || 0} pending
                </div>
              </div>
            </div>

            <div
              onClick={() => navigateToSection("users")}
              className="
                flex items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20
                border border-blue-200 dark:border-blue-800 rounded-lg
                hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors cursor-pointer
              "
            >
              <MdPeople className="text-2xl text-blue-600 dark:text-blue-400" />
              <div className="text-left">
                <div className="font-medium text-blue-800 dark:text-blue-200">
                  Manage Users
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-300">
                  {dashboardData?.data?.users?.total || 0} total users
                </div>
              </div>
            </div>

            <div
              onClick={() => navigateToSection("content")}
              className="
                flex items-center justify-center gap-3 p-4 bg-green-50 dark:bg-green-900/20
                border border-green-200 dark:border-green-800 rounded-lg
                hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors cursor-pointer
              "
            >
              <MdLibraryBooks className="text-2xl text-green-600 dark:text-green-400" />
              <div className="text-left">
                <div className="font-medium text-green-800 dark:text-green-200">
                  Legal Content
                </div>
                <div className="text-sm text-green-600 dark:text-green-300">
                  {dashboardData?.data?.content?.legalTopics || 0} topics
                </div>
              </div>
            </div>

            <div
              onClick={() => navigateToSection("analytics")}
              className="
                flex items-center justify-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20
                border border-purple-200 dark:border-purple-800 rounded-lg
                hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors cursor-pointer
              "
            >
              <MdAnalytics className="text-2xl text-purple-600 dark:text-purple-400" />
              <div className="text-left">
                <div className="font-medium text-purple-800 dark:text-purple-200">
                  View Analytics
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-300">
                  Detailed reports
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                System Status: Operational
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last updated:{" "}
              {dashboardData?.data?.lastUpdated
                ? new Date(dashboardData.data.lastUpdated).toLocaleTimeString()
                : "Now"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

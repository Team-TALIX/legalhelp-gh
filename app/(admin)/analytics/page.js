"use client";

import { useState, useEffect } from "react";
import {
  FiDownload,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiMessageSquare,
  FiMic,
  FiGlobe,
  FiBarChart,
  FiPieChart,
  FiActivity,
  FiRefreshCw,
} from "react-icons/fi";
import useAdmin from "../../../hooks/useAdmin";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import StatsCard from "../../../components/admin/StatsCard";

const AnalyticsPage = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("30d");
  const [exportFormat, setExportFormat] = useState("csv");
  const [loading, setLoading] = useState(false);

  const {
    useUserAnalytics,
    useUsageAnalytics,
    useContentAnalytics,
    useDashboardStats,
    exportData,
    error,
  } = useAdmin();

  const {
    data: userAnalytics,
    isLoading: userAnalyticsLoading,
    error: userAnalyticsError,
  } = useUserAnalytics(selectedPeriod);

  const {
    data: usageAnalytics,
    isLoading: usageAnalyticsLoading,
    error: usageAnalyticsError,
  } = useUsageAnalytics(selectedPeriod);

  const {
    data: contentAnalytics,
    isLoading: contentAnalyticsLoading,
    error: contentAnalyticsError,
  } = useContentAnalytics(selectedPeriod);

  const { data: dashboardData, isLoading: dashboardLoading } =
    useDashboardStats();

  const periods = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 3 months" },
    { value: "1y", label: "Last year" },
  ];

  // Mock comprehensive analytics data
  const mockAnalytics = {
    overview: {
      totalUsers: 15420,
      activeUsers: 8340,
      totalQueries: 45670,
      voiceQueries: 18920,
      textQueries: 26750,
      averageSessionDuration: "12m 34s",
      querySuccessRate: 94.2,
      userSatisfaction: 4.6,
    },
    userGrowth: [
      { date: "2024-01-01", newUsers: 120, totalUsers: 14800 },
      { date: "2024-01-02", newUsers: 135, totalUsers: 14935 },
      { date: "2024-01-03", newUsers: 98, totalUsers: 15033 },
      { date: "2024-01-04", newUsers: 156, totalUsers: 15189 },
      { date: "2024-01-05", newUsers: 142, totalUsers: 15331 },
      { date: "2024-01-06", newUsers: 89, totalUsers: 15420 },
    ],
    languageBreakdown: {
      english: 45.2,
      twi: 32.8,
      ewe: 15.4,
      dagbani: 6.6,
    },
    topTopics: [
      { topic: "Family Law", queries: 8920, growth: 15.2 },
      { topic: "Land Rights", queries: 7340, growth: 8.7 },
      { topic: "Labor Rights", queries: 5680, growth: -2.1 },
      { topic: "Criminal Law", queries: 4230, growth: 22.5 },
      { topic: "Business Law", queries: 3180, growth: 11.3 },
    ],
    regionalData: [
      { region: "Greater Accra", users: 4820, percentage: 31.3 },
      { region: "Ashanti", users: 3240, percentage: 21.0 },
      { region: "Western", users: 2180, percentage: 14.1 },
      { region: "Northern", users: 1890, percentage: 12.3 },
      { region: "Eastern", users: 1560, percentage: 10.1 },
      { region: "Others", users: 1730, percentage: 11.2 },
    ],
    queryPatterns: {
      hourly: [
        { hour: "00", queries: 420 },
        { hour: "06", queries: 890 },
        { hour: "12", queries: 1650 },
        { hour: "18", queries: 1420 },
        { hour: "23", queries: 680 },
      ],
      daily: [
        { day: "Monday", queries: 6540 },
        { day: "Tuesday", queries: 7120 },
        { day: "Wednesday", queries: 6890 },
        { day: "Thursday", queries: 7340 },
        { day: "Friday", queries: 6980 },
        { day: "Saturday", queries: 5450 },
        { day: "Sunday", queries: 5350 },
      ],
    },
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      await exportData("analytics", exportFormat, {
        period: selectedPeriod,
        includeCharts: true,
      });
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthIndicator = (growth) => {
    if (growth > 0) {
      return (
        <span className="flex items-center text-green-600 dark:text-green-400 text-sm">
          <FiTrendingUp className="w-4 h-4 mr-1" />+{growth.toFixed(1)}%
        </span>
      );
    } else if (growth < 0) {
      return (
        <span className="flex items-center text-red-600 dark:text-red-400 text-sm">
          <FiTrendingDown className="w-4 h-4 mr-1" />
          {growth.toFixed(1)}%
        </span>
      );
    }
    return (
      <span className="text-gray-500 dark:text-gray-400 text-sm">0.0%</span>
    );
  };

  const SimpleChart = ({ data, type = "line", height = "200px" }) => {
    // Simple visual representation since we don't have a chart library
    return (
      <div
        className={`relative bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg`}
        style={{ height }}
      >
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <FiBarChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Chart visualization</p>
            <p className="text-xs opacity-75">
              {type} chart with{" "}
              {Array.isArray(data) ? data.length : Object.keys(data).length}{" "}
              data points
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Show loading if initial data is loading
  const isInitialLoading =
    userAnalyticsLoading && usageAnalyticsLoading && contentAnalyticsLoading;

  // Combine analytics data with fallback to mock data
  const combinedAnalytics = {
    ...mockAnalytics,
    // Use real data when available
    userGrowth: userAnalytics?.data || mockAnalytics.userGrowth,
    usageData: usageAnalytics?.data || [],
    contentData: contentAnalytics?.data || [],
  };

  if (isInitialLoading) {
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive insights into platform usage and performance
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="csv">CSV</option>
                <option value="xlsx">Excel</option>
                <option value="pdf">PDF</option>
              </select>
              <Button
                onClick={handleExport}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? <Spinner /> : <FiDownload className="w-4 h-4" />}
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value={
              dashboardData?.data?.users?.total ||
              mockAnalytics.overview.totalUsers
            }
            trend="+12.5%"
            icon={FiUsers}
            color="blue"
            loading={dashboardLoading}
          />
          <StatsCard
            title="Active Users"
            value={
              dashboardData?.data?.users?.active ||
              mockAnalytics.overview.activeUsers
            }
            trend="+8.3%"
            icon={FiActivity}
            color="green"
            loading={dashboardLoading}
          />
          <StatsCard
            title="Total Queries"
            value={
              dashboardData?.data?.usage?.totalQueries ||
              mockAnalytics.overview.totalQueries
            }
            trend="+15.7%"
            icon={FiMessageSquare}
            color="purple"
            loading={dashboardLoading}
          />
          <StatsCard
            title="Voice Queries"
            value={
              dashboardData?.data?.usage?.totalVoiceQueries ||
              mockAnalytics.overview.voiceQueries
            }
            trend="+22.1%"
            icon={FiMic}
            color="orange"
            loading={dashboardLoading}
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Growth Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                User Growth
              </h3>
              <FiTrendingUp className="w-5 h-5 text-green-500" />
            </div>
            {userAnalyticsLoading ? (
              <div className="flex items-center justify-center h-48">
                <Spinner />
              </div>
            ) : (
              <>
                <SimpleChart
                  data={userAnalytics?.data || mockAnalytics.userGrowth}
                  type="line"
                />
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>Daily new user registrations over the selected period</p>
                  {userAnalytics?.data && (
                    <p className="text-xs mt-1">
                      Showing {userAnalytics.data.length} data points for{" "}
                      {selectedPeriod}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Language Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Language Distribution
              </h3>
              <FiGlobe className="w-5 h-5 text-blue-500" />
            </div>
            <SimpleChart data={mockAnalytics.languageBreakdown} type="pie" />
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              {Object.entries(mockAnalytics.languageBreakdown).map(
                ([lang, percentage]) => (
                  <div key={lang} className="flex justify-between">
                    <span className="capitalize text-gray-600 dark:text-gray-400">
                      {lang}:
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {percentage}%
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* Top Legal Topics */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Legal Topics
            </h3>
            <FiBarChart className="w-5 h-5 text-purple-500" />
          </div>
          <div className="space-y-4">
            {mockAnalytics.topTopics.map((topic, index) => (
              <div
                key={topic.topic}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-medium text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {topic.topic}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {topic.queries.toLocaleString()} queries
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {getGrowthIndicator(topic.growth)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Data & Query Patterns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Regional Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Regional Distribution
            </h3>
            <div className="space-y-3">
              {mockAnalytics.regionalData.map((region) => (
                <div
                  key={region.region}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 bg-blue-500 rounded"
                      style={{
                        width: `${Math.max(region.percentage * 0.8, 8)}px`,
                      }}
                    ></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {region.region}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {region.users.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {region.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Query Patterns */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Query Patterns
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Daily Distribution
                </h4>
                <div className="space-y-2">
                  {mockAnalytics.queryPatterns.daily.map((day) => (
                    <div
                      key={day.day}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600 dark:text-gray-400">
                        {day.day}
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2 bg-purple-400 rounded"
                          style={{ width: `${(day.queries / 8000) * 80}px` }}
                        ></div>
                        <span className="text-gray-900 dark:text-white w-12 text-right">
                          {(day.queries / 1000).toFixed(1)}k
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {mockAnalytics.overview.querySuccessRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Query Success Rate
              </div>
              <div className="text-xs text-green-600 dark:text-green-400">
                +2.1% from last period
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {mockAnalytics.overview.averageSessionDuration}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Avg. Session Duration
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400">
                +8.5% from last period
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {mockAnalytics.overview.userSatisfaction}/5
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                User Satisfaction
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                +0.3 from last period
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

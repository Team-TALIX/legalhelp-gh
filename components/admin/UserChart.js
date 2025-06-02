"use client";

import { useState, useEffect } from "react";
import {
  MdBarChart,
  MdTrendingUp,
  MdPeople,
  MdPersonAdd,
} from "react-icons/md";
import Spinner from "../ui/Spinner";

const UserChart = ({ data = [], loading = false, period = "30d" }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      // Process data for visualization
      const processedData = data.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        totalUsers: item.metrics?.totalUsers || 0,
        activeUsers: item.metrics?.activeUsers || 0,
        newRegistrations: item.metrics?.newRegistrations || 0,
      }));
      setChartData(processedData);
    }
  }, [data]);

  const getMaxValue = () => {
    if (chartData.length === 0) return 100;
    return Math.max(
      ...chartData.map((d) =>
        Math.max(d.totalUsers, d.activeUsers, d.newRegistrations)
      )
    );
  };

  const getBarHeight = (value, maxValue) => {
    return Math.max((value / maxValue) * 100, 2); // Minimum 2% height for visibility
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              Loading user analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = getMaxValue();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <MdBarChart className="text-blue-600 dark:text-blue-400 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            User Analytics
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Total Users
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">
              Active Users
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">New Users</span>
          </div>
        </div>
      </div>

      {chartData.length === 0 ? (
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="text-center">
            <MdTrendingUp className="text-gray-400 dark:text-gray-500 text-4xl mb-2 mx-auto" />
            <p className="text-gray-500 dark:text-gray-400">
              No data available for the selected period
            </p>
          </div>
        </div>
      ) : (
        <div className="h-64 flex items-end justify-between gap-1 border-b border-gray-200 dark:border-gray-700">
          {chartData.map((item, index) => (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-1"
            >
              {/* Bars */}
              <div className="w-full flex items-end justify-center gap-0.5 h-48">
                {/* Total Users Bar */}
                <div
                  className="bg-orange-500 rounded-t w-2 transition-all duration-500 hover:bg-orange-600 group relative"
                  style={{
                    height: `${getBarHeight(item.totalUsers, maxValue)}%`,
                  }}
                  title={`Total Users: ${item.totalUsers}`}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Total: {item.totalUsers}
                  </div>
                </div>

                {/* Active Users Bar */}
                <div
                  className="bg-blue-500 rounded-t w-2 transition-all duration-500 hover:bg-blue-600 group relative"
                  style={{
                    height: `${getBarHeight(item.activeUsers, maxValue)}%`,
                  }}
                  title={`Active Users: ${item.activeUsers}`}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    Active: {item.activeUsers}
                  </div>
                </div>

                {/* New Registrations Bar */}
                <div
                  className="bg-green-500 rounded-t w-2 transition-all duration-500 hover:bg-green-600 group relative"
                  style={{
                    height: `${getBarHeight(item.newRegistrations, maxValue)}%`,
                  }}
                  title={`New Users: ${item.newRegistrations}`}
                >
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    New: {item.newRegistrations}
                  </div>
                </div>
              </div>

              {/* Date Label */}
              <span className="text-xs text-gray-500 dark:text-gray-400 transform -rotate-45 origin-center">
                {item.date}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Y-axis labels */}
      <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>0</span>
        <span>{Math.round(maxValue / 2)}</span>
        <span>{maxValue}</span>
      </div>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400 mb-1">
            <MdPeople className="text-sm" />
            <span className="text-xs font-medium">Total</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {chartData.length > 0
              ? chartData[chartData.length - 1]?.totalUsers || 0
              : 0}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
            <MdTrendingUp className="text-sm" />
            <span className="text-xs font-medium">Active</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {chartData.length > 0
              ? chartData[chartData.length - 1]?.activeUsers || 0
              : 0}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
            <MdPersonAdd className="text-sm" />
            <span className="text-xs font-medium">New</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {chartData.reduce((sum, item) => sum + item.newRegistrations, 0)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserChart;

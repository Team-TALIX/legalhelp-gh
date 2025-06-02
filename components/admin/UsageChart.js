"use client";

import { useState, useEffect } from "react";
import {
  MdQueryStats,
  MdTrendingUp,
  MdMic,
  MdMessage,
  MdLanguage,
  MdBarChart,
} from "react-icons/md";
import { HiGlobeAlt } from "react-icons/hi";
import Spinner from "../ui/Spinner";

const UsageChart = ({ data = [], loading = false, period = "30d" }) => {
  const [chartData, setChartData] = useState([]);
  const [activeTab, setActiveTab] = useState("queries");

  useEffect(() => {
    if (data && data.length > 0) {
      const processedData = data.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        totalQueries: item.metrics?.totalQueries || 0,
        voiceQueries: item.metrics?.voiceQueries || 0,
        textQueries: item.metrics?.textQueries || 0,
        languageBreakdown: item.metrics?.languageBreakdown || {},
      }));
      setChartData(processedData);
    }
  }, [data]);

  const getMaxValue = (type) => {
    if (chartData.length === 0) return 100;

    switch (type) {
      case "queries":
        return Math.max(...chartData.map((d) => d.totalQueries));
      case "voice":
        return Math.max(...chartData.map((d) => d.voiceQueries));
      case "text":
        return Math.max(...chartData.map((d) => d.textQueries));
      default:
        return 100;
    }
  };

  const getLanguageStats = () => {
    if (chartData.length === 0) return [];

    const totals = { twi: 0, ewe: 0, dagbani: 0, english: 0 };

    chartData.forEach((item) => {
      const lang = item.languageBreakdown;
      totals.twi += lang.twi || 0;
      totals.ewe += lang.ewe || 0;
      totals.dagbani += lang.dagbani || 0;
      totals.english += lang.english || 0;
    });

    const total = Object.values(totals).reduce((sum, val) => sum + val, 0);

    return Object.entries(totals).map(([lang, count]) => ({
      language: lang.charAt(0).toUpperCase() + lang.slice(1),
      count,
      percentage: total > 0 ? ((count / total) * 100).toFixed(1) : 0,
    }));
  };

  const getLineHeight = (value, maxValue) => {
    return Math.max((value / maxValue) * 100, 1);
  };

  const tabs = [
    {
      id: "queries",
      label: "Total Queries",
      color: "orange",
      icon: MdQueryStats,
    },
    { id: "voice", label: "Voice Queries", color: "blue", icon: MdMic },
    { id: "text", label: "Text Queries", color: "green", icon: MdMessage },
  ];

  const languageStats = getLanguageStats();

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-gray-500 dark:text-gray-400 mt-4">
              Loading usage analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const maxValue = getMaxValue(activeTab);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <MdTrendingUp className="text-green-600 dark:text-green-400 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Usage Analytics
          </h3>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-md transition-colors
                  ${
                    activeTab === tab.id
                      ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }
                `}
              >
                <IconComponent className="text-sm" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          {chartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
              <div className="text-center">
                <MdBarChart className="text-gray-400 dark:text-gray-500 text-4xl mb-2 mx-auto" />
                <p className="text-gray-500 dark:text-gray-400">
                  No usage data available
                </p>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-end justify-between gap-2 border-b border-gray-200 dark:border-gray-700">
              {chartData.map((item, index) => {
                const value =
                  activeTab === "queries"
                    ? item.totalQueries
                    : activeTab === "voice"
                    ? item.voiceQueries
                    : item.textQueries;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className={`
                        w-full rounded-t transition-all duration-500 cursor-pointer group relative
                        ${
                          activeTab === "queries"
                            ? "bg-orange-500 hover:bg-orange-600"
                            : activeTab === "voice"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-green-500 hover:bg-green-600"
                        }
                      `}
                      style={{ height: `${getLineHeight(value, maxValue)}%` }}
                      title={`${
                        tabs.find((t) => t.id === activeTab)?.label
                      }: ${value}`}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                        {tabs.find((t) => t.id === activeTab)?.label}: {value}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 transform -rotate-45">
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Y-axis labels */}
          <div className="mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>0</span>
            <span>{Math.round(maxValue / 2)}</span>
            <span>{maxValue}</span>
          </div>
        </div>

        {/* Language Breakdown */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MdLanguage className="text-purple-600 dark:text-purple-400" />
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              Language Usage
            </h4>
          </div>

          {languageStats.length === 0 ? (
            <div className="text-center py-8">
              <HiGlobeAlt className="text-gray-400 dark:text-gray-500 text-3xl mb-2 mx-auto" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No language data
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {languageStats.map((lang, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">
                      {lang.language}
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {lang.count} ({lang.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`
                        h-2 rounded-full transition-all duration-500
                        ${
                          index === 0
                            ? "bg-orange-500"
                            : index === 1
                            ? "bg-blue-500"
                            : index === 2
                            ? "bg-green-500"
                            : "bg-purple-500"
                        }
                      `}
                      style={{ width: `${lang.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 gap-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-orange-600 dark:text-orange-400 mb-1">
                  <MdQueryStats className="text-sm" />
                  <span className="text-xs font-medium">Total</span>
                </div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {chartData.reduce((sum, item) => sum + item.totalQueries, 0)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <div className="flex items-center justify-center gap-1 text-blue-600 dark:text-blue-400 mb-1">
                    <MdMic className="text-xs" />
                    <span className="text-xs font-medium">Voice</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {chartData.reduce(
                      (sum, item) => sum + item.voiceQueries,
                      0
                    )}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
                    <MdMessage className="text-xs" />
                    <span className="text-xs font-medium">Text</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {chartData.reduce((sum, item) => sum + item.textQueries, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageChart;

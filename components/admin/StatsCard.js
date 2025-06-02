"use client";

import React, { useState, useEffect } from "react";

const StatsCard = ({
  title,
  value,
  trend,
  icon,
  description,
  loading = false,
  color = "orange",
}) => {
  const [displayValue, setDisplayValue] = useState(0);

  // Animate number counting
  useEffect(() => {
    if (loading || typeof value !== "number") return;

    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, loading]);

  const formatValue = (val) => {
    if (typeof val === "number") {
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendColor = (trendStr) => {
    if (!trendStr) return "";
    const isPositive = trendStr.includes("+") || parseFloat(trendStr) > 0;
    return isPositive ? "text-green-500" : "text-red-500";
  };

  const getColorClasses = (color) => {
    const colors = {
      orange: {
        bg: "bg-orange-50 dark:bg-orange-900/10",
        icon: "text-orange-600 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-800",
      },
      blue: {
        bg: "bg-blue-50 dark:bg-blue-900/10",
        icon: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-800",
      },
      green: {
        bg: "bg-green-50 dark:bg-green-900/10",
        icon: "text-green-600 dark:text-green-400",
        border: "border-green-200 dark:border-green-800",
      },
      purple: {
        bg: "bg-purple-50 dark:bg-purple-900/10",
        icon: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-800",
      },
    };
    return colors[color] || colors.orange;
  };

  const colorClasses = getColorClasses(color);

  if (loading) {
    return (
      <div
        className={`
        bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700
        p-6 theme-transition animate-pulse
      `}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
          <div className="h-12 w-12 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`
      bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700
      p-6 theme-transition hover:shadow-md transition-shadow duration-200
    `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatValue(displayValue)}
          </p>
          {trend && (
            <p className={`text-xs font-medium ${getTrendColor(trend)} mt-1`}>
              {trend}
              {description && (
                <span className="text-gray-500 dark:text-gray-400 ml-1">
                  {description}
                </span>
              )}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={`
            ${colorClasses.bg} ${colorClasses.border}
            p-3 rounded-lg border
          `}
          >
            {typeof icon === "string" ? (
              <div className={`${colorClasses.icon} text-xl`}>{icon}</div>
            ) : (
              React.createElement(icon, {
                className: `${colorClasses.icon} text-xl`,
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;

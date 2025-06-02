"use client";

import { useState, useEffect } from "react";
import {
  FiBell,
  FiX,
  FiCheck,
  FiAlertTriangle,
  FiInfo,
  FiAlertCircle,
  FiUsers,
  FiFileText,
  FiActivity,
  FiRefreshCw,
} from "react-icons/fi";
import useAdmin from "../../hooks/useAdmin";
import Button from "../ui/Button";

const NotificationCenter = ({ isOpen, onClose, onToggle }) => {
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);

  const { useNotifications, useMarkNotificationRead, loading } = useAdmin();

  const notifications = useNotifications();
  const markAsRead = useMarkNotificationRead();

  const severityConfig = {
    info: {
      icon: FiInfo,
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
      borderColor: "border-blue-200 dark:border-blue-800",
      iconColor: "text-blue-600 dark:text-blue-400",
      dotColor: "bg-blue-500",
    },
    warning: {
      icon: FiAlertTriangle,
      bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
      borderColor: "border-yellow-200 dark:border-yellow-800",
      iconColor: "text-yellow-600 dark:text-yellow-400",
      dotColor: "bg-yellow-500",
    },
    error: {
      icon: FiAlertCircle,
      bgColor: "bg-red-50 dark:bg-red-900/20",
      borderColor: "border-red-200 dark:border-red-800",
      iconColor: "text-red-600 dark:text-red-400",
      dotColor: "bg-red-500",
    },
    success: {
      icon: FiCheck,
      bgColor: "bg-green-50 dark:bg-green-900/20",
      borderColor: "border-green-200 dark:border-green-800",
      iconColor: "text-green-600 dark:text-green-400",
      dotColor: "bg-green-500",
    },
  };

  const typeIcons = {
    user_registration: FiUsers,
    content_pending: FiFileText,
    system_health: FiActivity,
    moderation_required: FiAlertTriangle,
    backup_complete: FiCheck,
  };

  const mockNotifications = [
    {
      id: "1",
      type: "user_registration",
      title: "New User Surge",
      message:
        "15 new users registered in the last hour, 35% increase from average",
      timestamp: new Date(),
      isRead: false,
      severity: "info",
      actionRequired: false,
    },
    {
      id: "2",
      type: "content_pending",
      title: "Content Approval Required",
      message: "8 legal articles are pending review and approval",
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      isRead: false,
      severity: "warning",
      actionRequired: true,
      actionUrl: "/admin/content",
    },
    {
      id: "3",
      type: "system_health",
      title: "Database Performance Alert",
      message:
        "Average query response time increased to 450ms (threshold: 300ms)",
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      isRead: false,
      severity: "warning",
      actionRequired: true,
    },
    {
      id: "4",
      type: "moderation_required",
      title: "Community Stories Need Review",
      message: "12 community stories flagged for moderation",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: true,
      severity: "warning",
      actionRequired: true,
      actionUrl: "/admin/moderation",
    },
    {
      id: "5",
      type: "backup_complete",
      title: "Backup Completed Successfully",
      message: "Daily backup completed at 3:00 AM, 2.3GB data backed up",
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
      isRead: true,
      severity: "success",
      actionRequired: false,
    },
  ];

  const filteredNotifications = mockNotifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead;
    if (filter === "actionRequired") return notification.actionRequired;
    return true;
  });

  const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead.mutateAsync(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = mockNotifications.filter((n) => !n.isRead);
    try {
      await Promise.all(
        unreadNotifications.map((n) => markAsRead.mutateAsync(n.id))
      );
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (!isOpen) {
    return (
      <div className="relative">
        <button
          onClick={onToggle}
          className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <FiBell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
      {/* Backdrop for mobile */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
        onClick={onClose}
      />

      {/* Notification Panel */}
      <div className="absolute right-0 top-full lg:top-0 mt-2 w-full max-w-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 lg:max-h-[500px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 text-xs px-2 py-1 rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => notifications.refetch()}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={notifications.isRefetching}
            >
              <FiRefreshCw
                className={`w-4 h-4 ${
                  notifications.isRefetching ? "animate-spin" : ""
                }`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1 p-3 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: "all", label: "All" },
            { key: "unread", label: "Unread" },
            { key: "actionRequired", label: "Action Required" },
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === filterOption.key
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Actions */}
        {unreadCount > 0 && (
          <div className="p-3 border-b border-gray-200 dark:border-gray-700">
            <Button
              onClick={handleMarkAllAsRead}
              variant="ghost"
              className="w-full text-sm"
              disabled={markAsRead.isLoading}
            >
              Mark all as read
            </Button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <FiBell className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No notifications found</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredNotifications.map((notification) => {
                const config = severityConfig[notification.severity];
                const TypeIcon = typeIcons[notification.type] || FiInfo;
                const SeverityIcon = config.icon;

                return (
                  <div
                    key={notification.id}
                    className={`
                      relative p-3 mb-2 rounded-lg border transition-colors
                      ${config.bgColor} ${config.borderColor}
                      ${
                        !notification.isRead
                          ? "ring-2 ring-blue-200 dark:ring-blue-800"
                          : ""
                      }
                      hover:shadow-sm
                    `}
                  >
                    {/* Unread indicator */}
                    {!notification.isRead && (
                      <div
                        className={`absolute top-3 right-3 w-2 h-2 rounded-full ${config.dotColor}`}
                      />
                    )}

                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 ${config.iconColor}`}>
                        <TypeIcon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {notification.title}
                          </h4>
                          <div className={`flex-shrink-0 ${config.iconColor}`}>
                            <SeverityIcon className="w-4 h-4" />
                          </div>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 text-xs mt-1 line-clamp-2">
                          {notification.message}
                        </p>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(notification.timestamp)}
                          </span>

                          <div className="flex gap-1">
                            {notification.actionRequired && (
                              <button
                                onClick={() => {
                                  if (notification.actionUrl) {
                                    window.location.href =
                                      notification.actionUrl;
                                  }
                                }}
                                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Take Action
                              </button>
                            )}

                            {!notification.isRead && (
                              <button
                                onClick={() =>
                                  handleMarkAsRead(notification.id)
                                }
                                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                disabled={markAsRead.isLoading}
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={() => {
              window.location.href = "/admin/notifications";
            }}
          >
            View All Notifications
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;

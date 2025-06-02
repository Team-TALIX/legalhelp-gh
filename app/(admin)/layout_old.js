"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import Spinner from "../../components/ui/Spinner";
import useAdmin from "../../hooks/useAdmin";
import {
  MdDashboard,
  MdPeople,
  MdLibraryBooks,
  MdSecurity,
  MdAnalytics,
  MdMenu,
  MdClose,
  MdNotifications,
  MdLogout,
} from "react-icons/md";
import { HiScale } from "react-icons/hi";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const { useNotifications, useSystemHealth } = useAdmin();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch notifications and system health
  const { data: response = {} } = useNotifications();
  const notifications = response.data || [];
  
  const { data: systemHealth } = useSystemHealth();

  useEffect(() => {
    // Check for admin role after authentication
    if (!isLoading && user && user.role !== "admin") {
      router.push("/unauthorized");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Don't render for non-admin users
  // if (!user || user.role !== "admin") {
  //   return null;
  // }

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: MdDashboard,
      current: pathname === "/dashboard",
    },
    {
      name: "Users",
      href: "/users",
      icon: MdPeople,
      current: pathname === "/users",
    },
    {
      name: "Content",
      href: "/content",
      icon: MdLibraryBooks,
      current: pathname === "/content",
    },
    {
      name: "Moderation",
      href: "/moderation",
      icon: MdSecurity,
      current: pathname === "/moderation",
      badge: notifications?.filter((n) => n.type === "moderation" && !n.read)
        .length,
    },
    {
      name: "Analytics",
      href: "/analytics",
      icon: MdAnalytics,
      current: pathname === "/analytics",
    },
  ];

  const handleLogout = () => {
    // This will be handled by the auth system
    router.push("/login");
  };

  return (
    <ProtectedRoute requireVerification={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile sidebar */}
        <div
          className={`fixed inset-0 z-50 lg:hidden ${
            sidebarOpen ? "block" : "hidden"
          }`}
        >
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white dark:bg-gray-800 shadow-xl">
            <AdminSidebar
              navigation={navigation}
              systemHealth={systemHealth}
              user={user}
              onLogout={handleLogout}
              mobile={true}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
          <AdminSidebar
            navigation={navigation}
            systemHealth={systemHealth}
            user={user}
            onLogout={handleLogout}
          />
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          {/* Top navigation bar */}
          <div className="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              {/* Mobile menu button */}
              <button
                type="button"
                className="lg:hidden -m-2 p-2 text-gray-400 hover:text-gray-500"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <MdMenu className="h-6 w-6" />
              </button>

              {/* Right side notifications and user menu */}
              <div className="flex items-center space-x-4">
                {/* Notifications bell */}
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <span className="sr-only">View notifications</span>
                  <MdNotifications className="h-6 w-6" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400" />
                  )}
                </button>

                {/* User avatar */}
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {user?.profile?.name?.[0] || user?.email?.[0] || "A"}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {user?.profile?.name || user?.email || "Admin"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

// Sidebar component
function AdminSidebar({
  navigation,
  systemHealth,
  user,
  onLogout,
  mobile = false,
  onClose,
}) {
  const router = useRouter();

  const handleNavigation = (href) => {
    router.push(href);
    if (mobile && onClose) {
      onClose();
    }
  };

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-800 px-6 pb-4">
      {/* Logo and title */}
      <div className="flex h-16 shrink-0 items-center">
        {mobile && (
          <button
            type="button"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <MdClose className="h-6 w-6" />
          </button>
        )}
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center">
            <HiScale className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              LegalHelp GH
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <button
                    onClick={() => handleNavigation(item.href)}
                    className={`
                      group flex w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                      ${
                        item.current
                          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                          : "text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      }
                    `}
                  >
                    <item.icon className="text-lg" />
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.badge > 0 && (
                      <span className="ml-auto w-5 h-5 text-xs flex items-center justify-center rounded-full bg-red-500 text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </li>

          {/* System Health Status */}
          <li className="mt-auto">
            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  System Status
                </span>
                <div
                  className={`w-2 h-2 rounded-full ${
                    systemHealth?.data?.database?.status === "connected" &&
                    (systemHealth?.data?.redis?.status === "connected" ||
                      systemHealth?.data?.redis?.status === "not_available")
                      ? "bg-green-500 animate-pulse"
                      : "bg-red-500"
                  }`}
                />
              </div>
              <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Database</span>
                  <span
                    className={
                      systemHealth?.data?.database?.status === "connected"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {systemHealth?.data?.database?.status || "Unknown"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cache</span>
                  <span
                    className={
                      systemHealth?.data?.redis?.status === "connected"
                        ? "text-green-600"
                        : systemHealth?.data?.redis?.status === "not_available"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  >
                    {systemHealth?.data?.redis?.status === "not_available"
                      ? "Optional"
                      : systemHealth?.data?.redis?.status || "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </li>

          {/* User info and logout */}
          <li>
            <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900 dark:text-white">
              <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user?.profile?.name?.[0] || user?.email?.[0] || "A"}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs">
                  {user?.profile?.name || user?.email || "Admin"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
              <button
                onClick={onLogout}
                className="p-1 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                title="Logout"
              >
                <MdLogout className="h-4 w-4" />
              </button>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
}

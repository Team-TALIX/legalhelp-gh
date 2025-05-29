"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import ProtectedRoute from "../../components/auth/ProtectedRoute";
import Spinner from "../../components/ui/Spinner";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

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
  if (!user || user.role !== "admin") {
    return null;
  }

  // First apply ProtectedRoute for authentication and verification
  // Then add admin-specific layout
  return (
    <ProtectedRoute requireVerification={true}>
      <div className="admin-layout">
        {/* Admin-specific layout elements could be added here */}
        {children}
      </div>
    </ProtectedRoute>
  );
}

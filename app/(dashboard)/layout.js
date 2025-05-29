"use client";

import ProtectedRoute from "../../components/auth/ProtectedRoute";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute requireVerification={true}>
      <div className="dashboard-layout">
        {/* Dashboard-specific layout elements could be added here */}
        {children}
      </div>
    </ProtectedRoute>
  );
}

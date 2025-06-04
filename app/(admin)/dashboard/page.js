// "use client";

import { Suspense } from "react";
import AdminDashboard from "../../../components/admin/AdminDashboard";
import Spinner from "@/components/ui/Spinner";

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <AdminDashboard />;
    </Suspense>
  );
}

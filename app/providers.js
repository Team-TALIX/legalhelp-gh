"use client";

import { useState, useEffect, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "../hooks/useAuth";
import { ThemeProvider } from "../providers/ThemeProvider";
import Spinner from "@/components/ui/Spinner";

export function Providers({ children }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient()
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering client-only providers on server
  if (!mounted) {
    return (
      <div className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </div>
    );
  }

  return (
    <Suspense fallback={<Spinner />}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Suspense>
  );
}

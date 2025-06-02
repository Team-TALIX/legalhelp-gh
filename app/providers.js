"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "../hooks/useAuth";
import { ThemeProvider } from "../providers/ThemeProvider";

export function Providers({ children }) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
          },
        },
      })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering on server
  if (!mounted) {
    return (
      <div>
        <AuthProvider>{children}</AuthProvider>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          {children}
          {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

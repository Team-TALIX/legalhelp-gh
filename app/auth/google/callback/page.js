"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../../hooks/useAuth"; // Adjust path as necessary
import { storeTokens } from "../../../../lib/auth"; // Adjust path as necessary
import Spinner from "@/components/ui/Spinner";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { initializeAuth, user, isLoading } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      console.log("Received token from Google OAuth callback:", token);
      // Store the token received from the backend.
      // Backend for Google OAuth might only send an access token in this redirect.
      // storeTokens will handle localStorage.
      storeTokens(token, null); // Assuming no separate refresh token from this specific redirect

      // Now that tokens are stored, re-initialize auth state.
      // initializeAuth will read from localStorage, decode token, set user.
      initializeAuth()
        .then(() => {
          // Intentionally not pushing router here immediately.
          // Let the main effect that watches user & isLoading handle redirection.
        })
        .catch((err) => {
          console.error(
            "Error during auth initialization after Google callback:",
            err
          );
          router.push("/login?error=google_auth_processing_failed");
        });
    } else {
      console.error(
        "Google OAuth callback error: No token received in URL parameters."
      );
      router.push("/login?error=google_auth_failed_no_token");
    }
    // initializeAuth is a dependency for its invocation.
    // searchParams is a dependency for token retrieval.
  }, [router, searchParams, initializeAuth]);

  useEffect(() => {
    // This effect runs after initializeAuth has been called and isLoading/user state updates.
    if (!isLoading && user) {
      console.log(
        "User authenticated after Google sign-in, redirecting to dashboard."
      );
      router.push("/dashboard/chat");
    } else if (!isLoading && !user) {
      // This case might happen if initializeAuth fails to set a user despite a token being present initially
      // or if the token was invalid.
      // The previous useEffect already handles routing to login on token error.
      // This is more of a fallback or if initializeAuth clears user due to invalid token.
      console.log(
        "Auth initialization complete, but no user. Redirecting to login."
      );
      // Avoid redirect loop if already on login or if an error was just pushed by the other effect.
      if (!searchParams.get("error")) {
        // Prevent loop if error already set
        router.push("/login?error=google_auth_failed_user_not_set");
      }
    }
    // Dependencies: isLoading and user to react to auth state changes.
  }, [user, isLoading, router, searchParams]);

  return (
    <Suspense fallback={<Spinner />}>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl text-center">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Processing Google Sign-in...
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Please wait while we securely sign you in. You will be redirected
            shortly.
          </p>
          {/* Optional: Add a spinner or loading animation here */}
        </div>
      </div>
    </Suspense>
  );
}

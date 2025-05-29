"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useRouter } from "next/navigation";
import Spinner from "../../../components/ui/Spinner";
import { useAuth } from "../../../hooks/useAuth";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(false); // Separate loading state for page
  const [formError, setFormError] = useState(""); // Separate error state for form
  const router = useRouter();

  const {
    login,
    error: authError,
    clearError: clearAuthError,
    isLoading: authIsLoading,
  } = useAuth();

  useEffect(() => {
    // Clear auth error when component mounts
    if (authError) clearAuthError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Sync authError to formError
    if (authError) {
      setFormError(authError);
      setPageLoading(false); // Ensure page loading is stopped if auth error occurs
    }
  }, [authError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (authError) clearAuthError(); // Clear any previous auth errors
    setPageLoading(true);

    if (!email || !password) {
      setFormError("Please enter both email/phone and password.");
      setPageLoading(false);
      return;
    }

    try {
      // Attempt to login
      const response = await login(email, password);

      if (response.success) {
        router.push("/");
      }
    } catch (err) {
      // error is set by useAuth, which syncs to formError via useEffect
      // setPageLoading(false) is handled by the authError effect or finally block
    } finally {
      setPageLoading(false); // Ensure loading is always stopped
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect to the backend Google OAuth endpoint
    router.push("/api/auth/google");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Sign in to LegalHelp GH
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {formError && (
            <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md text-sm">
              {formError}
            </div>
          )}
          <div className="space-y-4">
            <Input
              label="Email address or Phone number"
              id="email-address"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email address or Phone number"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pageLoading || authIsLoading}
              className="text-sm"
            />
            <Input
              label="Password"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pageLoading || authIsLoading}
              className="text-sm"
              icon={showPassword ? FaEyeSlash : FaEye}
              onIconClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            {/* Future: Remember me checkbox */}
            {/* <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
              <label htmlFor="remember-me" className="ml-2 block text-gray-900 dark:text-gray-300">Remember me</label>
            </div> */}
            <div className="ml-auto">
              <Link
                href="/forgot-password"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={pageLoading || authIsLoading}
              className="w-full text-sm flex justify-center items-center"
              variant="primary"
            >
              {pageLoading || authIsLoading ? <Spinner size="sm" /> : "Sign in"}
            </Button>
          </div>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                Or
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center text-sm"
              disabled={pageLoading || authIsLoading}
            >
              <svg
                className="mr-2 -ml-1 w-4 h-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="google"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 488 512"
              >
                <path
                  fill="currentColor"
                  d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                ></path>
              </svg>
              Sign in with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

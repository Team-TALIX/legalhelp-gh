"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../hooks/useAuth";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    preferredLanguage: "en", // Default to English, or get from a selector if added
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const router = useRouter();
  const {
    register,
    error: authError,
    clearError: clearAuthError,
    isLoading: authIsLoading,
  } = useAuth();

  useEffect(() => {
    // Clear auth error when component mounts
    if (authError) clearAuthError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Clear on mount

  useEffect(() => {
    // Sync authError to formError
    if (authError) {
      setFormError(authError);
      setPageLoading(false); // Ensure page loading is stopped if auth error occurs
    }
  }, [authError]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (authError) clearAuthError();
    setPageLoading(true);

    const { email, phone, password, confirmPassword, preferredLanguage } =
      formData;

    if (!email && !phone) {
      setFormError("Please enter either an email or a phone number.");
      setPageLoading(false);
      return;
    }
    if (!password || !confirmPassword) {
      setFormError("Please enter and confirm your password.");
      setPageLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      setPageLoading(false);
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      setPageLoading(false);
      return;
    }

    try {
      // Construct user data, conditionally including email or phone
      const registrationData = {
        password,
        preferredLanguage,
      };
      if (email) registrationData.email = email;
      if (phone) registrationData.phone = phone;

      // Register the user
      const response = await register(registrationData);

    
      if (response?.success) {
        router.push("/");
      }
    } catch (err) {
      console.error("Registration error:", err);
      // Error is handled by useAuth and synced via useEffect
    } finally {
      setPageLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Redirect to the backend Google OAuth endpoint
    router.push("/api/auth/google"); // Same endpoint for sign-in and sign-up
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 sm:p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create your LegalHelp GH account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              Sign in here
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
              label="Email address (optional)"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email address (optional if phone provided)"
              value={formData.email}
              onChange={handleChange}
              disabled={pageLoading || authIsLoading}
              className="text-sm"
            />
            <Input
              label="Phone number (optional)"
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Phone number (optional if email provided)"
              value={formData.phone}
              onChange={handleChange}
              disabled={pageLoading || authIsLoading}
              className="text-sm"
            />
            <Input
              label="Password (min. 6 characters)"
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Password (min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
              disabled={pageLoading || authIsLoading}
              className="text-sm"
              icon={showPassword ? FaEyeSlash : FaEye}
              onIconClick={() => setShowPassword(!showPassword)}
            />
            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={pageLoading || authIsLoading}
              className="text-sm"
              icon={showConfirmPassword ? FaEyeSlash : FaEye}
              onIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
            {/* Optional: Preferred Language Selector */}
            <div>
              <label
                htmlFor="preferredLanguage"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Preferred Language
              </label>
              <select
                id="preferredLanguage"
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                disabled={pageLoading || authIsLoading}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900 dark:text-white"
              >
                <option value="twi">Twi</option>
                <option value="ewe">Ewe</option>
                <option value="dagbani">Dagbani</option>
                <option value="en">English (Simple)</option>
              </select>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={pageLoading || authIsLoading}
              className="w-full text-sm mt-2 flex justify-center items-center"
              variant="primary"
            >
              {pageLoading || authIsLoading ? (
                <Spinner size="sm" />
              ) : (
                "Create Account"
              )}
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
              onClick={handleGoogleSignUp}
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
              Sign up with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

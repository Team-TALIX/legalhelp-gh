"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../../../components/ui/Button";
import Spinner from "../../../components/ui/Spinner";
import LoadingBar from "../../../components/ui/LoadingBar";
import { useAuth } from "../../../hooks/useAuth";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";

// Using memo for better performance on re-renders
const VerifyEmailPage = memo(function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [verificationStatus, setVerificationStatus] = useState("loading"); // loading, success, error, redirecting
  const [message, setMessage] = useState("");
  const token = searchParams.get("token");

  // Only keep the useAuth hooks that are actually used
  const {
    verifyEmail,
    isPhoneVerified,
    getNextVerificationStep,
    error: authError,
    clearError,
    isLoading: authLoading,
  } = useAuth();

  // Memoize the verification process for better performance
  const processVerification = useCallback(async () => {
    try {
      if (!token) {
        setVerificationStatus("error");
        setMessage("No verification token found in the URL.");
        return;
      }

      const response = await verifyEmail(token);
      if (response.success) {
        setVerificationStatus("success");
        setMessage("Your email has been successfully verified!");
        // No need to call getVerificationStatus() here as verifyEmail already updates the user state
      } else {
        setVerificationStatus("error");
        setMessage(response.message || "Email verification failed.");
      }
    } catch (error) {
      console.error("Email verification error:", error);
      setVerificationStatus("error");
      setMessage(
        authError ||
          error.message ||
          "Email verification failed. The token may be invalid or expired."
      );
    }
  }, [token, verifyEmail, authError]);

  useEffect(() => {
    // Clear any previous errors
    clearError();

    // Start verification process
    processVerification();
  }, [clearError, processVerification]);

  // Handle redirection after successful verification
  useEffect(() => {
    if (verificationStatus === "success") {
      // Give user time to see the success message before redirecting
      const redirectTimer = setTimeout(() => {
        const nextStep = getNextVerificationStep();
        if (nextStep) {
          setVerificationStatus("redirecting");
          setMessage(`You'll be redirected to the next step in a moment...`);

          // Redirect after a slight delay
          setTimeout(() => {
            router.push(nextStep.path);
          }, 1500);
        }
      }, 3000);

      return () => clearTimeout(redirectTimer);
    }
  }, [verificationStatus, getNextVerificationStep, router]);

  // Memoize render content to prevent re-renders
  const renderContent = useCallback(() => {
    switch (verificationStatus) {
      case "loading":
        return (
          <div className="flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Verifying your email...
            </p>
          </div>
        );
      case "success":
        return (
          <div className="flex flex-col items-center">
            <FaCheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              {message}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isPhoneVerified() ? (
                <Button
                  variant="primary"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={() => {
                    const nextStep = getNextVerificationStep();
                    router.push(nextStep?.path || "/dashboard");
                  }}
                >
                  Continue to Phone Verification
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push("/")}>
                Go to Homepage
              </Button>
            </div>
          </div>
        );
      case "redirecting":
        return (
          <div className="flex flex-col items-center">
            <FaCheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              {message}
            </p>
            <div className="w-full">
              <LoadingBar progress={70} />
            </div>
          </div>
        );
      case "error":
        return (
          <div className="flex flex-col items-center">
            <FaTimesCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              {message}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/verify/resend">
                <Button variant="primary">Resend Verification</Button>
              </Link>
              <Button variant="outline" onClick={() => router.push("/login")}>
                Go to Login
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [
    verificationStatus,
    message,
    isPhoneVerified,
    getNextVerificationStep,
    router,
  ]);

  // Prevent unnecessary re-renders when authLoading changes
  if (authLoading && verificationStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-4">
              <FaEnvelope className="h-10 w-10 text-primary-600 dark:text-primary-300" />
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Verifying your email...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-4">
            <FaEnvelope className="h-10 w-10 text-primary-600 dark:text-primary-300" />
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  );
});

export default VerifyEmailPage;

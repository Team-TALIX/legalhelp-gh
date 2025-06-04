"use client";

import { useState, useEffect, useCallback, memo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Spinner from "../../../components/ui/Spinner";
import LoadingBar from "../../../components/ui/LoadingBar";
import { useAuth } from "../../../hooks/useAuth";
import { FaCheckCircle, FaTimesCircle, FaMobile, FaRedo } from "react-icons/fa";

const VerifyPhonePage = memo(function VerifyPhonePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState("input"); // input, loading, success, error, redirecting
  const [message, setMessage] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  
  // Only keep the useAuth hooks that are actually used
  const {
    verifyPhone,
    sendPhoneVerification,
    isFullyVerified,
    error: authError,
    clearError,
    isLoading: authLoading,
  } = useAuth();

  // Check if phone was passed in URL
  useEffect(() => {
    const phoneParam = searchParams.get("phone");
    if (phoneParam) {
      setPhone(phoneParam);
    }

    // Clear any previous errors on mount
    clearError();
  }, [searchParams, clearError]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Memoize handlers to prevent recreating functions on every render
  const handleCodeChange = useCallback((e) => {
    // Only allow digits and limit to 6 characters
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
  }, []);

  const handlePhoneChange = useCallback((e) => {
    setPhone(e.target.value);
  }, []);

  const handleVerifyPhone = useCallback(async () => {
    if (!phone) {
      setMessage("Please enter your phone number.");
      return;
    }
    if (!code || code.length !== 6) {
      setMessage("Please enter the 6-digit verification code.");
      return;
    }

    setVerificationStatus("loading");
    setMessage("");

    try {
      const response = await verifyPhone(phone, code);
      if (response.success) {
        setVerificationStatus("success");
        setMessage("Your phone number has been successfully verified!");

        // If user is now fully verified, we'll redirect to dashboard
        if (isFullyVerified()) {
          setTimeout(() => {
            setVerificationStatus("redirecting");
            setMessage(
              "Verification complete! Redirecting to your dashboard..."
            );

            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);
          }, 2000);
        }
      } else {
        setVerificationStatus("error");
        setMessage(response.message || "Phone verification failed.");
      }
    } catch (error) {
      console.error("Phone verification error:", error);
      setVerificationStatus("error");
      setMessage(
        authError ||
          error.message ||
          "Phone verification failed. The code may be invalid or expired."
      );
    }
  }, [phone, code, verifyPhone, isFullyVerified, router, authError]);

  const handleResendVerificationCode = useCallback(async () => {
    if (!phone) {
      setMessage("Please enter your phone number.");
      return;
    }

    setIsResending(true);
    setMessage("");

    try {
      const response = await sendPhoneVerification(phone);
      if (response.success) {
        setMessage("A new verification code has been sent to your phone.");
        setCountdown(60); // 60 seconds cooldown
      } else {
        setMessage(response.message || "Failed to resend verification code.");
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setMessage(
        authError ||
          error.message ||
          "Failed to resend verification code. Please try again later."
      );
    } finally {
      setIsResending(false);
    }
  }, [phone, sendPhoneVerification, authError]);

  // Memoize the content rendering to prevent unnecessary re-renders
  const renderContent = useCallback(() => {
    switch (verificationStatus) {
      case "input":
        return (
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Verify Your Phone Number
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              Enter the 6-digit code sent to your phone.
            </p>
            {message && (
              <div className="p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 rounded-md text-sm mb-4 w-full">
                {message}
              </div>
            )}
            <div className="w-full space-y-4 mb-6">
              <Input
                label="Phone Number"
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={handlePhoneChange}
                required
              />
              <Input
                label="Verification Code"
                id="code"
                name="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={handleCodeChange}
                required
                maxLength={6}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button
                variant="primary"
                onClick={handleVerifyPhone}
                className="flex-1"
                disabled={authLoading || isResending}
              >
                {authLoading ? <Spinner size="sm" /> : "Verify Code"}
              </Button>
              <Button
                variant="outline"
                onClick={handleResendVerificationCode}
                disabled={countdown > 0 || isResending || authLoading}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {isResending ? (
                  <Spinner size="sm" />
                ) : countdown > 0 ? (
                  `Resend in ${countdown}s`
                ) : (
                  <>
                    <FaRedo size={14} />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
          </div>
        );
      case "loading":
        return (
          <div className="flex flex-col items-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Verifying your phone number...
            </p>
          </div>
        );
      case "success":
        return (
          <div className="flex flex-col items-center">
            <FaCheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Phone Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              {message}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="primary"
                onClick={() => router.push("/dashboard")}
              >
                Go to Dashboard
              </Button>
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
              Phone Verified!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
              {message}
            </p>
            <div className="w-full">
              <LoadingBar progress={100} />
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
              <Button
                variant="outline"
                onClick={() => setVerificationStatus("input")}
              >
                Try Again
              </Button>
              <Button variant="primary" onClick={() => router.push("/login")}>
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
    phone,
    code,
    countdown,
    authLoading,
    isResending,
    handlePhoneChange,
    handleCodeChange,
    handleVerifyPhone,
    handleResendVerificationCode,
    router,
  ]);

  return (
    <Suspense fallback={<Spinner />}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-primary-100 dark:bg-primary-900 p-4">
              <FaMobile className="h-10 w-10 text-primary-600 dark:text-primary-300" />
            </div>
          </div>
          
            {renderContent()}
          
        </div>
      </div>
    </Suspense>
  );
});

export default VerifyPhonePage;
"use client";

import { useState, useEffect, useCallback, memo, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Spinner from "../../../components/ui/Spinner";
import { useAuth } from "../../../hooks/useAuth";
import { FaEnvelope, FaMobile, FaCheckCircle } from "react-icons/fa";

const ResendVerificationPage = memo(function ResendVerificationPage() {
  const router = useRouter();
  const [verificationMethod, setVerificationMethod] = useState("email"); // email or phone
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success or error
  const [verificationSent, setVerificationSent] = useState(false);

  // Extract only what we need from useAuth to prevent unnecessary re-renders
  const {
    sendEmailVerification,
    sendPhoneVerification,
    isEmailVerified,
    isPhoneVerified,
    verificationState,
    error: authError,
    isLoading: authLoading,
    clearError,
    user,
  } = useAuth();

  // Check if user has existing verification state to pre-populate
  useEffect(() => {
    // Clear any previous errors
    clearError();

    // Pre-populate email or phone if available from user state
    if (user) {
      if (user.email && !isEmailVerified()) {
        setEmail(user.email);
      }

      if (verificationState.lastPhoneSentTo && !isPhoneVerified()) {
        setPhone(verificationState.lastPhoneSentTo);
      }
    }
  }, [user, isEmailVerified, isPhoneVerified, verificationState, clearError]);

  // Memoize handlers for better performance
  const handleVerificationMethodChange = useCallback((method) => {
    setVerificationMethod(method);
    setMessage("");
    setMessageType("");
    setVerificationSent(false);
  }, []);

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);

  const handlePhoneChange = useCallback((e) => {
    setPhone(e.target.value);
  }, []);

  const handleResendVerification = useCallback(async () => {
    setMessage("");
    setMessageType("");

    try {
      if (verificationMethod === "email") {
        if (!email) {
          setMessage("Please enter your email address.");
          setMessageType("error");
          return;
        }

        const response = await sendEmailVerification(email);

        if (response.success) {
          setMessageType("success");
          setMessage(
            "Verification email sent! Please check your inbox and follow the instructions."
          );
          setVerificationSent(true);
        } else {
          setMessageType("error");
          setMessage(response.message || "Failed to send verification email.");
        }
      } else {
        // Phone verification
        if (!phone) {
          setMessage("Please enter your phone number.");
          setMessageType("error");
          return;
        }

        const response = await sendPhoneVerification(phone);

        if (response.success) {
          setMessageType("success");
          setMessage(
            "Verification code sent! Check your phone for the 6-digit code."
          );
          setVerificationSent(true);
          // Redirect to phone verification page
          router.push(`/verify/phone?phone=${encodeURIComponent(phone)}`);
        } else {
          setMessageType("error");
          setMessage(response.message || "Failed to send verification code.");
        }
      }
    } catch (error) {
      console.error("Resend verification error:", error);
      setMessageType("error");
      setMessage(
        authError ||
          error.message ||
          `Failed to send verification ${
            verificationMethod === "email" ? "email" : "code"
          }. Please try again later.`
      );
    }
  }, [
    verificationMethod,
    email,
    phone,
    sendEmailVerification,
    sendPhoneVerification,
    authError,
    router,
  ]);

  return (
    <Suspense fallback={<Spinner />}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Resend Verification
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Request a new verification email or SMS code
            </p>
          </div>

          <div className="flex mb-6 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
              className={`flex-1 py-2 px-4 focus:outline-none transition-colors ${
                verificationMethod === "email"
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleVerificationMethodChange("email")}
            >
              <div className="flex items-center justify-center gap-2">
                <FaEnvelope />
                <span>Email</span>
              </div>
            </button>
            <button
              className={`flex-1 py-2 px-4 focus:outline-none transition-colors ${
                verificationMethod === "phone"
                  ? "bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
              onClick={() => handleVerificationMethodChange("phone")}
            >
              <div className="flex items-center justify-center gap-2">
                <FaMobile />
                <span>Phone</span>
              </div>
            </button>
          </div>

          {message && (
            <div
              className={`p-3 mb-4 rounded-md text-sm ${
                messageType === "success"
                  ? "bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-200"
                  : "bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200"
              }`}
            >
              {message}
            </div>
          )}

          <div className="space-y-4">
            {verificationMethod === "email" ? (
              <>
                <Input
                  label="Email Address"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={authLoading || verificationSent}
                  required
                />
                {verificationSent && (
                  <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                    <FaCheckCircle />
                    <span>Verification email sent!</span>
                  </div>
                )}
              </>
            ) : (
              <Input
                label="Phone Number"
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={handlePhoneChange}
                disabled={authLoading}
                required
              />
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <Button
              variant="primary"
              onClick={handleResendVerification}
              disabled={
                authLoading ||
                (verificationMethod === "email" && verificationSent)
              }
              className="w-full flex justify-center items-center"
            >
              {authLoading ? (
                <Spinner size="sm" />
              ) : (
                `Send Verification ${
                  verificationMethod === "email" ? "Email" : "Code"
                }`
              )}
            </Button>

            <div className="flex justify-between">
              <Link href="/login">
                <Button variant="text" size="sm">
                  Back to Login
                </Button>
              </Link>
              {verificationMethod === "phone" && verificationSent && (
                <Link href={`/verify/phone?phone=${encodeURIComponent(phone)}`}>
                  <Button variant="text" size="sm">
                    Enter Verification Code
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
});

export default ResendVerificationPage;

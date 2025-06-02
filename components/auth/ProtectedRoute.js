"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../hooks/useAuth";
import Spinner from "../ui/Spinner";

export default function ProtectedRoute({
  children,
  requireVerification = true,
}) {
  const router = useRouter();
  const { user, isLoading, isVerificationRequired, getNextVerificationStep } =
    useAuth();

  useEffect(() => {
    if (!isLoading) {
      // Not logged in - redirect to login
      if (!user) {
        router.push("/login");
        return;
      }

      // Verification required but user not verified - redirect to verification
      if (requireVerification && isVerificationRequired()) {
        const nextStep = getNextVerificationStep();
        if (nextStep) {
          router.push(nextStep.path);
          return;
        }
      }
    }
  }, [
    user,
    isLoading,
    requireVerification,
    isVerificationRequired,
    getNextVerificationStep,
    router,
  ]);
  console.log(user)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // Don't render anything if not authenticated
  if (!user) {
    return null;
  }

  // Don't render if verification is required but user is not verified
  if (requireVerification && isVerificationRequired()) {
    return null;
  }

  return children;
}

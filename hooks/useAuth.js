"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  storeTokens,
  getAccessToken,
  getRefreshToken,
  removeTokens,
  getUserFromToken,
  isTokenExpired,
} from "../lib/auth";
import apiClient from "../lib/api"; // Import the configured apiClient

// Cache verification status with timestamps to avoid excessive calls
const VERIFICATION_CACHE_DURATION = 60 * 1000; // 1 minute cache

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [verificationState, setVerificationState] = useState({
    emailVerificationSent: false,
    phoneVerificationSent: false,
    lastEmailSentTo: null,
    lastPhoneSentTo: null,
    lastVerificationCheck: null,
    verificationRequestInProgress: false,
  });

  // Mark as mounted to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  const initializeAuth = useCallback(async () => {
    if (!mounted) return;

    setIsLoading(true);
    setError(null);
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (accessToken && !isTokenExpired(accessToken)) {
      const userData = getUserFromToken(accessToken);
      setUser(userData);
    } else if (refreshToken && !isTokenExpired(refreshToken)) {
      try {
        const response = await apiClient.post("/auth/refresh", {
          refreshToken,
        });
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
          response.data;
        storeTokens(newAccessToken, newRefreshToken);
        const userData = getUserFromToken(newAccessToken);
        setUser(userData);
      } catch (refreshError) {
        console.error("Initial token refresh failed:", refreshError);
        removeTokens();
        setUser(null);
        setError("Session expired. Please login again.");
      }
    } else {
      removeTokens();
      setUser(null);
    }
    setIsLoading(false);
  }, [mounted]);

  useEffect(() => {
    if (mounted) {
      initializeAuth();
    }
  }, [initializeAuth, mounted]);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      const { user: loggedInUser, accessToken, refreshToken } = response.data;
      storeTokens(accessToken, refreshToken);
      setUser(loggedInUser);
      setIsLoading(false);
      return response.data;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
      removeTokens();
      setUser(null);
      setIsLoading(false);
      throw new Error(errorMessage);
    }
  }, []);

  const register = useCallback(
    async (userData) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.post("/auth/register", userData);
        const {
          user: registeredUser,
          accessToken,
          refreshToken,
        } = response.data;
        // storeTokens(accessToken, refreshToken);
        // setUser(registeredUser);

        // Since backend auto-sends verification, update verificationState accordingly
        let newVerificationStateUpdate = {};
        if (registeredUser.email) {
          newVerificationStateUpdate.lastEmailSentTo = registeredUser.email;
          newVerificationStateUpdate.emailVerificationSent = true; // Assume backend sent it
        }
        if (registeredUser.phone) {
          newVerificationStateUpdate.lastPhoneSentTo = registeredUser.phone;
          newVerificationStateUpdate.phoneVerificationSent = true; // Assume backend sent it
        }
        if (Object.keys(newVerificationStateUpdate).length > 0) {
          setVerificationState((prev) => ({
            ...prev,
            ...newVerificationStateUpdate,
          }));
        }

        setIsLoading(false);
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message ||
          "Registration failed. Please try again.";
        setError(errorMessage);
        setIsLoading(false);
        throw new Error(errorMessage);
      }
    },
    [setIsLoading, setError, setVerificationState]
  ); // Added dependencies

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post("/auth/logout");
    } catch (logoutError) {
      console.error("Backend logout failed (non-critical):", logoutError);
    }
    removeTokens();
    setUser(null);
    setVerificationState({
      // Reset fully
      emailVerificationSent: false,
      phoneVerificationSent: false,
      lastEmailSentTo: null,
      lastPhoneSentTo: null,
      lastVerificationCheck: null,
      verificationRequestInProgress: false,
    });
    setIsLoading(false);
  }, [setIsLoading, setError, setUser, setVerificationState]); // Added dependencies

  const isEmailVerified = useCallback(
    () => !!user?.isEmailVerified,
    [user?.isEmailVerified]
  );
  const isPhoneVerified = useCallback(
    () => !!user?.isPhoneVerified,
    [user?.isPhoneVerified]
  );
  const isFullyVerified = useCallback(
    () => !!user?.isVerified,
    [user?.isVerified]
  );

  const isVerificationRequired = useCallback(() => {
    if (!user || user.isAnonymous) return false;
    return !isFullyVerified();
  }, [user, isFullyVerified]);

  const getNextVerificationStep = useCallback(() => {
    if (!user || isFullyVerified()) return null;

    if (user.email && !isEmailVerified()) {
      return {
        type: "email",
        path:
          verificationState.emailVerificationSent &&
          user.email === verificationState.lastEmailSentTo
            ? `/verify/email?email=${encodeURIComponent(user.email)}`
            : "/verify/resend",
        message: "Please verify your email address to continue.",
        identifier: user.email,
      };
    }

    if (user.phone && !isPhoneVerified()) {
      return {
        type: "phone",
        path:
          verificationState.phoneVerificationSent &&
          user.phone === verificationState.lastPhoneSentTo
            ? `/verify/phone?phone=${encodeURIComponent(user.phone)}`
            : "/verify/resend",
        message: "Please verify your phone number to continue.",
        identifier: user.phone,
      };
    }

    if (!user.email && !user.phone) {
      return {
        type: "add_contact_method",
        path: "/profile",
        message:
          "Please add an email or phone number to your profile to verify your account.",
      };
    }

    return {
      type: "resend",
      path: "/verify/resend",
      message: "Please complete your account verification.",
    };
  }, [
    user,
    isEmailVerified,
    isPhoneVerified,
    isFullyVerified,
    verificationState.emailVerificationSent,
    verificationState.phoneVerificationSent,
    verificationState.lastEmailSentTo,
    verificationState.lastPhoneSentTo,
  ]);

  const shouldRedirectToVerification = useCallback(() => {
    // This specific function might be less critical if ProtectedRoute handles all redirection logic
    // based on isVerificationRequired and getNextVerificationStep.
    // However, keeping it for now, aligned with the new logic.
    if (!user || user.isAnonymous || isFullyVerified()) return false;

    // If verification is required, and we haven't recently TRIED to send a verification for the current methods.
    if (
      user.email &&
      !isEmailVerified() &&
      !verificationState.emailVerificationSent
    )
      return true;
    if (
      user.phone &&
      !isPhoneVerified() &&
      !verificationState.phoneVerificationSent
    )
      return true;

    return false;
  }, [
    user,
    isFullyVerified,
    isEmailVerified,
    isPhoneVerified,
    verificationState.emailVerificationSent,
    verificationState.phoneVerificationSent,
  ]);

  const sendEmailVerification = useCallback(
    async (email) => {
      if (verificationState.verificationRequestInProgress)
        return {
          success: false,
          message: "Verification request already in progress",
        };
      setIsLoading(true);
      setError(null);
      setVerificationState((prev) => ({
        ...prev,
        verificationRequestInProgress: true,
      }));
      try {
        const response = await apiClient.post("/verification/email/send", {
          email,
        });
        if (response.data.success) {
          setVerificationState((prev) => ({
            ...prev,
            emailVerificationSent: true,
            lastEmailSentTo: email,
            verificationRequestInProgress: false,
          }));
        } else {
          setVerificationState((prev) => ({
            ...prev,
            verificationRequestInProgress: false,
          }));
        }
        setIsLoading(false);
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to send verification email.";
        setError(errorMessage);
        setIsLoading(false);
        setVerificationState((prev) => ({
          ...prev,
          verificationRequestInProgress: false,
        }));
        throw new Error(errorMessage);
      }
    },
    [verificationState.verificationRequestInProgress]
  );

  const sendPhoneVerification = useCallback(
    async (phone) => {
      if (verificationState.verificationRequestInProgress)
        return {
          success: false,
          message: "Verification request already in progress",
        };
      setIsLoading(true);
      setError(null);
      setVerificationState((prev) => ({
        ...prev,
        verificationRequestInProgress: true,
      }));
      try {
        const response = await apiClient.post("/verification/phone/send", {
          phone,
        });
        if (response.data.success) {
          setVerificationState((prev) => ({
            ...prev,
            phoneVerificationSent: true,
            lastPhoneSentTo: phone,
            verificationRequestInProgress: false,
          }));
        } else {
          setVerificationState((prev) => ({
            ...prev,
            verificationRequestInProgress: false,
          }));
        }
        setIsLoading(false);
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Failed to send verification code.";
        setError(errorMessage);
        setIsLoading(false);
        setVerificationState((prev) => ({
          ...prev,
          verificationRequestInProgress: false,
        }));
        throw new Error(errorMessage);
      }
    },
    [verificationState.verificationRequestInProgress]
  );

  const verifyEmail = useCallback(
    async (token) => {
      if (verificationState.verificationRequestInProgress)
        return {
          success: false,
          message: "Verification request already in progress",
        };
      setIsLoading(true);
      setError(null);
      setVerificationState((prev) => ({
        ...prev,
        verificationRequestInProgress: true,
      }));
      try {
        const response = await apiClient.post("/verification/email/verify", {
          token,
        });
        if (response.data.success && response.data.user) {
          setUser(response.data.user); // CRITICAL: Update user state from backend response
          setVerificationState((prev) => ({
            ...prev,
            emailVerificationSent: false,
            lastVerificationCheck: Date.now(),
            verificationRequestInProgress: false,
          }));
        } else {
          setVerificationState((prev) => ({
            ...prev,
            verificationRequestInProgress: false,
          }));
        }
        setIsLoading(false);
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Email verification failed.";
        setError(errorMessage);
        setIsLoading(false);
        setVerificationState((prev) => ({
          ...prev,
          verificationRequestInProgress: false,
        }));
        throw new Error(errorMessage);
      }
    },
    [verificationState.verificationRequestInProgress]
  );

  const verifyPhone = useCallback(
    async (phone, code) => {
      if (verificationState.verificationRequestInProgress)
        return {
          success: false,
          message: "Verification request already in progress",
        };
      setIsLoading(true);
      setError(null);
      setVerificationState((prev) => ({
        ...prev,
        verificationRequestInProgress: true,
      }));
      try {
        const response = await apiClient.post("/verification/phone/verify", {
          phone,
          code,
        });
        if (response.data.success && response.data.user) {
          setUser(response.data.user); // CRITICAL: Update user state from backend response
          setVerificationState((prev) => ({
            ...prev,
            phoneVerificationSent: false,
            lastVerificationCheck: Date.now(),
            verificationRequestInProgress: false,
          }));
        } else {
          setVerificationState((prev) => ({
            ...prev,
            verificationRequestInProgress: false,
          }));
        }
        setIsLoading(false);
        return response.data;
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || "Phone verification failed.";
        setError(errorMessage);
        setIsLoading(false);
        setVerificationState((prev) => ({
          ...prev,
          verificationRequestInProgress: false,
        }));
        throw new Error(errorMessage);
      }
    },
    [verificationState.verificationRequestInProgress]
  );

  const getVerificationStatus = useCallback(
    async (force = false) => {
      const now = Date.now();
      if (
        !force &&
        verificationState.lastVerificationCheck &&
        now - verificationState.lastVerificationCheck <
          VERIFICATION_CACHE_DURATION
      ) {
        return {
          success: true,
          verification: {
            isEmailVerified: user?.isEmailVerified,
            isPhoneVerified: user?.isPhoneVerified,
            isVerified: user?.isVerified,
          },
        };
      }
      if (verificationState.verificationRequestInProgress)
        return {
          success: false,
          message: "Verification status check already in progress",
        };
      setIsLoading(true);
      setVerificationState((prev) => ({
        ...prev,
        verificationRequestInProgress: true,
      }));
      try {
        const response = await apiClient.get("/verification/status");
        if (response.data.success && response.data.verification) {
          setUser((prevUser) => ({
            ...prevUser,
            isEmailVerified: response.data.verification.isEmailVerified,
            isPhoneVerified: response.data.verification.isPhoneVerified,
            isVerified: response.data.verification.isVerified,
          }));
          setVerificationState((prev) => ({
            ...prev,
            lastVerificationCheck: now,
            verificationRequestInProgress: false,
          }));
        } else {
          setVerificationState((prev) => ({
            ...prev,
            verificationRequestInProgress: false,
          }));
        }
        setIsLoading(false);
        return response.data;
      } catch (err) {
        console.error(
          "Get verification status failed:",
          err.response?.data?.message || err.message
        );
        setIsLoading(false);
        setVerificationState((prev) => ({
          ...prev,
          verificationRequestInProgress: false,
        }));
        return { success: false, error: err.message };
      }
    },
    [
      user,
      verificationState.lastVerificationCheck,
      verificationState.verificationRequestInProgress,
    ]
  );

  const resendVerification = useCallback(
    async (type, identifier) => {
      if (type === "email") return await sendEmailVerification(identifier);
      if (type === "phone") return await sendPhoneVerification(identifier);
      throw new Error("Invalid verification type");
    },
    [sendEmailVerification, sendPhoneVerification]
  );

  const startVerificationProcess = useCallback(async () => {
    if (user && !user.isAnonymous && !isFullyVerified()) {
      await getVerificationStatus(true); // Force a refresh of status first
      // After status refresh, user object will be updated.
      // The actual sending logic might be better initiated by UI components based on getNextVerificationStep
      // For example, if getNextVerificationStep() returns an email step, the UI can offer to send/resend.
      // Automatically sending here might be too aggressive without user interaction.
      const nextStep = getNextVerificationStep();
      if (
        nextStep &&
        nextStep.type === "email" &&
        user.email &&
        !verificationState.emailVerificationSent
      ) {
        // console.log("Attempting to auto-send email verification via startVerificationProcess");
        // await sendEmailVerification(user.email); // Consider if this auto-send is desired
      } else if (
        nextStep &&
        nextStep.type === "phone" &&
        user.phone &&
        !verificationState.phoneVerificationSent
      ) {
        // console.log("Attempting to auto-send phone verification via startVerificationProcess");
        // await sendPhoneVerification(user.phone); // Consider if this auto-send is desired
      }
    }
  }, [
    user,
    isFullyVerified,
    getVerificationStatus,
    getNextVerificationStep,
    verificationState.emailVerificationSent,
    verificationState.phoneVerificationSent,
  ]); // Added getNextVerificationStep

  const clearError = useCallback(() => setError(null), []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      error,
      login,
      register,
      logout,
      initializeAuth,
      clearError,
      sendEmailVerification,
      sendPhoneVerification,
      verifyEmail,
      verifyPhone,
      getVerificationStatus,
      resendVerification,
      startVerificationProcess,
      isEmailVerified,
      isPhoneVerified,
      isFullyVerified,
      isVerificationRequired,
      shouldRedirectToVerification,
      getNextVerificationStep,
      verificationState,
    }),
    [
      user,
      isLoading,
      error,
      login,
      register,
      logout,
      initializeAuth,
      clearError,
      sendEmailVerification,
      sendPhoneVerification,
      verifyEmail,
      verifyPhone,
      getVerificationStatus,
      resendVerification,
      startVerificationProcess,
      isEmailVerified,
      isPhoneVerified,
      isFullyVerified,
      isVerificationRequired,
      shouldRedirectToVerification,
      getNextVerificationStep,
      verificationState,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

"use client";

import Spinner from "@/components/ui/Spinner";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";

export default function ProfilePage() {
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Simulate construction progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 20; // Reset to 20% when it reaches 100%
        return prev + Math.random() * 10;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <Suspense fallback={<Spinner />}>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 dark:opacity-10">
          <div className="absolute top-20 left-20 w-4 h-4 bg-orange-400 rounded-full"></div>
          <div className="absolute top-40 right-32 w-2 h-2 bg-yellow-400 rounded-full"></div>
          <div className="absolute bottom-32 left-40 w-3 h-3 bg-orange-500 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-5 h-5 bg-amber-400 rounded-full"></div>
          <div className="absolute top-60 left-1/2 w-2 h-2 bg-yellow-500 rounded-full"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Construction Icon */}
          <div className="mb-8 relative">
            <div className="inline-block relative">
              {/* Hard Hat */}
              <svg
                className="w-24 h-24 md:w-32 md:h-32 text-orange-500 mx-auto animate-bounce"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 1L3 8V16C3 18.21 4.79 20 7 20H17C19.21 20 21 18.21 21 16V8L12 1ZM12 3.27L19 8.54V16C19 17.1 18.1 18 17 18H7C5.9 18 5 17.1 5 16V8.54L12 3.27Z" />
                <path d="M12 6C10.34 6 9 7.34 9 9V13C9 14.66 10.34 16 12 16S15 14.66 15 13V9C15 7.34 13.66 6 12 6ZM13 13C13 13.55 12.55 14 12 14S11 13.55 11 13V9C11 8.45 11.45 8 12 8S13 8.45 13 9V13Z" />
              </svg>

              {/* Rotating Gear */}
              <div className="absolute -top-2 -right-2">
                <svg
                  className="w-8 h-8 text-yellow-500 animate-spin"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V15L19.5 14.5C19.3 14.7 19.1 14.9 18.9 15.1L19.5 16.5L16.5 19.5L15.1 18.9C14.9 19.1 14.7 19.3 14.5 19.5L15 21H9L9.5 19.5C9.3 19.3 9.1 19.1 8.9 18.9L7.5 19.5L4.5 16.5L5.1 15.1C4.9 14.9 4.7 14.7 4.5 14.5L3 15V9L4.5 9.5C4.7 9.3 4.9 9.1 5.1 8.9L4.5 7.5L7.5 4.5L8.9 5.1C9.1 4.9 9.3 4.7 9.5 4.5L9 3H15L14.5 4.5C14.7 4.7 14.9 4.9 15.1 5.1L16.5 4.5L19.5 7.5L18.9 8.9C19.1 9.1 19.3 9.3 19.5 9.5L21 9ZM12 8C14.2 8 16 9.8 16 12S14.2 16 12 16 8 14.2 8 12 9.8 8 12 8Z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-black text-gray-800 dark:text-white mb-4">
              Under Construction
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-orange-400 to-yellow-400 mx-auto rounded-full"></div>
          </div>

          {/* Description */}
          <div className="mb-10 space-y-4">
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium">
              We are building something amazing!
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Our team is working hard to bring you an incredible experience.
              This page is currently under development and will be available
              soon.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-10 max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Progress
              </span>
              <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full transition-all duration-1000 ease-out relative"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Features Coming Soon */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              What is Coming Soon
            </h3>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Fast Performance
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Lightning-fast loading times and smooth interactions
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  User-Friendly
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Intuitive design that puts user experience first
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <svg
                    className="w-6 h-6 text-orange-600 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                  Reliable
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Built with modern technology for maximum reliability
                </p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/"
                className="group inline-flex items-center justify-center px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                <svg
                  className="w-5 h-5 mr-2 transition-transform group-hover:-translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
                Back to Home
              </Link>

              <Link
                href="/contact"
                className="group inline-flex items-center justify-center px-8 py-3 border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Get Notified
              </Link>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Expected completion:{" "}
              <span className="font-semibold text-orange-600 dark:text-orange-400">
                Coming Soon
              </span>
            </p>
          </div>

          {/* Animated Construction Tools */}
          <div className="absolute bottom-10 left-10 hidden lg:block">
            <div className="flex space-x-4 opacity-20">
              <svg
                className="w-8 h-8 text-orange-400 animate-pulse"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M13.78 15.3L19.78 21.3L21.89 19.14L15.89 13.14L13.78 15.3ZM17.5 10.1C17.11 10.1 16.69 10.05 16.36 9.91L4.97 21.25L2.86 19.14L10.27 11.74C8.5 10.3 8.5 7.7 10.27 6.26C12.04 4.82 14.96 4.82 16.73 6.26C18.5 7.7 18.5 10.3 16.73 11.74C16.4 11.88 16.02 11.93 15.63 11.93C15.24 11.93 14.86 11.88 14.53 11.74L13.78 15.3L17.5 10.1Z" />
              </svg>
              <svg
                className="w-8 h-8 text-yellow-400 animate-pulse delay-500"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22.7 19L13.6 9.9C14.5 7.6 14 4.9 12.1 3C10.1 1 7.1 0.6 4.7 1.7L9 6L6 9L1.6 4.7C0.4 7.1 0.9 10.1 2.9 12.1C4.8 14 7.5 14.5 9.8 13.6L18.9 22.7C19.3 23.1 19.9 23.1 20.3 22.7L22.6 20.4C23.1 20 23.1 19.3 22.7 19Z" />
              </svg>
            </div>
          </div>

          <div className="absolute bottom-10 right-10 hidden lg:block">
            <div className="flex space-x-4 opacity-20">
              <svg
                className="w-8 h-8 text-orange-400 animate-pulse delay-1000"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
}

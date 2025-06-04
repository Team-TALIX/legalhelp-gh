"use client";

import { Suspense } from "react";
import Link from "next/link";
import Button from "../../components/ui/Button";
import { useRouter } from "next/navigation";
import { FaLock, FaHome, FaSignInAlt } from "react-icons/fa";
import Spinner from "@/components/ui/Spinner";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <Suspense fallback={<Spinner />}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-100 dark:bg-red-900 p-4">
              <FaLock className="h-10 w-10 text-red-600 dark:text-red-300" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Access Restricted
          </h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">
            You do not have permission to access this area. This might be
            because:
          </p>
          <ul className="text-left text-gray-600 dark:text-gray-400 mb-8 space-y-2 list-disc pl-5">
            <li>You need to be logged in</li>
            <li>Your account requires verification</li>
            <li>You do not have the required role or permissions</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              className="flex items-center justify-center gap-2"
              onClick={() => router.push("/login")}
            >
              <FaSignInAlt />
              Sign In
            </Button>
            <Button
              variant="outline"
              className="flex items-center justify-center gap-2"
              onClick={() => router.push("/")}
            >
              <FaHome />
              Go to Homepage
            </Button>
          </div>
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            If you believe this is an error, please{" "}
            <Link
              href="/contact"
              className="text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
            >
              contact support
            </Link>
            .
          </div>
        </div>
      </div>
    </Suspense>
  );
}

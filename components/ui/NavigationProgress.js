"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import LoadingBar from "./LoadingBar";

export default function NavigationProgress() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Mark as mounted to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset progress and show loading bar when navigation starts
  useEffect(() => {
    if (!mounted) return;

    // Show initial loading bar on first page load
    const initialLoad = () => {
      setLoading(true);
      setProgress(20);

      // Simulate progress steps
      const timer1 = setTimeout(() => setProgress(40), 200);
      const timer2 = setTimeout(() => setProgress(60), 500);
      const timer3 = setTimeout(() => setProgress(80), 800);
      const timer4 = setTimeout(() => {
        setProgress(100);
        setTimeout(() => setLoading(false), 200);
      }, 1000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    };

    initialLoad();
  }, [pathname, searchParams, mounted]);

  if (!mounted || !loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <LoadingBar progress={progress} />
    </div>
  );
}

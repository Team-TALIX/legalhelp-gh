"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState("system");
  const [resolvedTheme, setResolvedTheme] = useState("light");
  const [mounted, setMounted] = useState(false);

  // Mark component as mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (!mounted) return;

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, [mounted]);

  // Update resolved theme based on current theme and system preference
  useEffect(() => {
    if (!mounted) return;

    const updateResolvedTheme = () => {
      if (theme === "system") {
        const systemPrefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setResolvedTheme(systemPrefersDark ? "dark" : "light");
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        updateResolvedTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, mounted]);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme, mounted]);

  const setThemeAndSave = (newTheme) => {
    if (!mounted) return;

    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    if (!mounted) return;

    if (theme === "light") {
      setThemeAndSave("dark");
    } else if (theme === "dark") {
      setThemeAndSave("system");
    } else {
      setThemeAndSave("light");
    }
  };

  const value = {
    theme,
    resolvedTheme,
    setTheme: setThemeAndSave,
    toggleTheme,
    mounted, // Expose mounted state for components that need it
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

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

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme && ["light", "dark", "system"].includes(savedTheme)) {
      setTheme(savedTheme);
    }
  }, []);

  // Update resolved theme based on current theme and system preference
  useEffect(() => {
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
  }, [theme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  const setThemeAndSave = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
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
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

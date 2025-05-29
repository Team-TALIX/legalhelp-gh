"use client";

import { useTheme } from "../../providers/ThemeProvider";
import { FaSun, FaMoon, FaDesktop } from "react-icons/fa";

const ThemeToggle = ({ className = "" }) => {
  const { theme, resolvedTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <FaSun className="w-4 h-4" />;
      case "dark":
        return <FaMoon className="w-4 h-4" />;
      case "system":
        return <FaDesktop className="w-4 h-4" />;
      default:
        return <FaSun className="w-4 h-4" />;
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "system":
        return "System";
      default:
        return "Light";
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium
        text-gray-700 dark:text-gray-300
        hover:text-orange-600 dark:hover:text-orange-400
        hover:bg-gray-100 dark:hover:bg-gray-800
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
        ${className}
      `}
      aria-label={`Switch to ${
        theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
      } mode`}
      title={`Current: ${getThemeLabel()} mode. Click to cycle themes.`}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getThemeLabel()}</span>
    </button>
  );
};

export default ThemeToggle;

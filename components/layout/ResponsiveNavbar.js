"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBars, FaTimes, FaGlobe, FaUser, FaSignOutAlt } from "react-icons/fa";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../hooks/useAuth";

const ResponsiveNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("EN");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navLinks = [
    { href: "/legal-topics", label: "Legal Topics" },
    { href: "/chat", label: "Ask AI" },
    { href: "/community", label: "Community" },
    { href: "/legal-aid", label: "Legal Aid" },
  ];

  const languages = [
    { code: "EN", label: "English" },
    { code: "TWI", label: "Twi" },
    { code: "EWE", label: "Ewe" },
    { code: "DAG", label: "Dagbani" },
  ];

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors duration-200"
            >
              LegalHelp GH
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}

            {/* Language Selector */}
            <div className="relative group">
              <button className="flex items-center text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-2 text-sm font-medium transition-colors duration-200">
                <FaGlobe className="mr-1" />
                {currentLanguage}
              </button>
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setCurrentLanguage(lang.code)}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200"
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Auth Buttons or User Profile */}
            {user ? (
              <div className="relative group">
                <button
                  onClick={toggleProfileDropdown}
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  <FaUser className="mr-2" />
                  {user.name || "Profile"}
                </button>
                
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      My Profile
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-orange-600 dark:hover:text-orange-400"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </button>
                  </div>
                
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 px-3 py-2 text-sm font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 p-2 rounded-md transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isOpen
              ? "max-h-screen opacity-100 pb-4"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-gray-700">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="block text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 text-base font-medium transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Language Selector */}
            <div className="px-3 py-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Language
              </p>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setCurrentLanguage(lang.code);
                      closeMenu();
                    }}
                    className={`text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                      currentLanguage === lang.code
                        ? "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Theme Toggle */}
            <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                Theme
              </p>
              <ThemeToggle className="w-full justify-center" />
            </div>

            {/* Mobile Auth Buttons or User Profile */}
            <div className="px-3 py-2 space-y-2 border-t border-gray-200 dark:border-gray-700">
              {user ? (
                <>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    Account
                  </p>
                  <Link
                    href="/profile"
                    onClick={closeMenu}
                    className="block w-full text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    <FaUser className="inline mr-2" />
                    My Profile
                  </Link>
                  {user.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      onClick={closeMenu}
                      className="block w-full text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="flex items-center w-full text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="block w-full text-center text-gray-700 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={closeMenu}
                    className="block w-full text-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ResponsiveNavbar;

'use client';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircleIcon, ChevronDownIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon, BellIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../loader/page';

export default function SocialMediaNav() {
  const { logout, isLoggedIn, userData } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState('light');

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
    setIsSearchOpen(false); // Close search when menu toggles
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    setMenuOpen(false); // Close menu when search toggles
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setDropdownOpen(false);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/';
    }, 2000);
  };

  const handleAccountRedirect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/account';
    }, 2000);
  };

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark shadow-card dark:shadow-card-dark transition-colors duration-350">
      {loading && <Loader />}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/silkroadlogo.jpeg"
            alt="SocialSphere Logo"
            width={120}
            height={40}
            className="object-contain"
          />
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 mx-4">
          <div className="relative w-full max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts, people..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-surface-light dark:bg-surface-dark text-text-light dark:text-text-dark border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors text-sm"
            />
          </div>
        </div>

        {/* Mobile Controls (Search Toggle, Theme Toggle, Hamburger) */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleSearch}
            className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
            aria-label="Toggle search"
          >
            <MagnifyingGlassIcon className="h-6 w-6" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <MoonIcon className="h-6 w-6" />
            ) : (
              <SunIcon className="h-6 w-6" />
            )}
          </button>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <MoonIcon className="h-6 w-6" />
            ) : (
              <SunIcon className="h-6 w-6" />
            )}
          </button>
          <Link
            href="/notifications"
            className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
          >
            <BellIcon className="h-6 w-6" />
          </Link>
          {isLoggedIn ? (
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={toggleDropdown}
              >
                <div className="relative">
                  <UserCircleIcon className="h-8 w-8 rounded-full bg-surface-light dark:bg-surface-dark p-1" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-accent-light dark:bg-accent-dark rounded-full border-2 border-surface-light dark:border-surface-dark"></span>
                </div>
                <span className="text-sm font-medium">{userData?.name || 'User'}</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md text-text-light dark:text-text-dark rounded-lg shadow-card dark:shadow-card-dark border border-gray-200 dark:border-gray-600 p-2 z-50"
                  >
                    <Link
                      href={`/profile/${userData?.id}`}
                      className="block px-4 py-2 hover:bg-surface-light dark:hover:bg-surface-dark rounded-md transition-colors text-sm"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleAccountRedirect}
                      className="w-full text-left px-4 py-2 hover:bg-surface-light dark:hover:bg-surface-dark rounded-md transition-colors text-sm"
                    >
                      Account
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-surface-light dark:hover:bg-surface-dark rounded-md transition-colors text-red-500 text-sm"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium hover:bg-surface-light dark:hover:bg-surface-dark rounded-full transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark text-white hover:from-primary-dark hover:to-secondary-dark rounded-xl transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
          <Link
            href="/write"
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark text-white hover:from-primary-dark hover:to-secondary-dark rounded-xl transition-colors"
          >
            Post
          </Link>
        </nav>
      </div>

      {/* Mobile Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ scaleX: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden px-4 py-2 bg-surface-light dark:bg-surface-dark border-t border-gray-300 dark:border-gray-600"
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts, people..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light dark:focus:ring-primary-dark transition-colors text-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3 }}
            className="md:hidden fixed top-0 left-0 w-3/4 h-full bg-surface-light dark:bg-surface-dark shadow-card dark:shadow-card-dark z-50 p-4"
          >
            <div className="flex justify-between items-center mb-6">
              <Image
                src="/silkroadlogo.jpeg"
                alt="SocialSphere Logo"
                width={100}
                height={32}
                className="object-contain"
              />
              <button
                onClick={toggleMenu}
                className="p-2 rounded-full hover:bg-surface-light dark:hover:bg-surface-dark transition-colors"
                aria-label="Close menu"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <ul className="flex flex-col gap-4 items-center">
              <li>
                <Link
                  href="/notifications"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-surface-light dark:hover:bg-surface-dark rounded-full transition-colors text-text-light dark:text-text-dark"
                  onClick={toggleMenu}
                >
                  <BellIcon className="h-5 w-5" />
                  Notifications
                </Link>
              </li>
              {isLoggedIn ? (
                <>
                  <li>
                    <Link
                      href={`/profile/${userData?.id}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-surface-light dark:hover:bg-surface-dark rounded-full transition-colors text-text-light dark:text-text-dark"
                      onClick={toggleMenu}
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      Profile
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleAccountRedirect();
                        toggleMenu();
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-surface-light dark:hover:bg-surface-dark rounded-full transition-colors w-full text-left text-text-light dark:text-text-dark"
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      Account
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        handleLogout();
                        toggleMenu();
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-surface-light dark:hover:bg-surface-dark rounded-full transition-colors text-red-500 w-full text-left"
                    >
                      <UserCircleIcon className="h-5 w-5" />
                      Logout
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link
                      href="/login"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium hover:bg-surface-light dark:hover:bg-surface-dark rounded-full transition-colors text-text-light dark:text-text-dark"
                      onClick={toggleMenu}
                    >
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/signup"
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark text-white hover:from-primary-dark hover:to-secondary-dark rounded-full transition-colors"
                      onClick={toggleMenu}
                    >
                      Sign Up
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link
                  href="/write"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-primary-light to-secondary-light dark:from-primary-dark dark:to-secondary-dark text-white hover:from-primary-dark hover:to-secondary-dark rounded-full transition-colors"
                  onClick={toggleMenu}
                >
                  Post
                </Link>
              </li>
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </div>
  );
}
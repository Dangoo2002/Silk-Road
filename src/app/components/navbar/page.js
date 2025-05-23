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
    <div className="fixed top-0 left-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg text-gray-900 dark:text-gray-100 shadow-lg dark:shadow-xl transition-colors duration-300 h-14">
      {loading && <Loader />}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between h-full">
        {/* Logo and Title */}
        <Link href="/" className="flex items-center space-x-2 group max-h-14">
          <div className="relative overflow-hidden rounded-lg">
            <Image
              src="/silkroadlogo.jpeg"
              alt="Silk Road Blogs Logo"
              width={32}
              height={32}
              className="w-8 h-8 sm:w-10 sm:h-10 object-cover transform group-hover:scale-105 transition-all duration-300"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex flex-col relative">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Silk Road
            </span>
            <span className="text-xs font-light tracking-wider text-gray-700 dark:text-gray-300">
              Blogs
            </span>
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-4/5 transition-all duration-300"></span>
          </div>
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 mx-4">
          <div className="relative w-full max-w-xs">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts, people..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-colors text-sm"
            />
          </div>
        </div>

        {/* Mobile Controls (Search Toggle, Theme Toggle, Hamburger) */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleSearch}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle search"
          >
            <MagnifyingGlassIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <SunIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          <button
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <MoonIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            ) : (
              <SunIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            )}
          </button>
          <Link
            href="/notifications"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <BellIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </Link>
          {isLoggedIn ? (
            <div className="relative">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={toggleDropdown}
              >
                <div className="relative">
                  <UserCircleIcon className="h-8 w-8 rounded-full bg-white/50 dark:bg-gray-800/50 p-1 text-gray-600 dark:text-gray-300" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-indigo-500 dark:bg-purple-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{userData?.name || 'User'}</span>
                <ChevronDownIcon className={`h-4 w-4 text-gray-600 dark:text-gray-300 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full right-0 mt-2 w-48 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md text-gray-900 dark:text-gray-100 rounded-lg shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-600 p-2 z-50"
                  >
                    <Link
                      href={`/profile/${userData?.id}`}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-sm"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleAccountRedirect}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-sm"
                    >
                      Account
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors text-red-500 text-sm"
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
                className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
          <Link
            href="/write"
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-colors"
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
            className="md:hidden px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-300 dark:border-gray-600"
          >
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts, people..."
                className="w-full pl-10 pr-4 py-2 rounded-full bg-white/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-purple-500 transition-colors text-sm"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden fixed inset-0 bg-black z-40"
              onClick={toggleMenu}
            />
            {/* Full-Screen Modal Menu */}
            <motion.nav
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50 p-6"
            >
              <button
                onClick={toggleMenu}
                className="absolute top-4 right-4 p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close menu"
              >
                <XMarkIcon className="h-8 w-8 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <Link href="/" className="flex items-center space-x-3 group mb-8" onClick={toggleMenu}>
                  <div className="relative overflow-hidden rounded-lg">
                    <Image
                      src="/silkroadlogo.jpeg"
                      alt="Silk Road Blogs Logo"
                      width={40}
                      height={40}
                      className="w-12 h-12 object-cover transform group-hover:scale-110 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="flex flex-col relative">
                    <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                      Silk Road
                    </span>
                    <span className="text-sm font-light tracking-wider text-gray-700 dark:text-gray-300">
                      Blogs
                    </span>
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-600 group-hover:w-4/5 transition-all duration-300"></span>
                  </div>
                </Link>
                <ul className="flex flex-col gap-4 w-full">
                  <motion.li
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link
                      href="/notifications"
                      className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-all duration-300 shadow-md"
                      onClick={toggleMenu}
                    >
                      <BellIcon className="h-7 w-7" />
                      Notifications
                    </Link>
                  </motion.li>
                  {isLoggedIn ? (
                    <>
                      <motion.li
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link
                          href={`/profile/${userData?.id}`}
                          className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-all duration-300 shadow-md"
                          onClick={toggleMenu}
                        >
                          <UserCircleIcon className="h-7 w-7" />
                          Profile
                        </Link>
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <button
                          onClick={() => {
                            handleAccountRedirect();
                            toggleMenu();
                          }}
                          className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-all duration-300 shadow-md w-full"
                        >
                          <UserCircleIcon className="h-7 w-7" />
                          Account
                        </button>
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <button
                          onClick={() => {
                            handleLogout();
                            toggleMenu();
                          }}
                          className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-medium text-red-500 dark:text-red-400 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gradient-to-r hover:from-red-100 hover:to-pink-100 dark:hover:from-red-800 dark:hover:to-pink-800 transition-all duration-300 shadow-md w-full"
                        >
                          <UserCircleIcon className="h-7 w-7" />
                          Logout
                        </button>
                      </motion.li>
                    </>
                  ) : (
                    <>
                      <motion.li
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Link
                          href="/login"
                          className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-all duration-300 shadow-md"
                          onClick={toggleMenu}
                        >
                          <UserCircleIcon className="h-7 w-7" />
                          Login
                        </Link>
                      </motion.li>
                      <motion.li
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Link
                          href="/signup"
                          className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 rounded-2xl transition-all duration-300 shadow-md"
                          onClick={toggleMenu}
                        >
                          <UserCircleIcon className="h-7 w-7" />
                          Sign Up
                        </Link>
                      </motion.li>
                    </>
                  )}
                  <motion.li
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: isLoggedIn ? 0.5 : 0.4 }}
                  >
                    <Link
                      href="/write"
                      className="flex items-center justify-center gap-3 px-6 py-4 text-lg font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 rounded-2xl transition-all duration-300 shadow-md"
                      onClick={toggleMenu}
                    >
                      <UserCircleIcon className="h-7 w-7" />
                      Post
                    </Link>
                  </motion.li>
                </ul>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
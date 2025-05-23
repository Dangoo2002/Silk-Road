'use client';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircleIcon, ChevronDownIcon, Bars3Icon, XMarkIcon, MagnifyingGlassIcon, MoonIcon, SunIcon, PencilSquareIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

export default function SocialMediaNav() {
  const { logout, isLoggedIn, userData } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
    setIsSearchOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    setMenuOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    window.location.href = '/';
  };

  const handleAccountRedirect = () => {
    window.location.href = '/account';
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const menuItems = [
    {
      icon: PencilSquareIcon,
      label: 'Write Post',
      href: '/write',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const userMenuItems = isLoggedIn ? [
    {
      icon: Cog6ToothIcon,
      label: 'Account',
      action: handleAccountRedirect,
      color: 'from-gray-500 to-slate-500'
    },
    {
      icon: ArrowRightOnRectangleIcon,
      label: 'Logout',
      action: handleLogout,
      color: 'from-red-500 to-rose-500',
      isLogout: true
    }
  ] : [
    {
      icon: UserCircleIcon,
      label: 'Login',
      href: '/login',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: UserCircleIcon,
      label: 'Sign Up',
      href: '/signup',
      color: 'from-purple-500 to-violet-500'
    }
  ];

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-lg dark:shadow-xl transition-colors duration-300 h-14">
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
            href="/write"
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 rounded-xl transition-colors"
          >
            Write Post
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
                    className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-lg shadow-lg dark:shadow-xl border border-gray-200 dark:border-gray-600 p-2 z-50"
                  >
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

      {/* Modern Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 z-50 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Image
                      src="/silkroadlogo.jpeg"
                      alt="Silk Road Blogs Logo"
                      width={32}
                      height={32}
                      className="w-10 h-10 rounded-xl object-cover"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-600/20 rounded-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Menu</h2>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Navigate your blog</p>
                  </div>
                </div>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>

              {/* User Info (if logged in) */}
              {isLoggedIn && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-6 border-b border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{userData?.name || 'User'}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back!</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Menu Items */}
              <div className="flex-1 overflow-y-auto py-6">
                <div className="px-6 space-y-3">
                  {/* Common Menu Items */}
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={closeMenu}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 group border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      >
                        <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                          <item.icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.label}</h4>
                        </div>
                        <ChevronDownIcon className="h-5 w-5 text-gray-400 -rotate-90 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                      </Link>
                    </motion.div>
                  ))}

                  {/* User-specific Menu Items */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-4">
                      {isLoggedIn ? 'Account' : 'Get Started'}
                    </h3>
                    {userMenuItems.map((item, index) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.05 }}
                      >
                        {item.href ? (
                          <Link
                            href={item.href}
                            onClick={closeMenu}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 group border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          >
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                              <item.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-semibold ${item.isLogout ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                {item.label}
                              </h4>
                            </div>
                            <ChevronDownIcon className="h-5 w-5 text-gray-400 -rotate-90 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                          </Link>
                        ) : (
                          <button
                            onClick={() => {
                              item.action();
                              closeMenu();
                            }}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 group border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                          >
                            <div className={`p-3 rounded-xl bg-gradient-to-r ${item.color} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                              <item.icon className="h-6 w-6" />
                            </div>
                            <div className="flex-1 text-left">
                              <h4 className={`font-semibold ${item.isLogout ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                {item.label}
                              </h4>
                            </div>
                            <ChevronDownIcon className="h-5 w-5 text-gray-400 -rotate-90 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
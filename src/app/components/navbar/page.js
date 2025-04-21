'use client';
import { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircleIcon, ChevronDownIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Loader from '../loader/page';

export default function Nav() {
  const { logout, isLoggedIn, userData } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
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
    <div className="bg-[var(--background)] text-[var(--foreground)] shadow-md">
      {loading && <Loader />}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Image
            src="/silkroadlogo.jpeg"
            alt="Silk Road Logo"
            width={150}
            height={50}
            className="object-contain"
          />
        </Link>

        {/* Hamburger Button (Mobile) */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>

        {/* Navigation Links */}
        <nav
          className={`${
            menuOpen ? 'flex' : 'hidden'
          } md:flex flex-col md:flex-row absolute md:static top-16 left-0 w-full md:w-auto bg-[var(--background)] md:bg-transparent p-4 md:p-0 shadow-md md:shadow-none transition-all duration-300 ease-in-out z-50`}
        >
          <ul className="flex flex-col md:flex-row gap-4 md:items-center">
            {isLoggedIn ? (
              <li className="relative">
                <div className="flex items-center gap-2 cursor-pointer" onClick={toggleDropdown}>
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="text-sm font-medium">{userData?.name || 'User'}</span>
                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white text-[var(--foreground)] rounded-lg shadow-lg border border-gray-200 p-2 z-50">
                    <button
                      onClick={handleAccountRedirect}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
                    >
                      Account
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 rounded-md transition-colors text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <>
                <li>
                  <Link
                    href="/login"
                    className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-500 rounded-md transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="block px-4 py-2 text-sm font-medium hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-500 rounded-md transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link
                href="/write"
                className="block px-4 py-2 text-sm font-medium bg-white text-black hover:bg-gray-200 rounded-md transition-colors md:bg-blue-500 md:text-white md:hover:bg-blue-600"
              >
                Write
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
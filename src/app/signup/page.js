
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlineUser } from 'react-icons/ai';
import { FaEnvelope, FaLock, FaCheckCircle, FaExclamationCircle, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { fullName, email, password, confirmPassword } = formData;

    if (!fullName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (/^[0-9]+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
      setError('Password must contain both letters and numbers');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      console.log('Attempting to sign up with URL:', `${apiUrl}/signup`);
      const response = await fetch(`${apiUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || response.statusText || 'Error signing up';
        console.error('Signup Error:', errorMessage, errorData);
        setError(errorMessage);
        setSuccess('');
        return;
      }

      const data = await response.json();
      console.log('Signup successful:', data);
      setSuccess('Signup successful!');
      setError('');

      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      router.push('/login');
    } catch (error) {
      console.error('Fetch error:', error);
      setError('Network error. Please try again.');
      setSuccess('');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 space-y-6 transform transition-all duration-300 hover:shadow-xl">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/silkroadlogo.jpeg"
            alt="Silk Road Logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-800 text-center">Sign Up</h1>

        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg flex items-center gap-2">
            <FaExclamationCircle />
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg flex items-center gap-2">
            <FaCheckCircle />
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Field */}
          <div className="relative">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <div className="mt-1 flex items-center">
              <AiOutlineUser className="absolute left-3 text-gray-400" />
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className="w-full pl-10 pr-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <div className="mt-1 flex items-center">
              <FaEnvelope className="absolute left-3 text-gray-400" />
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                className="w-full pl-10 pr-3 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-colors"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1 flex items-center">
              <FaLock className="absolute left-3 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-colors"
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="mt-1 flex items-center">
              <FaLock className="absolute left-3 text-gray-400" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className="w-full pl-10 pr-10 py-2 bg-white text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 transition-colors"
              />
              <button
                type="button"
                onClick={toggleShowPassword}
                className="absolute right-3 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Sign Up
          </button>

          {/* Login Link */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

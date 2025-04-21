'use client';
import { useRouter } from 'next/navigation';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../components/AuthContext/AuthContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

export default function Login() {
  const { login, error, success, loading, isLoggedIn } = useContext(AuthContext);
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      console.log('User is logged in, redirecting to home page...');
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginSuccess = await login(formData.email, formData.password);
    if (loginSuccess) {
      const userId = JSON.parse(localStorage.getItem('userData')).id;
      localStorage.setItem('userId', userId);
      router.push('/');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
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
        <h1 className="text-3xl font-bold text-gray-800 text-center">Login</h1>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg text-center">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {/* Signup Link */}
          <div className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
'use client';
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../../../components/AuthContext/AuthContext';
import { motion } from 'framer-motion';
import { LockClosedIcon } from '@heroicons/react/24/outline';

export default function AdminLogin() {
  const { loginAsAdmin, error, setError, success, isAdminLoggedIn } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Redirect if already logged in
  if (isAdminLoggedIn) {
    router.push('/admin');
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await loginAsAdmin(email, password);
    if (!success) {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-xl shadow-md border border-gray-100 p-8"
      >
        <div className="flex justify-center mb-6">
          <LockClosedIcon className="w-12 h-12 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Admin Login</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">{success}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="admin@silkroad.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
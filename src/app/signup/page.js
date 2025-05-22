'use client';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../components/AuthContext/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';

export default function Signup() {
  const { loginWithGoogle, error, success, loading, isLoggedIn } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const handleGoogleSignup = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 space-y-8 transform transition-all duration-500 hover:scale-105">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/silkroadlogo.jpeg"
            alt="Silk Road Logo"
            className="h-20 w-auto object-contain transition-transform duration-300 hover:scale-110"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-gray-900 text-center tracking-tight">
          Join Silk Road
        </h1>
        <p className="text-center text-gray-600 text-sm">Create an account to start sharing</p>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-100 text-green-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {success}
          </div>
        )}
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Google Sign-Up Button */}
        <button
          onClick={handleGoogleSignup}
          disabled={loading}
          className={`w-full py-3 px-4 bg-white text-gray-800 font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors duration-300 flex items-center justify-center gap-3 shadow-sm ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FcGoogle className="text-2xl" />
          {loading ? 'Signing up...' : 'Sign up with Google'}
        </button>

        {/* Login Link */}
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Log in
          </Link>
        </div>
      </div>

      {/* Tailwind Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
'use client';
import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../components/AuthContext/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import Link from 'next/link';

export default function Login() {
  const { loginWithGoogle, error, success, loading, isLoggedIn } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-2 h-2 bg-gray-200 rounded-full animate-float opacity-40"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-gray-300 rounded-full animate-float-delayed opacity-30"></div>
        <div className="absolute bottom-32 left-40 w-3 h-3 bg-gray-100 rounded-full animate-float-slow opacity-50"></div>
        <div className="absolute bottom-20 right-20 w-1.5 h-1.5 bg-gray-200 rounded-full animate-float-fast opacity-35"></div>
      </div>

      <div className="w-full max-w-md relative">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-[0_20px_80px_-12px_rgba(0,0,0,0.08)] border border-gray-100/80 p-8 sm:p-10 space-y-8 relative overflow-hidden transform transition-all duration-500 hover:shadow-[0_25px_100px_-12px_rgba(0,0,0,0.12)]">
          
          {/* Subtle Card Accent */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600"></div>
          
          {/* Logo Section */}
          <div className="flex justify-center relative">
            <div className="relative group">
              <div className="absolute -inset-3 bg-gray-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm"></div>
              <img
                src="/silkroadlogo.jpeg"
                alt="Silk Road Logo"
                className="relative h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-2xl transition-all duration-300 group-hover:scale-105 shadow-sm"
              />
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-base font-normal leading-relaxed">
              Sign in to continue to your account
            </p>
            <div className="w-12 h-0.5 bg-gray-900 mx-auto rounded-full"></div>
          </div>

          {/* Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-2xl flex items-center gap-3 animate-slide-down">
              <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl flex items-center gap-3 animate-slide-down">
              <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="space-y-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`group relative w-full py-4 px-6 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-800 font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-4 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 active:scale-[0.98] ${
                loading ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            >
              <FcGoogle className="text-2xl transition-transform duration-200 group-hover:scale-110" />
              
              <span className="text-base">
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  'Continue with Google'
                )}
              </span>
              
              {!loading && (
                <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-1 group-hover:translate-x-0">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Signup Link */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="font-semibold text-gray-900 hover:text-gray-700 transition-colors duration-200 relative group"
              >
                Create account
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Shadows */}
        <div className="absolute -top-4 -right-4 w-20 h-20 bg-gray-100 rounded-full blur-2xl opacity-30"></div>
        <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-gray-50 rounded-full blur-2xl opacity-40"></div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slide-down {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
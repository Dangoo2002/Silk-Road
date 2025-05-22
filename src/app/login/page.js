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
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.3),transparent_50%)] animate-pulse"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.3),transparent_50%)] animate-pulse delay-1000"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_80%,rgba(120,200,255,0.3),transparent_50%)] animate-pulse delay-2000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-300/30 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-3/4 w-3 h-3 bg-pink-300/20 rounded-full animate-float-slow"></div>
        <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-blue-300/25 rounded-full animate-float-fast"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 sm:mx-auto">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8 transform transition-all duration-700 hover:scale-[1.02] hover:shadow-3xl hover:bg-white/15">
          
          {/* Logo with Glow Effect */}
          <div className="flex justify-center relative">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
              <img
                src="/silkroadlogo.jpeg"
                alt="Silk Road Logo"
                className="relative h-20 w-20 sm:h-24 sm:w-24 object-cover rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg"
              />
            </div>
          </div>

          {/* Title with Gradient Text */}
          <div className="text-center space-y-3">
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent tracking-tight leading-tight">
              Welcome Back
            </h1>
            <p className="text-white/70 text-base sm:text-lg font-light tracking-wide">
              Continue your creative journey
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto"></div>
          </div>

          {/* Success/Error Messages with Enhanced Styling */}
          {success && (
            <div className="bg-emerald-500/20 backdrop-blur-sm text-emerald-100 p-4 rounded-2xl flex items-center gap-3 border border-emerald-400/30 animate-slide-up">
              <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-medium">{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 backdrop-blur-sm text-red-100 p-4 rounded-2xl flex items-center gap-3 border border-red-400/30 animate-slide-up">
              <div className="flex-shrink-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Enhanced Google Sign-In Button */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className={`group relative w-full py-4 px-6 bg-white/95 hover:bg-white text-gray-800 font-semibold rounded-2xl transition-all duration-300 flex items-center justify-center gap-4 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 ${
                loading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-[1.02]'
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <FcGoogle className="text-2xl sm:text-3xl relative z-10 transition-transform duration-300 group-hover:scale-110" />
              
              <span className="relative z-10 text-base sm:text-lg">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in with Google'
                )}
              </span>
              
              {!loading && (
                <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Enhanced Signup Link */}
          <div className="text-center">
            <p className="text-white/60 text-sm sm:text-base">
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                className="font-semibold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent hover:from-pink-300 hover:to-purple-300 transition-all duration-300 relative group"
              >
                Sign up
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-xl"></div>
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 rounded-full blur-xl"></div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-180deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(90deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-25px) rotate(-90deg); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 3s ease-in-out infinite;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        
        .shadow-3xl {
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
'use client';

import { useEffect } from 'react';
import ClimbingBoxLoader from 'react-spinners/ClimbingBoxLoader';

const Loader = ({ setLoading }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [setLoading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <ClimbingBoxLoader size={40} color="#ff4081" />
      <p className="mt-4 text-xl font-semibold text-pink-600">Silk Road...</p>
    </div>
  );
};

export default Loader;
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Loader = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // Loader displays for 2 seconds

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, []);

  return (
    <>
      {loading ? (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-t-indigo-500 dark:border-t-purple-500 border-gray-300 dark:border-gray-600 rounded-full animate-spin"></div>
            <p className="text-gray-900 dark:text-gray-100 text-lg font-medium">Loading...</p>
          </div>
        </motion.div>
      ) : (
        children
      )}
    </>
  );
};

export default Loader;
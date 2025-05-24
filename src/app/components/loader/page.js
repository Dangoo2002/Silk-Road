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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </motion.div>
      ) : (
        children
      )}
    </>
  );
};

export default Loader;
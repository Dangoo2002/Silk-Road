'use client'; 

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';  
import Loader from './loader/page'; 

const NavigationLoader = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    setLoading(true); 
  };

  const handleComplete = () => {
    setTimeout(() => {
      setLoading(false); 
    }, 3000);
  };

  useEffect(() => {
 
    const originalPush = router.push;

    router.push = async (...args) => {
      handleStart(); 
      await originalPush(...args);  
      handleComplete(); 
    };

 
    const originalReplace = router.replace;

    router.replace = async (...args) => {
      handleStart();
      await originalReplace(...args);
      handleComplete();
    };

    // Clean up
    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [router]);

  return (
    <>
      {loading ? <Loader /> : children}  {/* Show loader or page content based on loading state */}
    </>
  );
};

export default NavigationLoader;
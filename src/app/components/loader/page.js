'use client';

import { useEffect } from 'react';
import ClimbingBoxLoader from 'react-spinners/ClimbingBoxLoader';
import styles from './loader.module.css';

const Loader = ({ setLoading }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); 
    }, 2000); 

    return () => clearTimeout(timer);
  }, [setLoading]);

  return (
    <div className={styles.loaderContainer}>
      <ClimbingBoxLoader  size={40} color={"#ff4081"} />
      <p className={styles.par}>Silk Road...</p>
    </div>
  );
};

export default Loader;
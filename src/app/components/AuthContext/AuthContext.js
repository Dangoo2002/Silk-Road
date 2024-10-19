'use client';
import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData && storedUserData !== 'undefined') {
      try {
        const parsedData = JSON.parse(storedUserData);
        setIsLoggedIn(true);
        setUserData(parsedData);
        console.log('User data loaded from local storage:', parsedData); 
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('userData');
      }
    }
  }, []);

 
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        setUserData(data.user);

       
        localStorage.setItem('userData', JSON.stringify(data.user)); 
        localStorage.setItem('userId', data.user.id); 

        setSuccess('Login successful!');
        setError('');
        console.log('Login successful:', data.user); 
        return true;
      } else {
        const errorData = await response.json();
        const errorMessage = errorData?.message || 'Login failed. Please try again.';
        setError(errorMessage);
        setSuccess('');
        console.log('Login failed:', errorMessage); 
        return false;
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err); 
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);


  const logout = useCallback(() => {
    setIsLoggedIn(false);
    setUserData(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('userId'); 
    setSuccess('Logged out successfully!');
    setError('');
    console.log('User logged out'); 
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, error, success, isLoggedIn, loading, userData }}>
      {children}
    </AuthContext.Provider>
  );
};

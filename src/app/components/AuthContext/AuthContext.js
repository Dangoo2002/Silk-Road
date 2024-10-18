'use client';
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  const login = async (email, password) => {
    const response = await fetch(`${apiUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const userData = await response.json();
      setUser(userData);
      setSuccess('Login successful!'); 
      setError(''); 
      return true;
    } else {
      const errorData = await response.json();
      const errorMessage = errorData?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      setSuccess(''); 
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setSuccess('Logged out successfully!'); 
    setError('');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const response = await fetch(`${apiUrl}/api/user`);
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
   
        setError('Failed to fetch user data');
      }
    };
    fetchUser();
  }, [apiUrl]);

  const isLoggedIn = user !== null; 

  return (
    <AuthContext.Provider value={{ user, login, logout, error, success, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

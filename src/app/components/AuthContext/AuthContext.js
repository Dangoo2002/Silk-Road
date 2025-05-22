'use client';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { auth, googleProvider } from '../../../../firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  // Monitor Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const idToken = await user.getIdToken();
          const response = await fetch(`${apiUrl}/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              idToken,
              email: user.email,
              name: user.displayName,
              firebase_uid: user.uid,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            setIsLoggedIn(true);
            setUserData(data.user);
            setToken(data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);
            setSuccess('Authentication successful!');
            setError('');
          } else {
            setError('Failed to authenticate with server');
            setIsLoggedIn(false);
            setUserData(null);
            setToken(null);
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
          }
        } catch (err) {
          setError('Authentication error. Please try again.');
          console.error('Auth state error:', err);
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
        setToken(null);
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      }
    });

    return () => unsubscribe();
  }, [apiUrl]);

  // Google Sign-In
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken,
          email: user.email,
          name: user.displayName,
          firebase_uid: user.uid,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        setUserData(data.user);
        setToken(data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);
        setSuccess('Login successful!');
        setError('');
        router.push('/');
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
        setSuccess('');
        return false;
      }
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
      console.error('Google Sign-In error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiUrl, router]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setUserData(null);
      setToken(null);
      localStorage.removeItem('userData');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      setSuccess('Logged out successfully!');
      setError('');
      router.push('/login');
    } catch (err) {
      setError('Logout failed. Please try again.');
      console.error('Logout error:', err);
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{ loginWithGoogle, logout, error, success, isLoggedIn, loading, userData, token }}
    >
      {children}
    </AuthContext.Provider>
  );
};
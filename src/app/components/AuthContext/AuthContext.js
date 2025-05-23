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

  // Update user profile (bio and image)
  const updateUserProfile = useCallback(async (updates) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/user/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        localStorage.setItem('userData', JSON.stringify(data.user));
        setSuccess('Profile updated successfully!');
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
        return false;
      }
    } catch (err) {
      setError('Error updating profile. Please try again.');
      console.error('Update profile error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, userData?.id]);

  // Upload profile picture
  const uploadProfilePicture = useCallback(async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await fetch(`${apiUrl}/api/upload-profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(prev => ({ ...prev, image: data.imageUrl }));
        localStorage.setItem('userData', JSON.stringify({ ...userData, image: data.imageUrl }));
        setSuccess('Profile picture updated successfully!');
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload profile picture');
        return false;
      }
    } catch (err) {
      setError('Error uploading profile picture. Please try again.');
      console.error('Upload profile picture error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token, userData]);

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
      value={{ 
        loginWithGoogle, 
        logout, 
        error, 
        success, 
        isLoggedIn, 
        loading, 
        userData, 
        token,
        updateUserProfile,
        uploadProfilePicture,
        setError,
        setSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
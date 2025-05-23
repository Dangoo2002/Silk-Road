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
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  // Restore state from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');

    if (storedUserData && storedToken && storedUserId) {
      setUserData(JSON.parse(storedUserData));
      setToken(storedToken);
      setIsLoggedIn(true);
    }
    setLoading(false); // Move loading=false here to avoid blocking UI
  }, []);

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
          const responseData = await response.json();

          if (response.ok) {
            setIsLoggedIn(true);
            setUserData(responseData.user);
            setToken(responseData.token);
            localStorage.setItem('userData', JSON.stringify(responseData.user));
            localStorage.setItem('token', responseData.token);
            localStorage.setItem('userId', responseData.user.id);
            setSuccess('Authentication successful!');
            setError('');
          } else {
            setError(responseData.message || 'Failed to authenticate with server');
            setIsLoggedIn(false);
            setUserData(null);
            setToken(null);
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
          }
        } catch (err) {
          setError('Authentication error. Please try again.');
          setIsLoggedIn(false);
          setUserData(null);
          setToken(null);
          localStorage.removeItem('userData');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
      } else {
        setIsLoggedIn(false);
        setUserData(null);
        setToken(null);
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      }
      setLoading(false);
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
      const responseData = await response.json();

      if (response.ok) {
        setIsLoggedIn(true);
        setUserData(responseData.user);
        setToken(responseData.token);
        localStorage.setItem('userData', JSON.stringify(responseData.user));
        localStorage.setItem('token', responseData.token);
        localStorage.setItem('userId', responseData.user.id);
        setSuccess('Login successful!');
        setError('');
        router.push('/');
        return true;
      } else {
        setError(responseData.message || 'Login failed');
        setSuccess('');
        return false;
      }
    } catch (err) {
      setError('Google Sign-In failed. Please try again.');
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
    }
  }, [router]);

  // Update profile picture
  const uploadProfilePicture = useCallback(
    async (file) => {
      try {
        setLoading(true);
        const formData = new FormData();
        formData.append('profilePicture', file);

        const response = await fetch(`${apiUrl}/api/save-profile-picture`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        const responseData = await response.json();

        if (response.ok) {
          setUserData(responseData.user); // Update with full user object
          localStorage.setItem('userData', JSON.stringify(responseData.user));
          setSuccess('Profile picture updated successfully!');
          return true;
        } else {
          setError(responseData.message || 'Failed to upload profile picture');
          return false;
        }
      } catch (err) {
        setError('Error uploading profile picture. Please try again.');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiUrl, token]
  );

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
        updateUserProfile: useCallback(
          async (updates) => {
            try {
              setLoading(true);
              const response = await fetch(`${apiUrl}/user/${userData?.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
              });
              const responseData = await response.json();

              if (response.ok) {
                setUserData(responseData.user);
                localStorage.setItem('userData', JSON.stringify(responseData.user));
                setSuccess('Profile updated successfully!');
                return true;
              } else {
                setError(responseData.message || 'Failed to update profile');
                return false;
              }
            } catch (err) {
              setError('Error updating profile. Please try again.');
              return false;
            } finally {
              setLoading(false);
            }
          },
          [apiUrl, token, userData?.id]
        ),
        uploadProfilePicture,
        setError,
        setSuccess,
      }}
    >
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
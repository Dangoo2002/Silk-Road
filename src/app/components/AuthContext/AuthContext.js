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
  const [loading, setLoading] = useState(true); // Add loading state
  const router = useRouter();
  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  // Restore state from localStorage on mount
  useEffect(() => {
    console.log('AuthProvider: Checking localStorage for persisted data');
    const storedUserData = localStorage.getItem('userData');
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');

    if (storedUserData && storedToken && storedUserId) {
      console.log('Restoring from localStorage:', { storedUserData, storedToken, storedUserId });
      setUserData(JSON.parse(storedUserData));
      setToken(storedToken);
      setIsLoggedIn(true);
    } else {
      console.log('No valid data in localStorage');
    }
  }, []);

  // Monitor Firebase auth state
  useEffect(() => {
    console.log('AuthProvider: Initializing onAuthStateChanged');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('onAuthStateChanged: User state:', user);
      if (user) {
        try {
          console.log('Fetching ID token for user:', user.uid);
          const idToken = await user.getIdToken();
          console.log('ID token:', idToken);
          console.log('Sending request to /auth/google with:', {
            email: user.email,
            name: user.displayName,
            firebase_uid: user.uid,
          });
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
          console.log('Backend response:', response.status, responseData);

          if (response.ok) {
            console.log('Auth successful, setting userData:', responseData.user, 'token:', responseData.token);
            setIsLoggedIn(true);
            setUserData(responseData.user);
            setToken(responseData.token);
            localStorage.setItem('userData', JSON.stringify(responseData.user));
            localStorage.setItem('token', responseData.token);
            localStorage.setItem('userId', responseData.user.id);
            setSuccess('Authentication successful!');
            setError('');
          } else {
            console.error('Backend auth failed:', response.status, responseData);
            setError('Failed to authenticate with server');
            setIsLoggedIn(false);
            setUserData(null);
            setToken(null);
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
          }
        } catch (err) {
          console.error('Auth state error:', err.message);
          setError('Authentication error. Please try again.');
          setIsLoggedIn(false);
          setUserData(null);
          setToken(null);
          localStorage.removeItem('userData');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
      } else {
        console.log('No user signed in, clearing auth state');
        setIsLoggedIn(false);
        setUserData(null);
        setToken(null);
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      }
      setLoading(false); // Set loading to false after auth state is resolved
    });

    return () => {
      console.log('AuthProvider: Cleaning up onAuthStateChanged');
      unsubscribe();
    };
  }, [apiUrl]);

  // Google Sign-In
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const idToken = await user.getIdToken();

      console.log('Google Sign-In: Sending request to /auth/google with:', {
        email: user.email,
        name: user.displayName,
        firebase_uid: user.uid,
      });
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
      console.log('Google Sign-In: Backend response:', response.status, responseData);

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
      console.error('Google Sign-In error:', err);
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
      console.error('Logout error:', err);
      setError('Logout failed. Please try again.');
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
        loading, // Expose loading state
        userData,
        token,
        updateUserProfile: useCallback(
          async (updates) => {
            try {
              setLoading(true);
              const response = await fetch(`${apiUrl}/user/${userData.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
              });
              const responseData = await response.json();
              console.log('Update profile response:', response.status, responseData);

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
              console.error('Update profile error:', err);
              setError('Error updating profile. Please try again.');
              return false;
            } finally {
              setLoading(false);
            }
          },
          [apiUrl, token, userData?.id]
        ),
        uploadProfilePicture: useCallback(
          async (file) => {
            try {
              setLoading(true);
              const formData = new FormData();
              formData.append('profilePicture', file);

              const response = await fetch(`${apiUrl}/api/upload-profile-picture`, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                body: formData,
              });
              const responseData = await response.json();
              console.log('Upload profile picture response:', response.status, responseData);

              if (response.ok) {
                setUserData((prev) => ({ ...prev, image: responseData.imageUrl }));
                localStorage.setItem('userData', JSON.stringify({ ...userData, image: responseData.imageUrl }));
                setSuccess('Profile picture updated successfully!');
                return true;
              } else {
                setError(responseData.message || 'Failed to upload profile picture');
                return false;
              }
            } catch (err) {
              console.error('Upload profile picture error:', err);
              setError('Error uploading profile picture. Please try again.');
              return false;
            } finally {
              setLoading(false);
            }
          },
          [apiUrl, token, userData]
        ),
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
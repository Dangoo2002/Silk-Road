'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import styles from './signup.module.css';
import { AiOutlineUser } from 'react-icons/ai';
import { FaEnvelope, FaLock, FaCheckCircle, FaExclamationCircle, FaEye, FaEyeSlash } from 'react-icons/fa';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const router = useRouter(); 

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://silkroadbackend.vercel.app';

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { fullName, email, password, confirmPassword } = formData;

    
    if (!fullName || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (/^[0-9]+$/.test(password) || /^[a-zA-Z]+$/.test(password)) {
      setError("Password must contain both letters and numbers");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      console.log('Attempting to sign up with URL:', `${apiUrl}/signup`);
      const response = await fetch(`${apiUrl}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || response.statusText || 'Error signing up';
        console.error('Signup Error:', errorMessage, errorData);
        setError(errorMessage);
        setSuccess('');
        return;
      }

      const data = await response.json();
      console.log('Signup successful:', data);
      setSuccess('Signup successful!');
      setError('');

      setFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

     
      router.push('/login');

    } catch (error) {
      console.error('Fetch error:', error);
      setError('Network error. Please try again.');
      setSuccess('');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); 
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={styles.signupContainer}>
      <div className={styles.signupCard}>
        <div className={styles.imageContainer}>
          <img src="/silkroadlogo.jpeg" alt="Signup" className={styles.signupImage} />
        </div>
        <div className={styles.formContainer}>
          <h1 className={styles.signupTitle}>Sign Up</h1>
          {error && (
            <div className={styles.errorBanner}>
              <FaExclamationCircle className={styles.errorIcon} />
              {error}
            </div>
          )}
          {success && (
            <div className={styles.successBanner}>
              <FaCheckCircle className={styles.successIcon} />
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit} className={styles.signupForm}>
            <div className={styles.signupFormGroup}>
              <label className={styles.signupLabel}>Full Name:</label>
              <div className={styles.inputGroup}>
                <AiOutlineUser className={styles.icon} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={styles.signupInput}
                  required
                />
              </div>
            </div>

            <div className={styles.signupFormGroup}>
              <label className={styles.signupLabel}>Email:</label>
              <div className={styles.inputGroup}>
                <FaEnvelope className={styles.icon} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.signupInput}
                  required
                />
              </div>
            </div>

            <div className={styles.signupFormGroup}>
              <label className={styles.signupLabel}>Password:</label>
              <div className={styles.inputGroup}>
                <FaLock className={styles.icon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={styles.signupInput}
                  required
                />
                <button type="button" onClick={toggleShowPassword} className={styles.showPasswordButton}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className={styles.signupFormGroup}>
              <label className={styles.signupLabel}>Confirm Password:</label>
              <div className={styles.inputGroup}>
                <FaLock className={styles.icon} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={styles.signupInput}
                  required
                />
                <button type="button" onClick={toggleShowPassword} className={styles.showPasswordButton}>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.signupButton}>Sign Up</button>

            <div className={styles.loginLink}>
              Already have an account? <a href="/login">Log in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

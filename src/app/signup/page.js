'use client';

import { useState } from 'react';
import styles from './signup.module.css'; // Import the CSS module

export default function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Send form data to the backend
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    if (response.ok) {
      setSuccess('Signup successful!');
      setError('');
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } else {
      const errorMessage = await response.text();
      setError(errorMessage || 'Error signing up');
      setSuccess('');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className={styles.signupContainer}>
      <h1 className={styles.signupHeading}>Sign Up</h1>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {success && <p className={styles.successMessage}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className={styles.formField}>
          <label className={styles.label}>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
        </div>

        <div className={styles.formField}>
          <label className={styles.label}>Confirm Password:</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={styles.inputField}
            required
          />
        </div>

        <button type="submit" className={styles.submitButton}>Sign Up</button>
      </form>
    </div>
  );
}

'use client'

import { useState } from 'react';
import styles from './login.module.css'; // Import the CSS module

export default function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Simulating a login API call
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert('Login successful!');
      // Redirect or perform further actions
    } else {
      alert('Error logging in');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className={styles.loginContainer}>
      <h1 className={styles.loginTitle}>Login</h1>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <div className={styles.loginFormGroup}>
          <label className={styles.loginLabel}>Username:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className={styles.loginInput}
          />
        </div>

        <div className={styles.loginFormGroup}>
          <label className={styles.loginLabel}>Password:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className={styles.loginInput}
          />
        </div>

        <button type="submit" className={styles.loginButton}>Login</button>
      </form>
    </div>
  );
}

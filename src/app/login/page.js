'use client';
import { useRouter } from 'next/navigation';
import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../components/AuthContext/AuthContext';
import styles from './login.module.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

export default function Login() {
  const { login, error, success, loading, isLoggedIn } = useContext(AuthContext);
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      console.log('User is logged in, redirecting to home page...');
      router.push('/');
    }
  }, [isLoggedIn, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginSuccess = await login(formData.email, formData.password);
    if (loginSuccess) {
      const userId = JSON.parse(localStorage.getItem('userData')).id; 
      localStorage.setItem('userId', userId);
      router.push('/');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.logoContainer}>
          <img src="/silkroadlogo.jpeg" alt="Logo" className={styles.logo} />
        </div>
        <div className={styles.formContainer}>
          <h1 className={styles.loginTitle}>Login</h1>
      
          {success && <div className={styles.successMessage}>{success}</div>}
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.loginFormGroup}>
              <label className={styles.loginLabel}>Email:</label>
              <FaEnvelope className={styles.icon} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={styles.loginInput}
                placeholder="Enter your email"
              />
            </div>
            <div className={styles.loginFormGroup}>
              <label className={styles.loginLabel}>Password:</label>
              <FaLock className={styles.icon} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={styles.loginInput}
                placeholder="Enter your password"
              />
              {showPassword ? (
                <FaEyeSlash className={styles.showPassword} onClick={toggleShowPassword} />
              ) : (
                <FaEye className={styles.showPassword} onClick={toggleShowPassword} />
              )}
            </div>
            <button type="submit" className={styles.loginButton} disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <div className={styles.signupLink}>
              Don't have an account? <Link href="/signup">Sign up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

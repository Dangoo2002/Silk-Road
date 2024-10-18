
'use client';

import { useRouter } from 'next/navigation';
import { useContext, useState } from 'react';
import { AuthContext } from '../components/AuthContext/AuthContext';
import styles from './login.module.css'; 
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';

export default function Login() {
    const { login } = useContext(AuthContext); 
    const router = useRouter();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await login(formData.username, formData.password);
        if (success) {
            router.push('/'); 
        } else {
            alert('Error logging in');
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
                    <form onSubmit={handleSubmit} className={styles.loginForm}>
                        <div className={styles.loginFormGroup}>
                            <label className={styles.loginLabel}>Username:</label>
                            <FaEnvelope className={styles.icon} />
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
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
                        <button type="submit" className={styles.loginButton}>Login</button>
                        <div className={styles.signupLink}>
                            Don't have an account? <Link href="/signup">Sign up</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

'use client';
import { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import styles from './navbar.module.css';
import { FaUser, FaCaretDown } from 'react-icons/fa';
import Loader from '../loader/page';

export default function Nav() {
  const { logout, isLoggedIn, userData } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  const handleLogout = async () => {
    setLoading(true);
    await logout();
    setDropdownOpen(false);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/';
    }, 2000);
  };

  const handleAccountRedirect = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      window.location.href = '/account';
    }, 2000);
  };

  return (
    <div className={`${styles.cardContainer} ${menuOpen ? styles.active : ''}`}>
      {loading && <Loader />}
      <div className={styles.navWrapper}>

        <Link href="/">
          <Image
            src="/silkroadlogo.jpeg"
            alt="Logo"
            width={150}
            height={50}
            className={styles.logoImage}
          />
        </Link>
        <button className={styles.hamburger} onClick={toggleMenu}>
          &#9776;
        </button>
        <nav className={`${styles.nav} ${menuOpen ? styles.showMenu : ''}`}>
          <ul className={styles.navList}>
            {isLoggedIn ? (
              <li className={styles.navItem}>
                <FaUser className={styles.navLink} onClick={handleAccountRedirect} />
                <FaCaretDown className={styles.dropdownIcon} onClick={toggleDropdown} />
                {dropdownOpen && (
                  <div className={styles.dropdownCard}>
                    <button onClick={handleAccountRedirect} className={styles.dropdownLink}>
                      Account
                    </button>
                    <button onClick={handleLogout} className={styles.logoutButton}>
                      Logout
                    </button>
                  </div>
                )}
              </li>
            ) : (
              <>
                <li className={styles.navItem}>
                  <Link href="/login" className={styles.navLink}>Login</Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/signup" className={styles.navLink}>Sign Up</Link>
                </li>
              </>
            )}
            <li className={styles.navItem}>
              <button className={styles.writeButton} style={{ backgroundColor: 'white', color: 'black' }}>
                <Link href="/write" className={styles.navLink}>Write</Link>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

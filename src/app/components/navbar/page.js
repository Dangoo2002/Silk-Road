'use client';
import { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import styles from './navbar.module.css';
import { FaUserCircle, FaCaretDown } from 'react-icons/fa';

export default function Nav() {
  const { logout, isLoggedIn, userData } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
  };

  const toggleDropdown = () => {
    setDropdownOpen((prevState) => !prevState);
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false); // Close dropdown on logout
  };

  return (
    <div className={`${styles.cardContainer} ${menuOpen ? styles.active : ''}`}>
      <div className={styles.navWrapper}>
        <Image
          src="/silkroadlogo.jpeg"
          alt="Logo"
          width={150}
          height={50}
          className={styles.logoImage}
        />
        <button className={styles.hamburger} onClick={toggleMenu}>
          &#9776;
        </button>
        <nav className={`${styles.nav} ${menuOpen ? styles.showMenu : ''}`}>
          <ul className={styles.navList}>
            {isLoggedIn ? (
              <li className={styles.navItem}>
                <FaUserCircle className={styles.navLink} onClick={toggleDropdown} />
                <FaCaretDown className={styles.dropdownIcon} onClick={toggleDropdown} />
                {dropdownOpen && (
                  <div className={styles.dropdownCard}>
                    <Link href="/account-details" className={styles.dropdownLink}>
                      Account
                    </Link>
                    <button onClick={handleLogout} className={styles.logoutButton}>Logout</button>
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
              <button className={styles.writeButton}>
                <Link href="/write" className={styles.navLink}>Write</Link>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}

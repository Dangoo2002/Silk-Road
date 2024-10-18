// components/Nav.js
'use client';

import { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import styles from './navbar.module.css';
import { FaUserCircle } from 'react-icons/fa';

export default function Nav() {
  const { user, login, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((prevState) => !prevState);
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
            {user ? (
              <li className={styles.navItem} onClick={toggleMenu}>
                <FaUserCircle className={styles.navLink} />
                <div className={styles.userCard}>
                  <Image src={user.image} alt={user.fullname} width={50} height={50} />
                  <p>{user.fullname}</p>
                  <Link href="/account-details">Account Details</Link>
                </div>
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

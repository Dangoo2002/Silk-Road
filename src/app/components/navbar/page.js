'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './navbar.module.css';

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div className={styles.navWrapper}>
      <Image
        src="/silkroadlogo.jpeg"
        alt="Moon Light Blog Logo"
        width={150}
        height={50}
        className={styles.logoImage}
      />

      {/* Hamburger menu button */}
      <button className={styles.hamburger} onClick={toggleMenu}>
        &#9776;
      </button>

      {/* Navigation links */}
      <nav className={`${styles.nav} ${menuOpen ? styles.showMenu : ''}`}>
        <ul className={styles.navList}>
          <li className={styles.navItem}><Link href="/login" className={styles.navLink}>Login</Link></li>
          <li className={styles.navItem}><Link href="/signup" className={styles.navLink}>Sign Up</Link></li>
          <li className={styles.navItem}>
            {/* Write as a button */}
            <button className={styles.writeButton}><Link href="/write" className={styles.navLink}>Write</Link></button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

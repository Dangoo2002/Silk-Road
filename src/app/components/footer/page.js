import React from 'react';
import styles from './footer.module.css';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerSection}>
        <h3>About Silk Road Blog</h3>
        <p>Silk Road Blog is your go-to platform for the latest articles, tips, and insights on technology, travel, lifestyle, and much more.</p>
      </div>

      <hr className={styles.hr} />

      <div className={styles.footerSection}>
        <h3>Quick Links</h3>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/blog">Blog</a></li>
          <li><Link href="/about">About Us</Link></li>
          <li><a href="/contact">Contact Us</a></li>
          <li><a href="/privacy">Privacy Policy</a></li>
        </ul>
      </div>

      <hr className={styles.hr} />

      <div className={styles.footerSection}>
        <h3>Connect with Us</h3>
        <div className={styles.socialIcons}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
            <FaFacebook />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
            <FaTwitter />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <FaInstagram />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <FaYoutube />
          </a>
        </div>
      </div>

      <hr className={styles.hr} />

      <div className={styles.copyright}>
        &copy; Silk Road 2024
      </div>
    </footer>
  );
};

export default Footer;

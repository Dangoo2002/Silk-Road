'use client';

import { useEffect, useState } from 'react';
import styles from './landing.module.css';

const fullText = "Welcome to Silk Road Blogs, where we share stories and experiences from travelers around the globe. Explore diverse cultures, hidden gems, and personal adventures shared by our community. Join us on this journey, connect with like-minded individuals, and ignite your wanderlust. Silk Road Blogs is your gateway to inspiration and travel insights, one story at a time. Whether you are planning a trip or reminiscing about past adventures, we have something for everyone. Dive into our blog and start your adventure today!";

export default function Get() {
    const [displayedText, setDisplayedText] = useState('');
    const [charIndex, setCharIndex] = useState(0);

    useEffect(() => {
        let typingInterval;
        
        const typeNextChar = () => {
            if (charIndex < fullText.length) {
                setDisplayedText((prev) => prev + fullText[charIndex]);
                setCharIndex((prev) => prev + 1);
            } else {
                clearInterval(typingInterval);
                setTimeout(() => {
                    setDisplayedText('');
                    setCharIndex(0);
                }, 1000); 
            }
        };

        typingInterval = setInterval(typeNextChar, 150); 

        return () => clearInterval(typingInterval); 
    }, [charIndex]);

    return (
        <div className={styles.landingContainer}>
            <div className={styles.card}>
                <h1 className={styles.heading}>{displayedText}</h1>
                <a href="/login" className={styles.getStartedButton}>Get Started</a>
            </div>
        </div>
    );
}

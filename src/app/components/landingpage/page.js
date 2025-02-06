'use client';

import { useEffect, useState } from 'react';
import styles from './landing.module.css';

const fullText = "Welcome to Silk Road Blogs, your go-to destination for the latest stories and insights in politics, technology, entertainment, and automobiles. From Kenya to the global stage, we cover key issues shaping the world today. Whether you're curious about the latest political developments, cutting-edge tech innovations, entertainment trends, or automotive advancements, we've got you covered!";

//export default function Get() {
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

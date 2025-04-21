'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const fullText = "Welcome to Silk Road Blogs, your go-to destination for the latest stories and insights in politics, technology, entertainment, and automobiles. From Kenya to the global stage, we've got you covered!";

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
        }, 3000); // Pause for readability
      }
    };

    typingInterval = setInterval(typeNextChar, 40); // Fast typing for dynamic feel

    return () => clearInterval(typingInterval);
  }, [charIndex]);

  return (
    <div
      className="min-h-screen bg-[var(--background)] bg-cover bg-center bg-no-repeat flex items-center justify-center px-4 py-8 relative"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5)), url('/bgg.jpeg')`,
      }}
    >
      <div className="container mx-auto max-w-3xl text-center relative z-10">
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-4 md:p-8 animate-fade-in">
          <h1 className="text-2xl md:text-4xl font-extrabold leading-tight mb-6 text-white relative">
            {displayedText}
            <span className="inline-block w-1 h-6 bg-white animate-blink ml-1 align-middle" />
          </h1>
          <Link
            href="/login"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-base rounded-full hover:from-blue-600 hover:to-purple-700 hover:scale-105 transition-all duration-300 shadow-lg animate-pulse-slow"
          >
            Get Started
          </Link>
        </div>
      </div>
      {/* Subtle animated particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="animate-particle-float w-2 h-2 bg-blue-400 rounded-full absolute top-10 left-20" />
        <div className="animate-particle-float w-3 h-3 bg-purple-400 rounded-full absolute bottom-20 right-30 delay-1000" />
        <div className="animate-particle-float w-2 h-2 bg-blue-300 rounded-full absolute top-40 right-10 delay-2000" />
      </div>
    </div>
  );
}
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import SocialMediaNav from '../components/navbar/page';

export default function AboutUs() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      <SocialMediaNav />
      <motion.main
        className="container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          About Silk Road Blogs
        </h1>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 mb-12">
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Silk Road Blogs is a dynamic platform that connects voices from around the world through engaging content in entertainment, lifestyle, and news. Our mission is to empower creators to share their stories and inspire readers with diverse perspectives, fostering a vibrant community of knowledge and creativity.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Our Story</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Founded in 2025, Silk Road Blogs was created to bridge the gap between creators and readers. We believe in the power of storytelling to inform, entertain, and unite. From breaking news to lifestyle tips, our platform offers something for everyone, curated with care and authenticity.
            </p>
          </section>
        </div>
        <motion.div
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700"
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-center">Meet Our Founder</h2>
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="relative">
              <Image
                src="/kennedywanakcha.jpeg" 
                alt="Kennedy Wanakcha, Founder"
                width={200}
                height={200}
                className="w-40 h-40 sm:w-48 sm:h-48 rounded-full object-cover border-4 border-indigo-500"
                onError={(e) => (e.target.src = '/def.jpg')}
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-600/20" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-semibold">Kennedy Wanakcha</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Founder & CEO</p>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 italic">
                “Silk Road Blogs was born from a vision to create a space where every story matters. Our goal is to amplify diverse voices and build a global community united by curiosity and creativity.”
              </p>
            </div>
          </div>
        </motion.div>
        <div className="mt-12 text-center">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4">Get in Touch</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
            Have questions or want to collaborate? Reach out to us!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="mailto:support@silkroadblogs.com"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full hover:from-indigo-600 hover:to-purple-700 transition-colors"
            >
              <EnvelopeIcon className="h-5 w-5" />
              Email Us
            </a>
            <a
              href="https://silkroadblogs.vercel.app/"
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <GlobeAltIcon className="h-5 w-5" />
              Visit Website
            </a>
          </div>
        </div>
      </motion.main>
      <footer className="bg-gray-900 text-gray-100 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Silk Road Blogs</h3>
              <p className="text-sm text-gray-400">
                A vibrant platform for entertainment, lifestyle, and news blogs.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/privacy" className="text-gray-400 hover:text-indigo-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-gray-400 hover:text-indigo-400 transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-indigo-400 transition-colors">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5V5.08c0-.88.66-1.62 1.54-1.62h2.23V.12A27.15 27.15 0 0 0 14.5 0c-3.91 0-6.58 2.38-6.58 6.75v3.71H5.23v4.34h2.69V24h3.23v-9.06h2.69l.42-4.34h-3.11V7.25c0-1.25.83-2.17 2.08-2.17h2.27v2.38z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.34-1.6.57-2.47.67  .89-.53 1.57-1.37 1.89-2.37-.83.49-1.75.85-2.73 1.04-.78-.83-1.89-1.35-3.12-1.35-2.36 0-4.28 1.92-4.28 4.28 0 .34.04.67.11 1-3.56-.18-6.72-1.89-8.84-4.48-.37.64-.58 1.37-.58 2.16 0 1.49.76 2.81 1.91 3.58-.7-.02-1.36-.22-1.94-.54v.05c0 2.08 1.48 3.82 3.45 4.21-.36.1-.74.15-1.13.15-.28 0-.55-.03-.81-.08.55 1.72 2.15 2.97 4.05 3.01-1.48 1.16-3.35 1.85-5.38 1.85-.35 0-.7-.02-1.04-.07 1.94 1.24 4.24 1.97 6.71 1.97 8.05 0 12.46-6.67 12.46-12.46 0-.19 0-.38-.01-.57.85-.61 1.59-1.38 2.17-2.25z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.04c-5.52 0-10 4.48-10 10 0 4.42 3.58 8.06 8.13 9.86.6.11.82-.26.82-.58v-2.17c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.85 1.24 1.85 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.31 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.31-1.23 3.31-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.69.82.58C18.42 20.1 22 16.46 22 12.04c0-5.52-4.48-10-10-10z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} Silk Road Blogs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
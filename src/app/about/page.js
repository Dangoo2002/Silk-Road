
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
                src="/kennedywanakacha.jpeg"
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
    </div>
  );
}

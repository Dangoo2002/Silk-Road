
'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import SocialMediaNav from '../components/navbar/page';

export default function TermsAndConditions() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
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
          Terms and Conditions
        </h1>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Acceptance of Terms</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              By accessing or using Silk Road Blogs, you agree to be bound by these Terms and Conditions. If you do not agree, please do not use our platform.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">User Accounts</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              To access certain features, you must create an account using Gmail via Firebase Authentication. You are responsible for maintaining the confidentiality of your account and for all activities under your account.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Content Guidelines</h2>
            <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 dark:text-gray-300 space-y-2">
              <li>You may post blogs, comments, and other content that complies with our guidelines.</li>
              <li>Content must not be illegal, offensive, or infringe on others’ rights.</li>
              <li>We reserve the right to remove any content that violates these terms.</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Intellectual Property</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Content you post remains your property, but by posting, you grant Silk Road Blogs a non-exclusive, royalty-free license to use, display, and distribute it on our platform.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Limitation of Liability</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Silk Road Blogs is provided “as is” without warranties. We are not liable for any damages arising from your use of the platform.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Termination</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              We may suspend or terminate your account for violating these terms. You may delete your account at any time by contacting us.
            </p>
          </section>
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              For questions about these Terms and Conditions, please contact us at:
            </p>
            <ul className="list-none text-sm sm:text-base text-gray-600 dark:text-gray-300 space-y-2 mt-2">
              <li className="flex items-center gap-2">
                <EnvelopeIcon className="h-5 w-5 text-indigo-500" />
                <a href="mailto:support@silkroadblogs.com" className="hover:underline">
                  support@silkroadblogs.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <GlobeAltIcon className="h-5 w-5 text-indigo-500" />
                <a href="https://silkroadblogs.vercel.app/" className="hover:underline">
                  silkroadblogs.vercel.app
                </a>
              </li>
            </ul>
          </section>
        </div>
      </motion.main>
    </div>
  );
}


'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { EnvelopeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import SocialMediaNav from '../components/navbar/page';

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl shadow-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700">
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              At Silk Road Blogs, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your data when you use our platform, which offers a variety of blogs from entertainment to lifestyle to news. By using our services, you agree to the terms outlined in this policy.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Information We Collect</h2>
            <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 dark:text-gray-300 space-y-2">
              <li>
                <strong>Personal Information:</strong> When you sign up using Gmail via Firebase Authentication, we collect your name, email address, and profile picture.
              </li>
              <li>
                <strong>Content Data:</strong> Posts, comments, and profile information you share on the platform.
              </li>
              <li>
                <strong>Usage Data:</strong> Information about how you interact with our site, such as pages visited, time spent, and IP address.
              </li>
              <li>
                <strong>Cookies:</strong> We use cookies to enhance your experience, such as remembering your login state.
              </li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 dark:text-gray-300 space-y-2">
              <li>To provide and personalize your experience on Silk Road Blogs.</li>
              <li>To manage your account and authenticate your login via Gmail.</li>
              <li>To analyze usage patterns and improve our services.</li>
              <li>To communicate with you, including sending updates or notifications.</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Data Sharing</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base text-gray-600 dark:text-gray-300 space-y-2">
              <li>Service providers like Firebase for authentication and analytics.</li>
              <li>Legal authorities if required by law or to protect our rights.</li>
            </ul>
          </section>
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Your Rights</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              You have the right to access, update, or delete your personal information. Contact us at{' '}
              <a href="mailto:support@silkroadblogs.com" className="text-indigo-500 hover:underline">
                support@silkroadblogs.com
              </a>{' '}
              to exercise these rights.
            </p>
          </section>
          <section className="mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Security</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              We use industry-standard measures, including Firebase’s security protocols, to protect your data. However, no system is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              For questions about this Privacy Policy, please contact us at:
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

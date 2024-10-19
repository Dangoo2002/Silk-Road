'use client';
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "./components/AuthContext/AuthContext";
import NavigationLoader from './components/navigationEvents'; // Ensure the path is correct
import Loader from "./components/loader/page"; // Ensure the path is correct
import { useState } from 'react'; // Import useState

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});


function Metadata() {
  return (
    <>
      <title>Silk Road-BLogs</title>
      <meta name="description" content="Blog App" />
    </>
  );
}
export default function RootLayout({ children }) {
  const [loading, setLoading] = useState(true); // Add loading state

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
        <head>
          <Metadata />
        </head>
          <NavigationLoader>
            {loading ? (
              <Loader setLoading={setLoading} /> // Show Loader while loading
            ) : (
              children // Render children once loading is complete
            )}
          </NavigationLoader>
        </AuthProvider>
      </body>
    </html>
  );
}

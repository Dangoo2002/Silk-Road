'use client';
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "./components/AuthContext/AuthContext";


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
      <title>Silk Road Blogs</title>
      <meta name="description" content="A platform for sharing and exploring blog posts." />
    </>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider>
          <head>
            <Metadata />
          </head>
          <NavigationLoader>
            {children}
          </NavigationLoader>
        </AuthProvider>
      </body>
    </html>
  );
}
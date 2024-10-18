import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "./components/AuthContext/page";

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

export const metadata = {
  title: "Silk Road-BLog App",
  description: "Blog App",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthProvider> 
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

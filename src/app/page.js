import React from 'react';
import Nav from "./components/navbar/page";
import Footer from './components/footer/page';
import { AuthProvider } from './components/AuthContext/AuthContext';
import './page.module.css';

export default function Home() {
  return (
    <AuthProvider>
      <div className="page-container"> 
        <Nav />
        <div className="content-wrap">
    

    
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}

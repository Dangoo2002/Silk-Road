import React from 'react';
import Nav from "./components/navbar/page";
import { AuthProvider } from './components/AuthContext/page';
import './page.module.css';

export default function Home() {
  return (
    <AuthProvider>
    <div className="page"> 
      <Nav />
      <div className="main">
   
      </div>
      <div className="footer">
      
      </div>
    </div>
    </AuthProvider>
  );
}

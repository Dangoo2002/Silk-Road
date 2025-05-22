import React from 'react';
import Nav from "./components/navbar/page";
import { AuthProvider } from './components/AuthContext/AuthContext';
import Get from './components/landingpage/page';
import './page.module.css';


export default function Home() {
  return (
    <AuthProvider>
      <div className="page-container"> 
        <Nav />
        <Get />
        <div className="content-wrap">
        </div>
      </div>
    </AuthProvider>
  );
}

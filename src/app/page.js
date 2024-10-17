import React from 'react';
import Nav from "./components/navbar/page";
import './page.module.css';

export default function Home() {
  return (
    <div className="page"> {/* Apply the CSS class here */}
      <Nav />
      <div className="main">
        {/* Your main content goes here */}
      </div>
      <div className="footer">
        {/* Your footer content goes here */}
      </div>
    </div>
  );
}

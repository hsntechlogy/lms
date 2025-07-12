// vite-project/src/components/students/Footer.jsx
import React from 'react';
import { assets } from '../../assets/assets';

const Footer = () => (
  <footer className="flex md:flex-row flex-col-reverse items-center justify-between text-left w-full px-8 border-t">
    <div className='flex items-center-center gap-4'>
      <img className='hidden md:block w-20' src={assets.logo} />
      <div className='hidden md:block h-7 w-px bg-gray-500/60'></div>
      <p className='py-4 text-center text-xs md:text-sm text-gray-500'>
        © 2024 Your LMS. All rights reserved.
      </p>
    </div>
    <div className='flex items-center text-xs md:text-sm' >
      <a href='#'>
        <img src={assets.facebook_icon} />
      </a>
      <a href='#'>
        <img src={assets.twitter_icon} />
      </a>
      <a href='#'>
        <img src={assets.instagram_icon} />
      </a>
    </div>
  </footer>
);

export default Footer;

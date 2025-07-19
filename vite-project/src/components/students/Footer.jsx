
import React from 'react';
import { Link } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Footer = () => {
  const handleWhatsAppContact = () => {
    const phoneNumber = '+1234567890'; // Replace with actual WhatsApp number
    const message = 'Hello! I have a question about your courses.';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <footer className="bg-gray-900 md:px-36 text-left w-full mt-10">
      <div className='flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30'>
        <div className='flex flex-col md:items-start items-center w-full'>
          <img src={assets.logo_dark} alt='logo' />
          <p className='mt-6 text-center md:text-left text-sm text-white/80'>
            Empowering learners worldwide with quality education and interactive learning experiences.
          </p>
        </div>
        <div className='flex flex-col md:items-start items-center w-full'>
          <h2 className='font-semibold text-white mb-5'>Quick Links</h2>
          <ul className='flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2'>
            <li>
              <Link to="/" className="hover:text-white transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/courses" className="hover:text-white transition-colors">
                Courses
              </Link>
            </li>
            <li>
              <Link to="/live-classes" className="hover:text-white transition-colors">
                Live Classes
              </Link>
            </li>
            <li>
              <button 
                onClick={handleWhatsAppContact}
                className="hover:text-white transition-colors"
              >
                Contact Us
              </button>
            </li>
            <li>
              <Link to="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
        <div className='hidden md:flex flex-col items-start w-full'>
          <h2 className='font-semibold text-white mb-5'>Subscribe to our newsletter</h2>
          <p className='text-sm text-white/80 mb-4'>
            Get the latest news, articles and resources sent to your inbox weekly
          </p>
          <div className='flex items-center gap-2'>
            <input 
              type='email' 
              placeholder='Your email' 
              className='border border-gray-500/30 bg-gray-800 text-gray-300 placeholder-gray-500 outline-none w-64 h-9 rounded px-2 text-sm'
            />
            <button className='bg-blue-600 w-24 h-9 text-white rounded hover:bg-blue-700 transition-colors'>
              Subscribe
            </button>
          </div>
        </div>
      </div>
      <p className='py-4 text-center text-xs md:text-sm text-white/60'>
        Copyright 2025 © Abdullah. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
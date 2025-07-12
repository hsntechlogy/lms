
import  React from 'react'
import { assets } from '../../assets/assets';

const Footer = () => {
  return (
    <footer className=" bg-gray-900 md:px-36 text-left w-full mt-10 ">
      <div className='flex flex-col md:flex-row items-start px-8 md:px-0 justify-center  gap-10 md:gap-32 py-10 border-b border-white/30' >
        <div className='flex flex-col md:items-start items-center w-full' >
            <img src={assets.logo_dark} alt='logo' />
            < p className='mt-6 text-center md:text-left text-sm text-white/80' >helo gayjsgag g g s gu wuw gffsghf i a     ass  qss  dd fg</p>
        </div>
        <div className='flex flex-col md:items-start items-center w-full'>
            <h2 className='font-semibold text-white- mb-5' >company</h2>
            <ul className='flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2' >
                <li><a></a>Home</li>
                   <li><a></a>aboutus</li>
                      <li><a></a>contactus</li>
                         <li><a></a>privacypolicy</li>                            
            </ul>
        </div>
        <div className='hidden md:flex  flex-col items-start w-full' >
            <h2 className='font-semibold text-white mb-5' > Subscribe to our newsletter </h2>
            < p className='text-sm text-white/80' > the latest news article and resources sent to your inbox weekly</p>
            <div className='flex items-center gap-2 pyt-4'>
                <input type='email' placeholder='your email' 
                className='border border-gray-500/30 by-gary-800 text-gary-500 placeholder-gary-500 outline-none w-64 h-9 rounded px-2 text-sm' />
                <button className='bg-blue-600 w-24 h-9 text-white rounded' >subsribce</button>
            </div>
        </div>
      </div>
      < p className='py-4 text-center text-xs md:text-sm text-white/60' >Copyright 2025 © Abdullah all   </p>
    </footer>
  );
}       
export default Footer;
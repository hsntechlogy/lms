import React from 'react';
import Navbar from '../../components/educator/Navbar';
import Sidebar from '../../components/educator/Sidebar';
import { Outlet } from 'react-router-dom';
import Footer from '../../components/educator/Footer';

const Educator = () => (
  <div className='text-default min-h-screen bg-white' >
    <Navbar/>
   <div className='flex' >
    <Sidebar/>
    <div className='flex-1' >
    {<Outlet/>}
    </div>
   </div>
   <Footer/>
  </div>
);

export default Educator;

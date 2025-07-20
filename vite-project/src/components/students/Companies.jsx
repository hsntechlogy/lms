import React, { useEffect, useRef, useState } from 'react';
import { assets } from '../../assets/assets';

const companyLogos = [
  { src: assets.microsoft_logo, alt: 'Microsoft' },
  { src: assets.walmart_logo, alt: 'Walmart' },
  { src: assets.accenture_logo, alt: 'Accenture' },
  { src: assets.adobe_logo, alt: 'Adobe' },
  { src: assets.paypal_logo, alt: 'Paypal' },
];

const Companies = () => {
  const [index, setIndex] = useState(0);
  const visibleCount = 4; // logos visible at once on large screens
  const intervalRef = useRef();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex(prev => (prev + 1) % companyLogos.length);
    }, 2200);
    return () => clearInterval(intervalRef.current);
  }, []);

  // For small screens, show all logos in a row
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  let logosToShow = companyLogos;
  if (!isMobile) {
    // Carousel logic for desktop
    logosToShow = [];
    for (let i = 0; i < visibleCount; i++) {
      logosToShow.push(companyLogos[(index + i) % companyLogos.length]);
    }
  }

  return (
    <div className="pt-16">
      <p className='text-base text-gray-500 mb-4'>Trusted by</p>
      <div className='overflow-hidden w-full md:px-0 px-2'>
        <div className='carousel-track gap-6 md:gap-16 flex items-center justify-center md:mt-10 mt-5'>
          {logosToShow.map((logo, i) => (
            <img
              key={i}
              src={logo.src}
              alt={logo.alt}
              className='w-20 md:w-28 flex-shrink-0'
              style={{marginRight: i === logosToShow.length - 1 ? 0 : undefined}}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default Companies;